import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { apiErrorMessage } from '../api-error';
import { PRIORITY_LABELS } from '../labels';
import { CreateTicketBody, TICKET_PRIORITIES, TicketsApi } from '../tickets.api';

@Component({
  selector: 'app-ticket-form',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-form.html',
})
export class TicketForm {
  private readonly api = inject(TicketsApi);
  private readonly queryClient = inject(QueryClient);

  protected readonly priorities = TICKET_PRIORITIES;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly apiErrorMessage = apiErrorMessage;

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    priority: ['medium' as CreateTicketBody['priority']],
  });

  protected readonly createTicket = injectMutation(() => ({
    mutationFn: (body: CreateTicketBody) => this.api.create(body),
    onSuccess: () => {
      this.form.reset();
      // Refreshes every list page and the stats, which all live under 'tickets'.
      return this.queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  }));

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, description, priority } = this.form.getRawValue();
    this.createTicket.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  }
}
