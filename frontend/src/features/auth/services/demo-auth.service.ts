import type { User } from "../../../shared/types/user";

import type { RegisterInput } from "../types/auth.types";

/** Demo authentication used by the current UI; no database calls are made. */
export const demoAuthService = {
  async login(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!email.includes("@") || password.length < 6) {
      throw new Error("Invalid email or password.");
    }
    const name = email.split("@")[0];
    return {
      id: "mock-user-1",
      firstName: name.charAt(0).toUpperCase() + name.slice(1),
      lastName: "User",
      username: name.toLowerCase(),
      email,
      city: "Casablanca",
    };
  },

  async register(input: RegisterInput): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      id: "mock-user-" + Date.now(),
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      city: input.city,
    };
  },
};
