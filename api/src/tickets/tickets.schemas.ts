import { z } from 'zod';
import { TicketPriority, TicketStatus } from '../generated/prisma/enums.js';

export const createTicketSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().max(5000).optional(),
    status: z.enum(TicketStatus).optional(),
    priority: z.enum(TicketPriority).optional(),
  })
  .strict();

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const listTicketsQuerySchema = z.object({
  status: z.enum(TicketStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
