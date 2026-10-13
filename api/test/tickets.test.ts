import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

const app = createApp();

function createTicket(body: Record<string, unknown>) {
  return request(app).post('/tickets').send(body);
}

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE tickets RESTART IDENTITY`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /tickets', () => {
  it('creates a ticket with default status and priority', async () => {
    const res = await createTicket({ title: 'Printer offline', description: 'Floor 2' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      title: 'Printer offline',
      description: 'Floor 2',
      status: 'open',
      priority: 'medium',
    });
    expect(new Date(res.body.createdAt).getTime()).not.toBeNaN();

    // Lowercase over the API, uppercase enums inside the app.
    const stored = await prisma.ticket.findUniqueOrThrow({ where: { id: res.body.id } });
    expect(stored).toMatchObject({ status: 'OPEN', priority: 'MEDIUM' });
  });

  it('rejects a ticket without a title', async () => {
    const res = await createTicket({ description: 'No title here' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toContainEqual(expect.objectContaining({ field: 'title' }));
    expect(await prisma.ticket.count()).toBe(0);
  });
});

describe('GET /tickets', () => {
  it('filters by status and paginates newest first', async () => {
    for (const title of ['A', 'B', 'C']) await createTicket({ title });
    await createTicket({ title: 'Done', status: 'closed' });

    const res = await request(app).get('/tickets?status=open&page=2&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
    expect(res.body.data.map((t: { title: string }) => t.title)).toEqual(['A']);
  });

  it('filters by priority, alone and combined with status', async () => {
    await createTicket({ title: 'Urgent open', priority: 'high' });
    await createTicket({ title: 'Urgent closed', priority: 'high', status: 'closed' });
    await createTicket({ title: 'Minor', priority: 'low' });

    const high = await request(app).get('/tickets?priority=high');
    expect(high.body.data.map((t: { title: string }) => t.title)).toEqual([
      'Urgent closed',
      'Urgent open',
    ]);

    const highOpen = await request(app).get('/tickets?priority=high&status=open');
    expect(highOpen.body.data.map((t: { title: string }) => t.title)).toEqual(['Urgent open']);
    expect(highOpen.body.meta.total).toBe(1);
  });

  it('rejects an unknown status filter', async () => {
    const res = await request(app).get('/tickets?status=pending');

    expect(res.status).toBe(400);
  });

  it('rejects an unknown priority filter', async () => {
    const res = await request(app).get('/tickets?priority=urgent');

    expect(res.status).toBe(400);
  });
});

describe('PATCH /tickets/:id', () => {
  it('updates status and priority', async () => {
    const { body: ticket } = await createTicket({ title: 'Login fails' });

    const res = await request(app)
      .patch(`/tickets/${ticket.id}`)
      .send({ status: 'in_progress', priority: 'high' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: ticket.id, status: 'in_progress', priority: 'high' });
  });

  it('returns 404 for a ticket that does not exist', async () => {
    const res = await request(app).patch('/tickets/9999').send({ status: 'closed' });

    expect(res.status).toBe(404);
  });

  it('rejects fields other than status and priority', async () => {
    const { body: ticket } = await createTicket({ title: 'Original' });

    const res = await request(app).patch(`/tickets/${ticket.id}`).send({ title: 'Changed' });

    expect(res.status).toBe(400);
  });
});

describe('GET /tickets/stats', () => {
  it('returns counts for every status, including zero', async () => {
    await createTicket({ title: 'One' });
    await createTicket({ title: 'Two' });
    await createTicket({ title: 'Three', status: 'closed' });

    const res = await request(app).get('/tickets/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ open: 2, in_progress: 0, closed: 1 });
  });
});

describe('GET /openapi.json', () => {
  it('documents every ticket endpoint', async () => {
    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.1.0');
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/tickets', '/tickets/{id}', '/tickets/stats']),
    );
    expect(Object.keys(res.body.paths['/tickets'])).toEqual(['get', 'post']);
  });
});
