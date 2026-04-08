import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import prisma from "@/lib/db";
import { CheckoutWrapper } from "@/components/membership/checkout-wrapper";

export default async function MembershipCheckoutPage({
    searchParams
}: {
    searchParams: Promise<{ plan?: string }>
}) {
    const session = await getSession();
    if (!session) {
        redirect("/login?callbackUrl=/membership");
    }

    const { plan: planId } = await searchParams;

    if (!planId) {
        redirect("/membership");
    }

    const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId }
    });

    if (!plan) {
        redirect("/membership");
    }

    // Guard: Prevent buying the same plan again if active
    const existingMembership = await prisma.membership.findFirst({
        where: {
            userId: session.id as string,
            planId: plan.id,
            isActive: true,
            validUntil: { gt: new Date() }
        }
    });

    if (existingMembership) {
        redirect("/vendor/dashboard?message=You already have an active subscription for this plan.");
    }

    const subtotal = plan.price;
    const gstRate = 0.18;
    const gstAmount = Math.round(subtotal * gstRate);
    const total = subtotal + gstAmount;

    return (
        <div className="min-w-4xl max-w-7xl mx-auto py-12 px-4">
            <div className="flex flex-col gap-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Checkout</h1>
                    <p className="text-muted-foreground font-medium">Complete your upgrade to {plan.name} to unlock all premium features.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Plan Summary */}
                        <Card className="border-2 border-indigo-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black text-slate-900">{plan.name} Plan</CardTitle>
                                        <CardDescription className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{plan.durationDays >= 365 ? '1 Year' : plan.durationDays >= 180 ? '6 Months' : 'Monthly'}</CardDescription>
                                    </div>
                                    <Badge className="bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {plan.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {plan.features.slice(0, 6).map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-semibold text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/40 rounded-xl border border-dashed flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-indigo-600 opacity-20" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Payment</p>
                                    <p className="text-xs font-bold text-slate-900">Cashfree Secured</p>
                                </div>
                            </div>
                            <div className="p-4 bg-muted/40 rounded-xl border border-dashed flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-indigo-600 opacity-20" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Guarantee</p>
                                    <p className="text-xs font-bold text-slate-900">Instant Activation</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <CheckoutWrapper plan={plan} />
                    </div>
                </div>
            </div>
        </div>
    );
}
