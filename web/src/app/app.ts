import { Component } from '@angular/core';
import { StatsBar } from './stats-bar/stats-bar';
import { TicketForm } from './ticket-form/ticket-form';
import { TicketList } from './ticket-list/ticket-list';

@Component({
  selector: 'app-root',
  imports: [StatsBar, TicketForm, TicketList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
