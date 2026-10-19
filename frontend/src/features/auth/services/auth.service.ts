import type { User } from "../../../shared/types/user";
import type { ProfileInput } from "../types/auth.types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/auth${path}`, {
      ...options,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error("Cannot reach the server. Please try again.");
  }
  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error("The server is unavailable. Please try again.");
  }
  if (!response.ok || !body.success || body.data === undefined) {
    throw new Error(body.error?.message ?? "The request could not be completed.");
  }
  return body.data;
}

export const authService = {
  async updateAvatar(file: File | null): Promise<User> {
    const { user } = await request<{ user: User }>(
      "/avatar",
      file
        ? {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          }
        : { method: "DELETE" },
    );
    return user;
  },
  async testSignupEnabled(signal?: AbortSignal): Promise<boolean> {
    return (await request<{ enabled: boolean }>("/test-signup/status", { signal })).enabled;
  },
  async testSignIn(email: string): Promise<User> {
    const { user } = await request<{ user: User }>("/test-signup", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return user;
  },
  async googleStatus(signal?: AbortSignal): Promise<boolean> {
    const status = await request<{ enabled: boolean }>("/google/status", { signal });
    return status.enabled;
  },
  async choosePreference(preference: "search" | "post"): Promise<User> {
    const { user } = await request<{ user: User }>("/preference", {
      method: "PATCH",
      body: JSON.stringify({ preference }),
    });
    return user;
  },
  async currentUser(signal?: AbortSignal): Promise<User | null> {
    const response = await fetch("/api/auth/me", { credentials: "same-origin", signal });
    if (response.status === 401) return null;
    const body = (await response.json()) as ApiResponse<{ user: User }>;
    if (!response.ok || !body.success || !body.data) {
      throw new Error(body.error?.message ?? "Unable to restore your session.");
    }
    return body.data.user;
  },

  async login(email: string, password: string): Promise<User> {
    const { user } = await request<{ user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return user;
  },

  async completeProfile(input: ProfileInput): Promise<User> {
    const { user } = await request<{ user: User }>("/profile", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return user;
  },

  async logout(): Promise<void> {
    await request("/logout", { method: "POST", body: JSON.stringify({}) });
  },
};
