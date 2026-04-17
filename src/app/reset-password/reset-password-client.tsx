"use client";

import { useActionState, useEffect } from "react";
import { FormState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const initialState: FormState = { error: "", success: false };

export default function ResetPasswordPage() {
    const [state, formAction] = useActionState(resetPassword, initialState);
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    useEffect(() => {
        if (state?.success && state?.redirect) {
            router.push(state.redirect);
        }
    }, [state, router]);

    if (!token) {
        return (
            <div className="relative flex min-h-screen items-center justify-center p-4">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1521791136064-7986c2920216')",
                    }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative w-full max-w-md border p-8 rounded-xl bg-white shadow-xl text-center">
                    <p className="text-sm font-semibold tracking-wide text-blue-600 mb-2">
                        GovProNet
                    </p>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Invalid Reset Link
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        This password reset link is missing, invalid, or has expired for
                        security reasons. Please request a new reset link.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/forgot-password">Request Reset Link</Link>
                    </Button>
                </div>
            </div>
        );
    }

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

            <div className="relative w-full max-w-md border p-8 rounded-xl bg-white shadow-2xl">
                {/* Branding + Context */}
                <div className="text-center mb-8">
                    <p className="text-sm font-semibold tracking-wide text-blue-600">
                        GovProNet
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">
                        Reset Password
                    </h1>
                    <p className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full inline-block mt-3 border border-green-100">
                        <span className="mr-1">🔒</span> This is a secure, encrypted process to protect your GovProNet account.
                    </p>
                    <p className="text-muted-foreground mt-4 text-sm">
                        Enter a new password below to regain access to your dashboard.
                    </p>
                </div>

                <form action={formAction} className="grid gap-6 [&_input]:text-slate-900 [&_input]:bg-white [&_input:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]">
                    <input type="hidden" name="token" value={token} />

                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter new password"
                            required
                            className="h-11 shadow-sm transition-all focus:ring-2 focus:ring-blue-100 border-slate-300"
                        />
                        <p className="text-xs text-slate-500">
                            Password must be at least 8 characters, including one uppercase letter, one number, and one special character.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Re-enter new password"
                            required
                            className="h-11 shadow-sm transition-all focus:ring-2 focus:ring-blue-100 border-slate-300"
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold shadow-md bg-blue-700 hover:bg-blue-800"
                        >
                            Reset Password
                        </Button>
                        <p className="text-[11px] text-center text-muted-foreground">
                            After resetting, you will be automatically redirected to the secure login page.
                        </p>
                    </div>
                </form>

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
