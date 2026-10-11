import { Component, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { STATUS_LABELS } from '../labels';
import { TICKET_STATUSES, TicketsApi } from '../tickets.api';

@Component({
  selector: 'app-stats-bar',
  template: `
    <section class="stats">
      @for (status of statuses; track status) {
        <div class="card stat">
          <span class="muted">{{ labels[status] }}</span>
          <strong>{{ stats.data()?.[status] ?? '-' }}</strong>
        </div>
      }
    </section>
  `,
})
export class StatsBar {
  private readonly api = inject(TicketsApi);

  protected readonly statuses = TICKET_STATUSES;
  protected readonly labels = STATUS_LABELS;

  protected readonly stats = injectQuery(() => ({
    queryKey: ['tickets', 'stats'],
    queryFn: () => this.api.stats(),
  }));
}
