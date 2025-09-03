import { createContext } from "react";
import type { LoginFields } from "@/api/login.ts";

interface User {
    id: number;
    username: string;
    email: string;
    created_at?: string;
}

type AuthContextProps = {
    isAuthenticated: boolean;
    currentUser: User | null; // Add current user to context
    accessToken: string | null;
    tenantId: string | null;
    loginUser: (fields: LoginFields) => Promise<void>;
    logoutUser: () => void;
    loading: boolean;
    refreshUser?: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextProps | undefined>(
    undefined,
);