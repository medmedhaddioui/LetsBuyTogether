import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env.js";
import { query } from "../../database/connection.js";
import { AppError } from "../../http/app-error.js";
import { ok } from "../../http/response.js";
import { AuthRepository } from "./auth.repository.js";
import { createSession } from "./auth.service.js";
import { setSession } from "./auth.controller.js";
import { GoogleAuthService } from "./google-auth.service.js";

const cookieName = "lbt_google_flow";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/api/auth/google",
};
const flowSchema = z.object({
  state: z.string(),
  nonce: z.string(),
  verifier: z.string(),
  returnTo: z.string(),
});
const hash = (state: string) => createHash("sha256").update(state).digest("hex");

export const googleStatus: RequestHandler = (_request, response) => {
  response.set("Cache-Control", "no-store");
  ok(response, {
    enabled: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI),
  });
};

export const startGoogle: RequestHandler = async (request, response) => {
  response.set("Cache-Control", "no-store");
  response.set("Referrer-Policy", "no-referrer");
  const flow = GoogleAuthService.start();
  const requested =
    typeof request.query.returnTo === "string" ? request.query.returnTo : "/activity";
  let returnTo = "/activity";
  if (requested.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\")) {
    try {
      const destination = new URL(requested, env.APP_URL);
      if (destination.origin === new URL(env.APP_URL).origin)
        returnTo = destination.pathname + destination.search;
    } catch {
      /* Keep the default destination for malformed paths. */
    }
  }
  await query("DELETE FROM google_login_flows WHERE expires_at < CURRENT_TIMESTAMP");
  await query(
    "INSERT INTO google_login_flows (state_hash, expires_at) VALUES ($1, CURRENT_TIMESTAMP + INTERVAL '10 minutes')",
    [hash(flow.state)],
  );
  const token = jwt.sign(
    { state: flow.state, nonce: flow.nonce, verifier: flow.verifier, returnTo },
    env.JWT_SECRET,
    { expiresIn: "10m", audience: "google-login" },
  );
  response.cookie(cookieName, token, { ...cookieOptions, maxAge: 10 * 60_000 });
  response.redirect(flow.url);
};

export const finishGoogle: RequestHandler = async (request, response) => {
  response.set("Cache-Control", "no-store");
  response.set("Referrer-Policy", "no-referrer");
  const cookie = request.headers.cookie
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  response.clearCookie(cookieName, cookieOptions);
  try {
    const flow = flowSchema.parse(
      jwt.verify(cookie ?? "", env.JWT_SECRET, { algorithms: ["HS256"], audience: "google-login" }),
    );
    if (typeof request.query.state !== "string" || request.query.state !== flow.state)
      throw new Error("Invalid state");
    const consumed = await query(
      "DELETE FROM google_login_flows WHERE state_hash = $1 AND expires_at > CURRENT_TIMESTAMP RETURNING state_hash",
      [hash(flow.state)],
    );
    if (!consumed.rowCount) throw new Error("Expired or reused login");
    if (request.query.error || typeof request.query.code !== "string")
      throw new Error("Google consent cancelled");
    const identity = await GoogleAuthService.identity(
      request.query.code,
      flow.verifier,
      flow.nonce,
    );
    const user = await AuthRepository.findOrCreateGoogle(identity.subject, identity.email);
    setSession(response, createSession(user).token);
    const path = user.profileComplete ? flow.returnTo : "/complete-profile";
    response.redirect(new URL(path, env.APP_URL).toString());
  } catch (error) {
    const reason =
      error instanceof AppError && error.code === "ACCOUNT_EXISTS"
        ? "existing-account"
        : "google-failed";
    response.redirect(new URL(`/login?error=${reason}`, env.APP_URL).toString());
  }
};
