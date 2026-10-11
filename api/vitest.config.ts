import 'dotenv/config';
import { defineConfig } from 'vitest/config';

// Tests run against a separate database so they never touch dev data.
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ?? 'postgresql://tickets:tickets@localhost:5433/tickets_test';

export default defineConfig({
  test: {
    globalSetup: './test/global-setup.ts',
    env: { DATABASE_URL: testDatabaseUrl },
    // Test files share one database, so run them one at a time.
    fileParallelism: false,
  },
});
