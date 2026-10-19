import { createHash, randomBytes } from "node:crypto";
import { OAuth2Client, CodeChallengeMethod } from "google-auth-library";
import { env } from "../../config/env.js";
import { AppError } from "../../http/app-error.js";

export function googleConfiguration() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    throw new AppError(503, "GOOGLE_NOT_CONFIGURED", "Google sign-in is not configured yet.");
  }
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
}

export const GoogleAuthService = {
  start() {
    const client = googleConfiguration();
    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const verifier = randomBytes(64).toString("base64url");
    const url = client.generateAuthUrl({
      scope: ["openid", "email", "profile"],
      state,
      nonce,
      prompt: "select_account",
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: CodeChallengeMethod.S256,
    });
    return { state, nonce, verifier, url };
  },
  async identity(code: string, verifier: string, nonce: string) {
    const client = googleConfiguration();
    const { tokens } = await client.getToken({ code, codeVerifier: verifier });
    if (!tokens.id_token) throw new Error("Missing Google identity token");
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const identity = ticket.getPayload();
    if (!identity?.sub || !identity.email || !identity.email_verified || identity.nonce !== nonce) {
      throw new Error("Google identity verification failed");
    }
    return { subject: identity.sub, email: identity.email.toLowerCase() };
  },
};
