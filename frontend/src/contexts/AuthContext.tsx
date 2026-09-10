import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, unwrap } from "../lib/api";
import type { User } from "../lib/types";
interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (v: Register) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}
interface Register {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  city: string;
}
const C = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    try {
      setUser(await unwrap(api.get("/auth/me")));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const save = (r: { user: User; token: string }) => {
    localStorage.setItem("token", r.token);
    setUser(r.user);
  };
  return (
    <C.Provider
      value={{
        user,
        loading,
        refresh,
        login: async (email, password) =>
          save(await unwrap(api.post("/auth/login", { email, password }))),
        register: async (v) =>
          save(await unwrap(api.post("/auth/register", v))),
        logout: () => {
          localStorage.removeItem("token");
          setUser(null);
        },
      }}
    >
      {children}
    </C.Provider>
  );
}
export const useAuth = () => {
  const v = useContext(C);
  if (!v) throw new Error("AuthProvider missing");
  return v;
};
