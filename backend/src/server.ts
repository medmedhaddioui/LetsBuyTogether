import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { closeDatabase } from "./database/connection.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { frontendDist, frontendRoot } from "./config/paths.js";

const server = createServer();
const production = env.NODE_ENV === "production";
const apiOnly = !production && process.argv.includes("--api-only");
if (production && !existsSync(join(frontendDist, "index.html"))) {
  throw new Error("Frontend build missing. Run npm run build from the repository root first.");
}
const vite =
  production || apiOnly
    ? undefined
    : await (
        await import("vite")
      ).createServer({
        root: frontendRoot,
        configFile: join(frontendRoot, "vite.config.ts"),
        server: { middlewareMode: true, hmr: { server } },
        appType: "spa",
      });
server.on(
  "request",
  createApp({
    frontend: vite?.middlewares,
    staticDirectory: production ? frontendDist : undefined,
  }),
);
server.listen(env.PORT, () =>
  console.log(`LetsBuyTogether ${apiOnly ? "API" : "app"} running at http://localhost:${env.PORT}`),
);

let stopping = false;
const shutdown = () => {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  server.close(async () => {
    await vite?.close();
    await closeDatabase();
    clearTimeout(timeout);
    process.exit(0);
  });
  server.closeIdleConnections();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
