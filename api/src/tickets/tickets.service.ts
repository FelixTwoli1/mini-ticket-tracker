import { prisma } from '../db.js';
import type { CreateTicketInput, ListTicketsQuery } from './tickets.schemas.js';

export function createTicket(input: CreateTicketInput) {
  return prisma.ticket.create({ data: input });
}

export async function listTickets({ status, page, limit }: ListTicketsQuery) {
  const where = status ? { status } : {};

  // Count and page in one transaction so meta.total matches the data snapshot.
  const [total, data] = await prisma.$transaction([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      // id breaks ties so rows with the same timestamp keep a stable order across pages
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
