import { Router } from 'express';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketParamsSchema,
  updateTicketSchema,
} from './tickets.schemas.js';
import * as tickets from './tickets.service.js';

export const ticketsRouter = Router();

ticketsRouter.get('/stats', async (_req, res) => {
  res.json(await tickets.getTicketStats());
});

ticketsRouter.get('/', async (req, res) => {
  const query = listTicketsQuerySchema.parse(req.query);
  res.json(await tickets.listTickets(query));
});

ticketsRouter.post('/', async (req, res) => {
  const input = createTicketSchema.parse(req.body);
  res.status(201).json(await tickets.createTicket(input));
});

ticketsRouter.patch('/:id', async (req, res) => {
  const { id } = ticketParamsSchema.parse(req.params);
  const input = updateTicketSchema.parse(req.body);
  res.json(await tickets.updateTicket(id, input));
});
