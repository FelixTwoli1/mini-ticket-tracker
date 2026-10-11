import type { Ticket } from '../generated/prisma/client.js';
import { TicketPriority, TicketStatus } from '../generated/prisma/enums.js';

// The API speaks the lowercase values from the spec; code uses uppercase enums.
// These maps are the only place the two meet.

export const STATUS_TO_API = {
  [TicketStatus.OPEN]: 'open',
  [TicketStatus.IN_PROGRESS]: 'in_progress',
  [TicketStatus.CLOSED]: 'closed',
} as const satisfies Record<TicketStatus, string>;

export const PRIORITY_TO_API = {
  [TicketPriority.LOW]: 'low',
  [TicketPriority.MEDIUM]: 'medium',
  [TicketPriority.HIGH]: 'high',
} as const satisfies Record<TicketPriority, string>;

export type ApiTicketStatus = (typeof STATUS_TO_API)[TicketStatus];
export type ApiTicketPriority = (typeof PRIORITY_TO_API)[TicketPriority];

export const API_STATUSES = Object.values(STATUS_TO_API);
export const API_PRIORITIES = Object.values(PRIORITY_TO_API);

export const STATUS_FROM_API = invert(STATUS_TO_API);
export const PRIORITY_FROM_API = invert(PRIORITY_TO_API);

export function toApiTicket(ticket: Ticket) {
  return {
    ...ticket,
    status: STATUS_TO_API[ticket.status],
    priority: PRIORITY_TO_API[ticket.priority],
  };
}

function invert<K extends string, V extends string>(map: Record<K, V>) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<V, K>;
}
