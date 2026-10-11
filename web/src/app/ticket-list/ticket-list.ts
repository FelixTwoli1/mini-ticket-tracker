import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { injectQuery, keepPreviousData } from '@tanstack/angular-query-experimental';
import { PRIORITY_LABELS, STATUS_LABELS } from '../labels';
import { TICKET_STATUSES, TicketsApi, TicketStatus } from '../tickets.api';

@Component({
  selector: 'app-ticket-list',
  imports: [DatePipe],
  templateUrl: './ticket-list.html',
})
export class TicketList {
  private readonly api = inject(TicketsApi);

  protected readonly statuses = TICKET_STATUSES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly limit = 10;

  protected readonly statusFilter = signal<TicketStatus | ''>('');
  protected readonly page = signal(1);

  // The key includes filter + page, so each combination is cached separately.
  protected readonly tickets = injectQuery(() => ({
    queryKey: ['tickets', 'list', { status: this.statusFilter(), page: this.page() }],
    queryFn: () =>
      this.api.list({
        status: this.statusFilter() || undefined,
        page: this.page(),
        limit: this.limit,
      }),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  }));

  protected onFilterChange(value: string) {
    this.statusFilter.set(value as TicketStatus | '');
    this.page.set(1);
  }
}
