import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { backendRoot } from "../config/paths.js";
import { closeDatabase, getDatabase } from "./connection.js";

export async function migrateDatabase() {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(7882331)");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    const directory = join(backendRoot, "database", "migrations");
    const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
    for (const name of files) {
      const applied = await client.query("SELECT name FROM schema_migrations WHERE name = $1", [
        name,
      ]);
      if (applied.rowCount) continue;
      await client.query(await readFile(join(directory, name), "utf8"));
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
      console.log(`Applied ${name}`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

try {
  await migrateDatabase();
  console.log("Database migrations are up to date.");
} catch {
  console.error("Database migration failed. Check DATABASE_URL and PostgreSQL access.");
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
