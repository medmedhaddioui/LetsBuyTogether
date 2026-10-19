import pg from "pg";
import type { QueryResultRow } from "pg";
import { env } from "../config/env.js";
import { AppError } from "../http/app-error.js";

let pool: pg.Pool | undefined;

export function getDatabase(): pg.Pool {
  if (!env.DATABASE_URL) {
    throw new AppError(
      503,
      "DATABASE_UNAVAILABLE",
      "Account service is temporarily unavailable. Please try again later.",
    );
  }
  if (!pool) {
    pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      max: 10,
    });
    pool.on("error", () => console.error("An idle PostgreSQL connection failed."));
  }
  return pool;
}

export async function query<Row extends QueryResultRow>(sql: string, values: unknown[] = []) {
  try {
    return await getDatabase().query<Row>(sql, values);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const code = (error as { code?: string }).code;
    if (code === "23505") {
      throw new AppError(409, "ACCOUNT_EXISTS", "Username or email is already in use.");
    }
    // Do not expose connection strings, query parameters or database error details.
    throw new AppError(
      503,
      "DATABASE_UNAVAILABLE",
      "Account service is temporarily unavailable. Please try again later.",
    );
  }
}

export async function closeDatabase() {
  await pool?.end();
  pool = undefined;
}
