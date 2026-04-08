"use client";

import { useActionState, useEffect, useState } from "react";
import { FormState } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/actions/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, Store, Factory, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGracefulForm } from "@/hooks/use-graceful-form";

const initialState: FormState = { error: "", success: false };

export default function SignUpClient() {
    const [state, formAction, isPending] = useActionState(signup, initialState);
    const router = useRouter();
    const { handleSafeSubmit } = useGracefulForm();
    const role = useSearchParams().get('role');
    const [selectedRole, setSelectedRole] = useState<string>(state?.fields?.role || "");

    useEffect(() => {
        if (state?.fields?.role) {
            setSelectedRole(state.fields.role);
        } else if (role) {
            setSelectedRole(role.toUpperCase());
        }
    }, [role, state?.fields?.role]);

    useEffect(() => {
        if (state?.success && state?.redirect) {
            toast.success("Account created successfully! Welcome to GovProNet.");
            setTimeout(() => {
                router.push(state.redirect!);
            }, 1000);
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state, router]);

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 bg-slate-50 py-12">
            {/* Background Image */}
            <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521791136064-7986c2920216')" }}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-2xl border p-8 rounded-xl bg-white shadow-2xl z-10">

                {/* 1. Header & Branding */}
                <div className="text-center mb-8">
                    <p className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">GovProNet</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Join GovProNet – India’s Trusted GovB2B Network
                    </h1>
                    <p className="text-muted-foreground text-md">
                        Built for GeM Vendors, OEMs & Consultants to grow verified government business.
                    </p>
                </div>

                {/* 2. Value Bullets */}
                <div className="bg-blue-50/50 rounded-lg p-6 mb-8 border border-blue-100">
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-slate-700 font-medium">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                            Get access to Verified OEMs & Vendors
                        </li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                            Simplified OEM Authorization & Compliance
                        </li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                            Trusted GovTech Networking & Business Growth
                        </li>
                    </ul>
                </div>

                <form 
                    onSubmit={(e) => handleSafeSubmit(e, formAction)}
                    className="grid gap-6"
                >

                    {/* 4. Role Selection Cards */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">I am a...</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Vendor */}
                            <div
                                onClick={() => setSelectedRole("VENDOR")}
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 ${selectedRole === "VENDOR" ? "border-blue-600 bg-blue-50/50 text-blue-700 scale-[1.02]" : "border-slate-200 text-slate-600"}`}
                            >
                                <Store className="h-8 w-8" />
                                <span className="font-semibold">Vendor</span>
                                <span className="text-xs text-center opacity-80">(GeM Sellers)</span>
                            </div>

                            {/* OEM */}
                            <div
                                onClick={() => setSelectedRole("OEM")}
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 ${selectedRole === "OEM" ? "border-blue-600 bg-blue-50/50 text-blue-700 scale-[1.02]" : "border-slate-200 text-slate-600"}`}
                            >
                                <Factory className="h-8 w-8" />
                                <span className="font-semibold">OEM</span>
                                <span className="text-xs text-center opacity-80">(Manufacturers)</span>
                            </div>

                            {/* Consultant */}
                            <div
                                onClick={() => setSelectedRole("CONSULTANT")}
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 ${selectedRole === "CONSULTANT" ? "border-blue-600 bg-blue-50/50 text-blue-700 scale-[1.02]" : "border-slate-200 text-slate-600"}`}
                            >
                                <Briefcase className="h-8 w-8" />
                                <span className="font-semibold">Consultant</span>
                                <span className="text-xs text-center opacity-80">(GeM Experts)</span>
                            </div>
                        </div>
                        <input
                            type="text"
                            name="role"
                            value={selectedRole}
                            required
                            className="opacity-0 absolute w-0 h-0"
                            tabIndex={-1}
                            onChange={() => { }}
                        />
                        <p className="text-sm text-muted-foreground">
                            This helps us customize your experience.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Your Name / Registered Company Name (as per GeM / GST)</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Rahul Sharma / Alpha Tech Solutions"
                            required
                            minLength={2}
                            maxLength={50}
                            pattern="^[a-zA-Z0-9\s.,&'-]+$"
                            defaultValue={state?.fields?.name}
                            title="Name may only contain letters, numbers, spaces, and .,&'- characters"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                defaultValue={state?.fields?.email}
                                title="Please provide a valid comprehensive email address (e.g. name@domain.com)"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                name="mobile"
                                type="tel"
                                placeholder="9876543210"
                                required
                                defaultValue={state?.fields?.mobile}
                                pattern="[6-9][0-9]{9}"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Create a strong password"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200">
                            {state.error}
                        </p>
                    )}

                    <div className="space-y-4 pt-2">
                        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-muted-foreground">
                                <span className="font-semibold text-slate-900">Your details are secure.</span> <br />
                                GovProNet follows compliance-first onboarding for Government & PSU ecosystems.
                            </div>
                        </div>

                        <Button type="submit" disabled={isPending || !selectedRole} className="w-full text-lg h-12 shadow-lg hover:shadow-xl transition-all font-bold" size="lg">
                            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> JOINING...</> : "Join the GovProNet Network"}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}
