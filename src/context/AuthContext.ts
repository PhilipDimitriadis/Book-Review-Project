import { createContext } from "react";
import type { LoginFields } from "../api/login.ts";

interface User {
    id: number;
    username: string;
    email: string;
}

export type AuthContextType = {
    isAuthenticated: boolean;
    accessToken: string | null;
    tenantId: string | null;
    currentUser: User | null;
    loginUser: (fields: LoginFields) => Promise<void>;
    logoutUser: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);