import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../../../shared/types/user";
import { AuthContext } from "../context/auth-context";
import { demoAuthService } from "../services/demo-auth.service";

import type { RegisterInput } from "../types/auth.types";

const STORAGE_KEY = "lbt_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUser = (user: User) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    saveUser(await demoAuthService.login(email, password));
  };

  const register = async (input: RegisterInput) => {
    saveUser(await demoAuthService.register(input));
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
