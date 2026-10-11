import { prisma } from '../db.js';
import type { CreateTicketInput } from './tickets.schemas.js';

export function createTicket(input: CreateTicketInput) {
  return prisma.ticket.create({ data: input });
}
