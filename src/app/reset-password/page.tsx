import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordSkeleton />}>
            <ResetPasswordClient />
        </Suspense>
    );
}

function ResetPasswordSkeleton() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md p-8 rounded-xl bg-white shadow">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-6" />
                <div className="h-11 bg-muted rounded mb-4" />
                <div className="h-11 bg-muted rounded mb-6" />
                <div className="h-11 bg-muted rounded" />
            </div>
        </div>
    );
}
