import { createContext } from "react";
import type { AuthValue } from "../types/auth.types";

export const AuthContext = createContext<AuthValue | null>(null);
