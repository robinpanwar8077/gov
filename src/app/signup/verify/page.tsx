import { Suspense } from "react";
import VerifyPageClient from "./client-page";

export default function VerifyPage() {
    return (
        <Suspense fallback={<VerifyPageSkeleton />}>
            <VerifyPageClient />
        </Suspense>
    );
}

function VerifyPageSkeleton() {
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
