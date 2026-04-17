
"use client";

import { useEffect, useState, startTransition } from "react";
import { toast } from "sonner";

/**
 * Hook to handle network/server failures gracefully.
 * 1. Checks online status during submission.
 * 2. Warns before navigation/reloading if the form is "dirty".
 */
export function useGracefulForm(isDirty: boolean = false) {
    useEffect(() => {
        if (!isDirty) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            return e.returnValue;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const checkNetwork = (e?: React.FormEvent) => {
        if (typeof window !== "undefined" && !window.navigator.onLine) {
            if (e) e.preventDefault();
            toast.error("No internet connection. Your data is safe—please check your network and try again.");
            return false;
        }
        return true;
    };

    /**
     * Helper to wrap form submission and catch network errors 
     * that might cause a total page crash (and data loss).
     */
    const handleSafeSubmit = async (e: React.FormEvent<HTMLFormElement>, action: (formData: FormData) => void | Promise<void>) => {
        e.preventDefault();
        
        if (!checkNetwork()) return;

        const formData = new FormData(e.currentTarget);
        const toastId = toast.loading("Processing your request—please wait...");
        
        try {
            startTransition(() => {
                const res = action(formData);
                if (res instanceof Promise) {
                    res.catch(err => {
                        console.error("Graceful Form Error Catch:", err);
                        toast.error("Server or Network failure. We couldn't reach the server, but your entered data is still here.");
                    }).finally(() => {
                        toast.dismiss(toastId);
                    });
                } else {
                    toast.dismiss(toastId);
                }
            });
        } catch (err) {
            console.error("Graceful Form Error Catch:", err);
            toast.error("Server or Network failure. We couldn't reach the server, but your entered data is still here.");
            toast.dismiss(toastId);
        }
    };

    return { checkNetwork, handleSafeSubmit };
}
