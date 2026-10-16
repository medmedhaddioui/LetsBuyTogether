import { config } from "dotenv";
import { join } from "node:path";
import { z } from "zod";

import { backendRoot, projectRoot } from "./paths.js";

// Process variables take precedence, followed by backend/.env and root .env.
config({ path: join(backendRoot, ".env") });
config({ path: join(projectRoot, ".env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
});
export const env = schema.parse(process.env);
