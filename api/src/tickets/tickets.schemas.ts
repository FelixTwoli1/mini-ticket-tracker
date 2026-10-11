import { z } from 'zod';
import {
  API_PRIORITIES,
  API_STATUSES,
  PRIORITY_FROM_API,
  STATUS_FROM_API,
} from './tickets.mapper.js';

// Accept the lowercase API values and hand the service the uppercase enums.
const statusSchema = z.enum(API_STATUSES).transform((value) => STATUS_FROM_API[value]);
const prioritySchema = z.enum(API_PRIORITIES).transform((value) => PRIORITY_FROM_API[value]);

export const createTicketSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().max(5000).optional(),
    status: statusSchema.optional(),
    priority: prioritySchema.optional(),
  })
  .strict();

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const listTicketsQuerySchema = z.object({
  status: statusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;

export const ticketParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// The spec only allows status and priority to change after creation.
export const updateTicketSchema = z
  .object({
    status: statusSchema.optional(),
    priority: prioritySchema.optional(),
  })
  .strict()
  .refine((body) => body.status !== undefined || body.priority !== undefined, {
    message: 'Provide status and/or priority',
  });

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
