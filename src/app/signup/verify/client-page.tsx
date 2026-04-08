"use client";

import { useActionState, useEffect, useState } from "react";
import { FormState } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyOTP, resendOTP } from "@/lib/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";

const initialState: FormState = { error: "", success: false };

export default function VerifyPageClient() {
    const [state, formAction] = useActionState(verifyOTP, initialState);
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email");

    const [timer, setTimer] = useState(0);
    const [resendState, resendAction, isResendPending] = useActionState(resendOTP, initialState);

    useEffect(() => {
        if (state?.success && state?.redirect) {
            // Sync login across tabs
            localStorage.setItem('login-event', Date.now().toString());
            router.push(state.redirect);
        }
    }, [state, router]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (resendState?.success) {
            setTimer(60); // 60 seconds cooldown
        }
    }, [resendState]);

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

            {/* Card */}
            <div className="relative w-full max-w-md border p-8 rounded-lg bg-white shadow-xl">
                {/* Branding + Context */}
                <div className="text-center mb-6">
                    <p className="text-sm font-semibold tracking-wide text-blue-600">
                        GovProNet
                    </p>
                    <h1 className="text-2xl font-bold mt-1">Verify Your Account</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        We’ve sent verification codes to your registered email
                        {email ? ` (${email})` : ""} and mobile number.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Please enter both OTPs below to activate your account. OTPs are valid
                        for a limited time.
                    </p>
                </div>

                <form action={formAction} className="grid gap-4">
                    <input type="hidden" name="email" value={email || ""} />

                    <div className="grid gap-2">
                        <Label htmlFor="mobileOtp">Mobile OTP</Label>
                        <Input
                            id="mobileOtp"
                            name="mobileOtp"
                            type="text"
                            placeholder="6-digit code"
                            required
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="emailOtp">Email OTP</Label>
                        <Input
                            id="emailOtp"
                            name="emailOtp"
                            type="text"
                            placeholder="6-digit code"
                            required
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm font-medium">{state.error}</p>
                    )}

                    <Button type="submit" className="w-full">
                        Verify & Login
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    {resendState?.error && (
                        <p className={`mb-2 text-xs font-medium ${resendState.success ? "text-green-600" : "text-red-500"}`}>
                            {resendState.error}
                        </p>
                    )}

                    <p>
                        Didn’t receive the codes?{" "}
                        {timer > 0 ? (
                            <span className="font-medium text-primary">Resend in {timer}s</span>
                        ) : (
                            <form action={resendAction} className="inline">
                                <input type="hidden" name="email" value={email || ""} />
                                <Button
                                    variant="link"
                                    className="px-0 h-auto font-semibold"
                                    disabled={isResendPending}
                                >
                                    {isResendPending ? "Sending..." : "Resend OTP"}
                                </Button>
                            </form>
                        )}
                    </p>
                    <p className="text-xs mt-2">
                        You can request a new OTP if it hasn’t arrived. Check your spam folder as well.
                    </p>
                </div>
            </div>
        </div>
    );
}
