import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../../../shared/types/user";
import { AuthContext } from "../context/auth-context";
import { authService } from "../services/auth.service";
import type { ProfileInput } from "../types/auth.types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    // Discard the old demo account; the server now decides who is authenticated.
    try {
      localStorage.removeItem("lbt_user");
    } catch {
      /* storage unavailable */
    }
    authService
      .currentUser(controller.signal)
      .then((account) => {
        if (!controller.signal.aborted) setUser(account);
      })
      .catch(() => {
        if (!controller.signal.aborted) setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const login = async (email: string, password: string) => {
    setUser(await authService.login(email, password));
  };

  const testSignIn = async (email: string) => {
    const account = await authService.testSignIn(email);
    setUser(account);
    return account;
  };

  const updateAvatar = async (file: File | null) => {
    setUser(await authService.updateAvatar(file));
  };

  const completeProfile = async (input: ProfileInput) => {
    setUser(await authService.completeProfile(input));
  };

  const choosePreference = async (preference: "search" | "post") => {
    setUser(await authService.choosePreference(preference));
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        testSignIn,
        updateAvatar,
        completeProfile,
        logout,
        choosePreference,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
