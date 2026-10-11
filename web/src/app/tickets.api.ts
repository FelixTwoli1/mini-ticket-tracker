import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export const TICKET_STATUSES = ['open', 'in_progress', 'closed'] as const;
export const TICKET_PRIORITIES = ['low', 'medium', 'high'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
}

export interface TicketPage {
  data: Ticket[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export type TicketStats = Record<TicketStatus, number>;

export interface ListTicketsParams {
  status?: TicketStatus;
  page: number;
  limit: number;
}

export interface CreateTicketBody {
  title: string;
  description?: string;
  priority: TicketPriority;
}

export type UpdateTicketBody = Partial<Pick<Ticket, 'status' | 'priority'>>;

// Requests go to /api; the dev proxy and nginx forward them to the Express API.
@Injectable({ providedIn: 'root' })
export class TicketsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tickets';

  list({ status, page, limit }: ListTicketsParams) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    return lastValueFrom(this.http.get<TicketPage>(this.baseUrl, { params }));
  }

  stats() {
    return lastValueFrom(this.http.get<TicketStats>(`${this.baseUrl}/stats`));
  }

  create(body: CreateTicketBody) {
    return lastValueFrom(this.http.post<Ticket>(this.baseUrl, body));
  }

  update(id: number, body: UpdateTicketBody) {
    return lastValueFrom(this.http.patch<Ticket>(`${this.baseUrl}/${id}`, body));
  }
}
