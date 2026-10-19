import type { RequestHandler } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../http/app-error.js";
import { ok } from "../../http/response.js";
import { AuthRepository } from "./auth.repository.js";
import { setSession } from "./auth.controller.js";
import { createSession } from "./auth.service.js";

export const requireDevelopment: RequestHandler = (_request, _response, next) => {
  if (env.NODE_ENV !== "development") {
    throw new AppError(404, "NOT_FOUND", "Route not found.");
  }
  next();
};

export const testEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
});

export const testSignupStatus: RequestHandler = (_request, response) => {
  response.set("Cache-Control", "no-store");
  ok(response, { enabled: env.NODE_ENV === "development" });
};

export const signInTestAccount: RequestHandler = async (request, response) => {
  const user = await AuthRepository.findOrCreateTestAccount(request.body.email);
  if (!user) {
    throw new AppError(
      409,
      "REAL_ACCOUNT_EXISTS",
      "This email belongs to a real account. Use a different email for testing.",
    );
  }
  setSession(response, createSession(user).token);
  ok(response, { user });
};
