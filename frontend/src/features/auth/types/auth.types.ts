import type { User } from "../../../shared/types/user";

export interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  testSignIn: (email: string) => Promise<User>;
  updateAvatar: (file: File | null) => Promise<void>;
  completeProfile: (input: ProfileInput) => Promise<void>;
  logout: () => Promise<void>;
  choosePreference: (preference: "search" | "post") => Promise<void>;
}

export interface ProfileInput {
  username: string;
  phone?: string;
  bio?: string;
  address: string;
  city: string;
}
