import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Optional here so `prisma generate` (run on install) works before .env exists; migrate still needs it.
  datasource: { url: process.env.DATABASE_URL },
});
