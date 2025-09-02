import { createContext } from "react";
import type { LoginFields } from "@/api/login.ts";

// Add user interface to match your backend
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
    // Optional: add method to refresh user data
    refreshUser?: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextProps | undefined>(
    undefined,
);