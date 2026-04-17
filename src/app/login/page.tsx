"use client";


import { useActionState, useEffect } from "react";
import { FormState } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, Building2, Lock, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGracefulForm } from "@/hooks/use-graceful-form";

const initialState: FormState = { error: "", success: false };

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState);
    const router = useRouter();
    const { handleSafeSubmit } = useGracefulForm();

    // Handle redirect for unverified users and sync login
    useEffect(() => {
        if (state?.success) {
            toast.success("Login successful! Welcome back.");
            // Sync login across tabs
            localStorage.setItem('login-event', Date.now().toString());

            if (state?.redirect) {
                const timer = setTimeout(() => {
                    router.push(state.redirect!);
                }, 1000);
                return () => clearTimeout(timer);
            }
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state, router]);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            {/* Background Image: More Enterprise/Government focused */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop&ixlib=rb-4.0.3')",
                }}
            >
                {/* Darker overlay for better text contrast/trust feel */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-[420px] bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-8 pb-6">
                    {/* Branding & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 mb-4">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Sign in to GovProNet</h1>
                        <p className="text-sm text-slate-600 mt-2 px-4 leading-relaxed">
                            Secure access to your verified GeM vendor, OEM, and consultant workspace
                        </p>
                    </div>

                    <form 
                        onSubmit={(e) => handleSafeSubmit(e, formAction)}
                        className="grid gap-5 [&_input]:text-slate-900 [&_input]:bg-white [&_input:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                className="h-10"
                                required
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                title="Please provide a valid comprehensive email address (e.g. name@domain.com)"
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" className="h-10" required />
                        </div>

                        {state?.error && state?.redirect ? (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-700 text-sm flex items-center gap-2">
                                <Info className="h-4 w-4 shrink-0" />
                                <span>{state.error}</span>
                            </div>
                        ) : state?.error ? (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm flex items-center gap-2">
                                <span className="font-bold">Error:</span> {state.error}
                            </div>
                        ) : null}

                        <Button type="submit" disabled={isPending} className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-base font-semibold shadow-md mt-2">
                            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> SIGNING IN...</> : "Sign In securely"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-muted-foreground mb-3">
                            Login works Vendors, OEMs, and Consultants
                        </p>
                    </div>
                </div>

                {/* Trust Footer Section */}
                <div className="bg-slate-50 border-t p-6">
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5 text-blue-600" />
                            <span>Secure Platform</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            <span>KYC Verified</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <Building2 className="h-3.5 w-3.5 text-purple-600" />
                            <span>Built for Government & PSU Ecosystem</span>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 border-t text-center text-sm">
                        <span className="text-slate-500">New to GovProNet? </span>
                        <Link href="/signup" className="font-bold text-blue-700 hover:underline">
                            Join India’s trusted GovB2B network
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
