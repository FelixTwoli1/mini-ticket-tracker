import { TICKET_PRIORITIES, TICKET_STATUSES, type TicketPriority, type TicketStatus } from './tickets.api';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_SEVERITY: Record<TicketPriority, TagSeverity> = {
  low: 'secondary',
  medium: 'warn',
  high: 'danger',
};

export const STATUS_OPTIONS = TICKET_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }));

export const PRIORITY_OPTIONS = TICKET_PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));
