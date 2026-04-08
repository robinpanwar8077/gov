
"use client";

import { useState, useEffect } from "react";
import { WifiOff, AlertCircle, X } from "lucide-react";

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [showLocalError, setShowLocalError] = useState(false);

    useEffect(() => {
        function updateStatus() {
            setIsOffline(!navigator.onLine);
        }

        window.addEventListener("online", updateStatus);
        window.addEventListener("offline", updateStatus);
        
        // Initial check
        updateStatus();

        return () => {
            window.removeEventListener("online", updateStatus);
            window.removeEventListener("offline", updateStatus);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-9999 animate-in slide-in-from-top duration-300">
            <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-xl">
                <WifiOff className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-tight">
                    You are currently offline. Some features may not work.
                </span>
                <div className="hidden sm:block text-[10px] font-black bg-white/20 px-2 py-0.5 rounded border border-white/30 ml-4">
                    NETWORK_DISCONNECTED
                </div>
            </div>
        </div>
    );
}

export function ServerErrorNotification() {
    const [error, setError] = useState<string | null>(null);

    // This is a global interceptor for fetch if we want, 
    // but in Next.js Server Actions, handled in standard form returns.
    // However, showing a generic red banner if fetch fails is good.
    return null; // For now.
}
