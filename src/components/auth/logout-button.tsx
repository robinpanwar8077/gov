"use client";

import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";
import { useState } from "react";

export function LogoutButton({ className }: { className?: string }) {
    const { refresh } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        toast.info("Logging out securely...");
        // Sync logout across tabs
        localStorage.setItem('logout-event', Date.now().toString());
        await logoutAction();
        await refresh(); // Refresh the auth state
        toast.success("Logged out successfully.");
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full text-left ${className} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isLoggingOut ? "LOGGING OUT..." : "Logout"}
        </button>
    );
}
