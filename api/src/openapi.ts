import { z } from 'zod';
import { API_PRIORITIES, API_STATUSES } from './tickets/tickets.mapper.js';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  updateTicketSchema,
} from './tickets/tickets.schemas.js';

// The OpenAPI document is generated from the same zod schemas that validate requests,
// so the docs cannot drift from the code. Response schemas below exist for documentation.

const ticketSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(API_STATUSES),
  priority: z.enum(API_PRIORITIES),
  createdAt: z.iso.datetime(),
});

const ticketPageSchema = z.object({
  data: z.array(ticketSchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});

const ticketStatsSchema = z.object(
  Object.fromEntries(API_STATUSES.map((status) => [status, z.number().int()])),
);

const errorSchema = z.object({
  error: z.object({
    message: z.string(),
    details: z.array(z.object({ field: z.string().optional(), message: z.string() })).optional(),
  }),
});

function jsonSchema(schema: z.ZodType) {
  // 'input' describes what clients send (lowercase enums, before transforms).
  const { $schema: _ignored, ...rest } = z.toJSONSchema(schema, { io: 'input' });
  return rest;
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: object) => ({ 'application/json': { schema } });
const errorResponse = (description: string) => ({ description, content: json(ref('Error')) });

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Mini Ticket Tracker API',
    version: '1.0.0',
    description: 'Create, list, update and count support tickets.',
  },
  servers: [{ url: '/' }],
  components: {
    schemas: {
      Ticket: jsonSchema(ticketSchema),
      TicketPage: jsonSchema(ticketPageSchema),
      TicketStats: jsonSchema(ticketStatsSchema),
      CreateTicket: jsonSchema(createTicketSchema),
      UpdateTicket: {
        ...jsonSchema(updateTicketSchema),
        minProperties: 1,
        description: 'Provide status and/or priority.',
      },
      Error: jsonSchema(errorSchema),
    },
  },
  paths: {
    '/tickets': {
      get: {
        summary: 'List tickets, newest first',
        tags: ['Tickets'],
        parameters: Object.entries(listTicketsQuerySchema.shape).map(([name, schema]) => ({
          name,
          in: 'query',
          required: false,
          schema: jsonSchema(schema),
        })),
        responses: {
          200: { description: 'A page of tickets', content: json(ref('TicketPage')) },
          400: errorResponse('Invalid query parameters'),
        },
      },
      post: {
        summary: 'Create a ticket',
        tags: ['Tickets'],
        requestBody: { required: true, content: json(ref('CreateTicket')) },
        responses: {
          201: { description: 'The created ticket', content: json(ref('Ticket')) },
          400: errorResponse('Validation failed'),
        },
      },
    },
    '/tickets/{id}': {
      patch: {
        summary: "Update a ticket's status or priority",
        tags: ['Tickets'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: { required: true, content: json(ref('UpdateTicket')) },
        responses: {
          200: { description: 'The updated ticket', content: json(ref('Ticket')) },
          400: errorResponse('Validation failed'),
          404: errorResponse('Ticket not found'),
        },
      },
    },
    '/tickets/stats': {
      get: {
        summary: 'Count tickets by status',
        tags: ['Tickets'],
        responses: {
          200: { description: 'Counts for every status, including zero', content: json(ref('TicketStats')) },
        },
      },
    },
  },
};
