import express, { type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { join } from "node:path";
import { env } from "./config/env.js";
import { apiRoutes } from "./http/api.routes.js";

import { errorHandler } from "./middleware/handle-error.js";

interface AppOptions {
  frontend?: RequestHandler;
  staticDirectory?: string;
}

export function createApp({ frontend, staticDirectory }: AppOptions = {}) {
  const app = express();
  app.use(
    helmet({
      // Vite injects scripts for hot reload; production retains the default CSP.
      contentSecurityPolicy:
        env.NODE_ENV === "development"
          ? false
          : {
              directives: { imgSrc: ["'self'", "data:", "https:"] },
            },
      strictTransportSecurity: env.NODE_ENV === "production" ? undefined : false,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  if (env.NODE_ENV !== "test") app.use(morgan("dev"));
  app.use("/api", rateLimit({ windowMs: 60_000, limit: 200, standardHeaders: "draft-7" }));
  app.use("/api", apiRoutes);
  const notFound: RequestHandler = (_req, res) => {
    res
      .status(404)
      .json({ success: false, error: { code: "NOT_FOUND", message: "Route not found." } });
  };
  // Unknown API endpoints must never receive the React HTML fallback.
  app.use("/api", notFound);
  if (frontend) app.use(frontend);
  if (staticDirectory) {
    app.use(express.static(staticDirectory));
    app.get("*", (req, res, next) => {
      // Only browser document requests fall back to the client-side router.
      if (req.path.includes(".") || !req.accepts("html")) return next();
      res.sendFile(join(staticDirectory, "index.html"));
    });
  }
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
