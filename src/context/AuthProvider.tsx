import { type ReactNode, useEffect, useState } from "react";
import { login, type LoginFields } from "../api/login";
import { AuthContext } from "./AuthContext";

interface User {
    id: number;
    username: string;
    email: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        setAccessToken(token ?? null);

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setCurrentUser(userData);
                console.log('Restored auth session for user:', userData.username);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setAccessToken(null);
                setCurrentUser(null);
            }
        } else {
            setCurrentUser(null);
        }

        setTenantId(null);
        setLoading(false);
    }, []);

    const loginUser = async (fields: LoginFields) => {
        try {
            console.log('Attempting login for user:', fields.username);
            const res = await login(fields);

            // Store token in localStorage
            localStorage.setItem('authToken', res.access_token);
            setAccessToken(res.access_token);

            const tokenParts = res.access_token.split('_');
            const userId = parseInt(tokenParts[1]);

            const userData: User = {
                id: userId,
                username: fields.username,
                email: fields.username
            };

            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            setTenantId(null);

            console.log('Login successful for user:', userData.username);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logoutUser = () => {
        console.log('Logging out user:', currentUser?.username);


        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        setAccessToken(null);
        setCurrentUser(null);
        setTenantId(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!currentUser && !!accessToken,
                accessToken,
                tenantId,
                currentUser,
                loginUser,
                logoutUser,
                loading,
            }}
        >
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};