import type { Role } from "../../types/auth.js";

/** Private account data returned only to its authenticated owner. */
export interface AccountUser {
  id: string;
  username: string;
  phone: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string;
  address: string;
  city: string;
  role: Role;
  createdAt: Date;
  startingPreference: "search" | "post" | null;
  profileComplete: boolean;
  isTestAccount: boolean;
}

export interface AccountCredentials extends AccountUser {
  passwordHash: string | null;
}
