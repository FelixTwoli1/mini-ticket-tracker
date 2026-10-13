import 'dotenv/config';
import { z } from 'zod';

// Fail fast at startup with a clear message instead of on the first query.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export const env = envSchema.parse(process.env);
