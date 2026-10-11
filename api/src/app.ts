import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { ticketsRouter } from './tickets/tickets.router.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/tickets', ticketsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
