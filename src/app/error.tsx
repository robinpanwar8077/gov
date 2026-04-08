"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error);
        toast.error("An unexpected error occurred. Our team has been notified.");
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-6 text-destructive">
                <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">
                Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground max-w-[500px] mb-8">
                We encountered an unexpected error while processing your request. Please try again.
                If the problem persists, contact support.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default" size="lg">
                    Try again
                </Button>
                <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                    size="lg"
                >
                    Return Home
                </Button>
            </div>
        </div>
    );
}
