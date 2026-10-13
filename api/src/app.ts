import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { openApiDocument } from './openapi.js';
import { ticketsRouter } from './tickets/tickets.router.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use('/tickets', ticketsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
