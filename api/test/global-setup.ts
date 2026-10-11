import { execSync } from 'node:child_process';

export default function setup() {
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ?? 'postgresql://tickets:tickets@localhost:5433/tickets_test',
    },
  });
}
