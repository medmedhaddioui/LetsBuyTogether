import 'dotenv/config'; import { z } from 'zod';
const schema=z.object({NODE_ENV:z.enum(['development','test','production']).default('development'),DATABASE_URL:z.string().min(1),JWT_SECRET:z.string().min(16),JWT_EXPIRES_IN:z.string().default('7d'),PORT:z.coerce.number().default(4000),FRONTEND_URL:z.string().default('http://localhost:5173')});
export const env=schema.parse(process.env);
