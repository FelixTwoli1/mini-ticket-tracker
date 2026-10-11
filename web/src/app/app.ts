import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { StatsBar } from './stats-bar/stats-bar';
import { TicketForm } from './ticket-form/ticket-form';
import { TicketList } from './ticket-list/ticket-list';

@Component({
  selector: 'app-root',
  imports: [StatsBar, TicketForm, TicketList, ToastModule],
  templateUrl: './app.html',
})
export class App {}
