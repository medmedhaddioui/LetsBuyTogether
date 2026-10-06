import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../lib/mockData";

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (v: RegisterInput) => Promise<void>;
  logout: () => void;
}

interface RegisterInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  city: string;
}

const STORAGE_KEY = "lbt_user";

const C = createContext<AuthValue | null>(null);

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

  const save = (u: User) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // ignore
    }
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    if (!email.includes("@") || password.length < 6) {
      throw new Error("Invalid email or password.");
    }
    const mockUser: User = {
      id: "mock-user-1",
      firstName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      lastName: "User",
      username: email.split("@")[0].toLowerCase(),
      email,
      city: "Casablanca",
    };
    save(mockUser);
  };

  const register = async (v: RegisterInput) => {
    await new Promise((r) => setTimeout(r, 800));
    const mockUser: User = {
      id: "mock-user-" + Date.now(),
      firstName: v.firstName,
      lastName: v.lastName,
      username: v.username,
      email: v.email,
      city: v.city,
    };
    save(mockUser);
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
    <C.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </C.Provider>
  );
}

export const useAuth = () => {
  const v = useContext(C);
  if (!v) throw new Error("AuthProvider missing");
  return v;
};
