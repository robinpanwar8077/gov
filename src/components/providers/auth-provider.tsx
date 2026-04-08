"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Role } from "@/lib/types";

interface Session {
    id: string;
    email: string;
    role: Role;
    [key: string]: any;
}

interface AuthContextType {
    user: Session | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSession = async () => {
        try {
            const res = await fetch("/api/auth/session");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                return data;
            } else {
                setUser(null);
                return null;
            }
        } catch (error) {
            console.error("Failed to fetch session:", error);
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();

        // 1. Sync auth state across tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'logout-event') {
                fetchSession().then((session) => {
                    if (!session && !window.location.pathname.startsWith('/login')) {
                        window.location.href = '/login';
                    }
                });
            }
            if (e.key === 'login-event') {
                fetchSession();
            }
        };

        // 2. Re-validate session when returning to page via back/forward cache
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                fetchSession().then((session) => {
                    if (!session && !window.location.pathname.startsWith('/login')) {
                        window.location.href = '/login';
                    }
                });
            }
        };

        // 3. Re-validate when tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchSession();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('pageshow', handlePageShow);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('pageshow', handlePageShow);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const refresh = async () => {
        setIsLoading(true);
        await fetchSession();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
