import { Component } from '@angular/core';
import { TicketList } from './ticket-list/ticket-list';

@Component({
  selector: 'app-root',
  imports: [TicketList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
