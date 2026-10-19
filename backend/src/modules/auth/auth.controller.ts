import { AuthRepository } from "./auth.repository.js";
import { AppError } from "../../http/app-error.js";
import type { RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ok } from "../../http/response.js";
import { AuthService } from "./auth.service.js";

export const SESSION_COOKIE = "lbt_session";
const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
};

export function setSession(response: Response, token: string) {
  const payload = jwt.decode(token) as jwt.JwtPayload;
  response.cookie(SESSION_COOKIE, token, {
    ...cookieOptions,
    expires: new Date(payload.exp! * 1000),
  });
  response.set("Cache-Control", "no-store");
}

export const loginUser: RequestHandler = async (request, response) => {
  const { user, token } = await AuthService.login(request.body.email, request.body.password);
  setSession(response, token);
  ok(response, { user });
};

export const getCurrentUser: RequestHandler = async (request, response) => {
  response.set("Cache-Control", "no-store");
  ok(response, { user: await AuthService.me(request.user!.id) });
};

export const logoutUser: RequestHandler = (_request, response) => {
  response.clearCookie(SESSION_COOKIE, cookieOptions);
  response.set("Cache-Control", "no-store");
  ok(response, { message: "Logged out." });
};

export const updatePreference: RequestHandler = async (request, response) => {
  const user = await AuthRepository.updatePreference(request.user!.id, request.body.preference);
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Your session is no longer valid.");
  response.set("Cache-Control", "no-store");
  ok(response, { user });
};

export const completeProfile: RequestHandler = async (request, response) => {
  const user = await AuthRepository.completeProfile(request.user!.id, request.body);
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Your session is no longer valid.");
  response.set("Cache-Control", "no-store");
  ok(response, { user });
};
