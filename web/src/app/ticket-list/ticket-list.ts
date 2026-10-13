import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, type PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TicketForm } from '../ticket-form/ticket-form';
import { apiErrorMessage } from '../api-error';
import { PRIORITY_LABELS, PRIORITY_SEVERITY, STATUS_LABELS, STATUS_OPTIONS } from '../labels';
import { type TicketPriority, TicketsApi, type TicketStatus } from '../tickets.api';

@Component({
  selector: 'app-ticket-list',
  imports: [
    ButtonModule,
    DatePipe,
    DialogModule,
    FormsModule,
    MessageModule,
    PaginatorModule,
    SelectModule,
    TableModule,
    TagModule,
    TicketForm,
  ],
  templateUrl: './ticket-list.html',
})
export class TicketList {
  private readonly api = inject(TicketsApi);
  private readonly queryClient = inject(QueryClient);
  private readonly messages = inject(MessageService);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly apiErrorMessage = apiErrorMessage;
  protected readonly limit = 10;

  protected readonly createDialogOpen = signal(false);
  protected readonly statusFilter = signal<TicketStatus | null>(null);
  protected readonly page = signal(1);

  // The key includes filter + page, so each combination is cached separately.
  protected readonly tickets = injectQuery(() => ({
    queryKey: ['tickets', 'list', { status: this.statusFilter(), page: this.page() }],
    queryFn: () =>
      this.api.list({
        status: this.statusFilter() ?? undefined,
        page: this.page(),
        limit: this.limit,
      }),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  }));

  protected readonly updateStatus = injectMutation(() => ({
    mutationFn: ({ id, status }: { id: number; status: TicketStatus }) =>
      this.api.update(id, { status }),
    onSuccess: (ticket) =>
      this.messages.add({
        severity: 'success',
        summary: 'Status updated',
        detail: `#${ticket.id} ${ticket.title} is now ${STATUS_LABELS[ticket.status]}`,
      }),
    onError: (error) =>
      this.messages.add({
        severity: 'error',
        summary: 'Could not update status',
        detail: apiErrorMessage(error),
      }),
    // A status change moves the ticket between filters and changes the counts.
    onSettled: () => this.queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  }));

  protected priorityTag(priority: TicketPriority) {
    return { label: PRIORITY_LABELS[priority], severity: PRIORITY_SEVERITY[priority] };
  }

  protected onFilterChange(status: TicketStatus | null) {
    this.statusFilter.set(status);
    this.page.set(1);
  }

  protected onPageChange({ page = 0 }: PaginatorState) {
    this.page.set(page + 1);
  }

  protected onStatusChange(id: number, status: TicketStatus) {
    this.updateStatus.mutate({ id, status });
  }
}
