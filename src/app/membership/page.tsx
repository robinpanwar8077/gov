
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ShieldCheck, Zap, Star, Shield, Building2, Users, Rocket } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function MembershipPlansPage() {
    const session = await getSession();

    let activeMembershipId: string | null = null;
    if (session) {
        const membership = await prisma.membership.findFirst({
            where: {
                userId: session.id as string,
                isActive: true,
                validUntil: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' },
            include: { plan: true }
        });
        activeMembershipId = membership?.planId || null;
    }

    const plans = await prisma.membershipPlan.findMany({
        orderBy: { price: 'asc' }
    });

    return (
        <div className="flex flex-col gap-16 py-10 px-4 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 text-xs font-black uppercase tracking-widest text-indigo-600 border-indigo-200 bg-indigo-50">
                    Membership Plans
                </Badge>
                <h1 className="text-5xl font-black tracking-tight text-slate-900">
                    Accelerate Your <span className="text-indigo-600">GeM Business</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                    Choose the plan that fits your growth strategy. Gain verified authorizations, build trust with government buyers, and win more tenders.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
                {plans.map((plan) => {
                    const isCurrentPlan = activeMembershipId === plan.id;
                    const isStarter = plan.slug === 'starter';

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden flex flex-col h-full border-2 transition-all duration-300 hover:shadow-2xl ${isCurrentPlan ? 'border-green-500 ring-4 ring-green-50 scale-105 z-10' :
                                    plan.isRecommended ? 'border-primary ring-4 ring-primary/10 scale-105 z-10' :
                                        'border-muted hover:border-primary/20'
                                }`}
                        >
                            {isCurrentPlan && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-1.5 text-xs font-black uppercase tracking-widest transform translate-x-3 translate-y-4 rotate-45 shadow-lg">
                                    Current
                                </div>
                            )}

                            {!isCurrentPlan && plan.isRecommended && (
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-1.5 text-xs font-black uppercase tracking-widest transform translate-x-3 translate-y-4 rotate-45 shadow-lg">
                                    {plan.tag}
                                </div>
                            )}

                            <CardHeader className="p-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-2xl font-black tracking-tight text-slate-900">{plan.name}</CardTitle>
                                        {isCurrentPlan && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Active</Badge>}
                                    </div>
                                    <CardDescription className="text-sm font-medium leading-relaxed">{plan.description}</CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8 pt-0 flex-1 space-y-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black tracking-tighter text-slate-900">
                                        {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                                    </span>
                                    <span className="text-lg font-bold text-muted-foreground">/{plan.durationDays >= 365 ? 'Year' : plan.durationDays >= 180 ? '6 Months' : 'Month'}</span>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Included Features</p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className={`shrink-0 p-1 rounded-full ${isCurrentPlan ? 'bg-green-100 text-green-600' : plan.isRecommended ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>

                            <CardFooter className="p-8 pt-0 mt-auto">
                                <Button
                                    className={`w-full h-12 text-sm font-black uppercase tracking-widest ${isCurrentPlan ? 'bg-slate-100 text-slate-400 cursor-default hover:bg-slate-100' :
                                            plan.isRecommended ? 'bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20' : ''
                                        }`}
                                    variant={isCurrentPlan ? 'ghost' : plan.isRecommended ? 'default' : 'outline'}
                                    asChild={!isCurrentPlan}
                                    disabled={isCurrentPlan}
                                >
                                    {!isCurrentPlan ? (
                                        <Link href={session ? `/membership/checkout?plan=${plan.id}` : `/login?callbackUrl=/membership/checkout?plan=${plan.id}`}>
                                            {isStarter ? 'Get Started' : `Upgrade to ${plan.name}`}
                                        </Link>
                                    ) : (
                                        <span>Current Active Plan</span>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Why Join Section */}
            <div className="bg-slate-50 rounded-3xl p-12 lg:p-16 border border-slate-200">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                    <div className="space-y-6">
                        <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-indigo-200 bg-white">
                            Why GovProNet Premium?
                        </Badge>
                        <h2 className="text-4xl font-black tracking-tight text-slate-900">
                            Build Unmatched <span className="text-indigo-600">Market Trust</span>
                        </h2>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            Premium membership isn't just about features; it's about verified credentials that government buyers look for during tender evaluations.
                        </p>

                        <div className="grid gap-6 sm:grid-cols-2 pt-4">
                            <div className="flex gap-4">
                                <div className="shrink-0 h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">OEM Legitimacy</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Official approval letters from manufacturers.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="shrink-0 h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Direct Network</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Bypass middlemen and connect with buyers.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                            <Zap className="w-8 h-8 text-amber-500" />
                            <h4 className="font-black text-xs uppercase tracking-widest">Fast Track</h4>
                            <p className="text-xs text-muted-foreground font-medium">Get verified in 24-48 hours with priority support.</p>
                        </div>
                        <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl space-y-3 text-white">
                            <Rocket className="w-8 h-8 text-indigo-200" />
                            <h4 className="font-black text-xs uppercase tracking-widest">Win More</h4>
                            <p className="text-xs text-indigo-100 font-medium">Members win 3.5x more GeM tenders on average.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ / Trust Strip */}
            <div className="text-center pb-10">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8">Trusted by 5,000+ Government Vendors</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
                    {/* Placeholder logos */}
                    <Building2 className="w-12 h-12" />
                    <Building2 className="w-12 h-12" />
                    <Building2 className="w-12 h-12" />
                    <Building2 className="w-12 h-12" />
                    <Building2 className="w-12 h-12" />
                </div>
            </div>
        </div>
    );
}
