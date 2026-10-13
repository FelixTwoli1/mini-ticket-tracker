import { Component, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { apiErrorMessage } from '../api-error';
import { PRIORITY_OPTIONS } from '../labels';
import { type CreateTicketBody, type Ticket, type TicketPriority, TicketsApi } from '../tickets.api';

@Component({
  selector: 'app-ticket-form',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, MessageModule, SelectModule, TextareaModule],
  templateUrl: './ticket-form.html',
})
export class TicketForm {
  private readonly api = inject(TicketsApi);
  private readonly queryClient = inject(QueryClient);
  private readonly messages = inject(MessageService);

  readonly created = output<Ticket>();
  readonly cancelled = output<void>();

  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly apiErrorMessage = apiErrorMessage;

  // Errors show after a submit attempt, not while the user is still filling in the form.
  protected readonly submitted = signal(false);

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    priority: this.fb.control<TicketPriority>('medium'),
  });

  protected readonly createTicket = injectMutation(() => ({
    mutationFn: (body: CreateTicketBody) => this.api.create(body),
    onSuccess: (ticket) => {
      this.messages.add({ severity: 'success', summary: 'Ticket created', detail: ticket.title });
      this.created.emit(ticket);
      // Refreshes every list page and the stats, which all live under 'tickets'.
      return this.queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  }));

  protected submit() {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const { title, description, priority } = this.form.getRawValue();
    this.createTicket.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  }
}
