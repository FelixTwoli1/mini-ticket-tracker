import { Component, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { SkeletonModule } from 'primeng/skeleton';
import { STATUS_LABELS } from '../labels';
import { TICKET_STATUSES, TicketsApi, type TicketStatus } from '../tickets.api';

const STATUS_STYLE: Record<TicketStatus, { icon: string; accent: string }> = {
  open: { icon: 'pi pi-inbox', accent: 'bg-sky-50 text-sky-600' },
  in_progress: { icon: 'pi pi-spinner', accent: 'bg-amber-50 text-amber-600' },
  closed: { icon: 'pi pi-check-circle', accent: 'bg-emerald-50 text-emerald-600' },
};

@Component({
  selector: 'app-stats-bar',
  imports: [SkeletonModule],
  template: `
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      @for (status of statuses; track status) {
        <div class="flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          <span class="flex h-12 w-12 items-center justify-center rounded-lg {{ style[status].accent }}">
            <i class="{{ style[status].icon }} text-xl"></i>
          </span>
          <div>
            <p class="text-sm font-medium text-surface-500">{{ labels[status] }}</p>
            @if (stats.data(); as data) {
              <p class="text-2xl font-semibold text-surface-900">{{ data[status] }}</p>
            } @else {
              <p-skeleton width="3rem" height="2rem" />
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class StatsBar {
  private readonly api = inject(TicketsApi);

  protected readonly statuses = TICKET_STATUSES;
  protected readonly labels = STATUS_LABELS;
  protected readonly style = STATUS_STYLE;

  protected readonly stats = injectQuery(() => ({
    queryKey: ['tickets', 'stats'],
    queryFn: () => this.api.stats(),
  }));
}
