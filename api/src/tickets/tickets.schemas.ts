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
