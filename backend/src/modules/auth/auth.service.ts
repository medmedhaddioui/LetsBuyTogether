import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../http/app-error.js";
import { AuthRepository } from "./auth.repository.js";
import type { RegisterInput } from "./auth.schemas.js";
import type { AccountUser } from "./auth.types.js";

const dummyPasswordHash = bcrypt.hash("unregistered-account", 12);

export function createSession(user: AccountUser) {
  const token = jwt.sign(
    { id: user.id, role: user.role, ...(user.isTestAccount ? { testAccount: true } : {}) },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
  return { user, token };
}

export const AuthService = {
  // Used to seed legacy password-account fixtures; no public registration route calls this.
  async register(input: RegisterInput) {
    const { password, ...account } = input;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await AuthRepository.create(account, passwordHash);
    return createSession(user);
  },

  async login(email: string, password: string) {
    const account = await AuthRepository.findCredentials(email);
    const matches = await bcrypt.compare(
      password,
      account?.passwordHash ?? (await dummyPasswordHash),
    );
    if (!account || !account.passwordHash || !matches) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }
    const { passwordHash: _passwordHash, ...user } = account;
    return createSession(user);
  },

  async me(id: string) {
    const user = await AuthRepository.findById(id);
    if (!user) throw new AppError(401, "UNAUTHORIZED", "Your session is no longer valid.");
    if (user.isTestAccount && env.NODE_ENV !== "development") {
      throw new AppError(401, "UNAUTHORIZED", "Test accounts are only available in development.");
    }
    return user;
  },
};
