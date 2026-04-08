import { isRedirectError } from "next/dist/client/components/redirect-error";

export type ActionState<T> = {
    success?: boolean;
    data?: T;
    error?: string;
};

/**
 * A wrapper for Server Actions to handle unhandled errors and prevent crashes.
 * It catches errors and formats them into a standard response object.
 */
export async function withErrorHandler<T, Args extends any[]>(
    action: (...args: Args) => Promise<T>,
    ...args: Args
): Promise<ActionState<T>> {
    try {
        const data = await action(...args);
        return { success: true, data };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error; // Let Next.js handle redirects
        }

        console.error("Server Action Error:", error);

        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
