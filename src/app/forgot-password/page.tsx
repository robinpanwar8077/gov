"use client";

import { useActionState, useEffect } from "react";
import { FormState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const initialState: FormState = { error: "", success: false };

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(forgotPassword, initialState);
    const router = useRouter();

    useEffect(() => {
        // In a real app, we'd show a toast or a success message before redirecting
        // or just stay on the page with a success message.
        // For now, we redirect to login after a short delay or immediately.
        if (state?.success && state?.redirect) {
            const timer = setTimeout(() => {
                router.push(state.redirect!);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state, router]);

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4">
            {/* Background: Enterprise/Government Theme */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop&ixlib=rb-4.0.3')",
                }}
            >
                {/* Darker overlay for trust/serious tone */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md border p-8 rounded-xl bg-white shadow-2xl">
                {/* Branding + Context */}
                <div className="text-center mb-8">
                    <p className="text-sm font-semibold tracking-wide text-blue-600">
                        GovProNet
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">
                        Forgot Password?
                    </h1>
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                        Enter your email address and we&apos;ll send you a secure link to reset your
                        password.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-4 text-xs text-left">
                        <p className="font-semibold text-blue-800 mb-1">Security Note:</p>
                        <ul className="list-disc list-inside text-blue-700 space-y-1">
                            <li>This is a secure, end to end encrypted process.</li>
                            <li>Reset links are valid for <span className="font-bold">15 minutes only</span> to protect your account.</li>
                        </ul>
                    </div>
                </div>

                {state?.success ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-lg mb-6 text-sm text-center">
                        <div className="font-semibold text-lg mb-2">Check your email</div>
                        <p>
                            If an account exists with this email, you will receive a reset link shortly.
                        </p>
                        <p className="text-xs text-green-700 mt-3 pt-3 border-t border-green-200">
                            Please check your inbox and spam folder. The reset email may take up to 2 minutes.
                        </p>
                        <p className="mt-4 font-semibold text-green-900">Redirecting to login…</p>
                    </div>
                ) : (
                    <form action={formAction} className="grid gap-6 [&_input]:text-slate-900 [&_input]:bg-white [&_input:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]" onSubmit={(e) => {
                        if (!navigator.onLine) {
                            e.preventDefault();
                            toast.error("No internet connection. Please check your connection and try again.");
                        }
                    }}>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                title="Please provide a valid comprehensive email address (e.g. name@domain.com)"
                                className="h-11 shadow-sm transition-all focus:ring-2 focus:ring-blue-100 border-slate-300"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                If the email is not registered, no reset link will be sent for security reasons.
                            </p>
                        </div>

                        {state?.error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                                {state.error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold shadow-md bg-blue-700 hover:bg-blue-800"
                        >
                            Send Reset Link
                        </Button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm border-t pt-6">
                    <Link
                        href="/login"
                        className="font-medium text-blue-700 hover:underline flex items-center justify-center gap-1"
                    >
                        <span>←</span> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
