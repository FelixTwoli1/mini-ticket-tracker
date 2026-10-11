import { Router } from 'express';
import { createTicketSchema } from './tickets.schemas.js';
import * as tickets from './tickets.service.js';

export const ticketsRouter = Router();

ticketsRouter.post('/', async (req, res) => {
  const input = createTicketSchema.parse(req.body);
  res.status(201).json(await tickets.createTicket(input));
});
