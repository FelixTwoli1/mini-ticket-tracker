import type { TicketPriority, TicketStatus } from './tickets.api';

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

export const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as TicketStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));
