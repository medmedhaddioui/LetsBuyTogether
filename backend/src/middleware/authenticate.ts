import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../http/app-error.js";

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const cookieToken = req.headers.cookie
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("lbt_session="))
    ?.slice("lbt_session=".length);
  const token = req.headers.authorization?.replace(/^Bearer /, "") || cookieToken;
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      if (
        typeof payload !== "string" &&
        typeof payload.id === "string" &&
        !(payload.testAccount === true && env.NODE_ENV !== "development") &&
        (payload.role === "USER" || payload.role === "ADMIN")
      ) {
        req.user = { id: payload.id, role: payload.role };
      }
    } catch {}
  }
  next();
};
export const auth: RequestHandler = (req, res, next) =>
  optionalAuth(req, res, () =>
    req.user ? next() : next(new AppError(401, "UNAUTHORIZED", "Authentication is required.")),
  );
export const admin: RequestHandler = (req, _res, next) =>
  req.user?.role === "ADMIN"
    ? next()
    : next(new AppError(403, "FORBIDDEN", "Administrator access is required."));
