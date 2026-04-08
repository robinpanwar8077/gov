
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, CreditCard, ArrowRight, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function MembershipSuccessPage({
    searchParams
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { id: membershipId } = await searchParams;

    if (!membershipId) redirect("/membership");

    const membership = await prisma.membership.findUnique({
        where: { id: membershipId },
        include: {
            plan: true,
            payment: {
                include: {
                    coupon: true
                }
            }
        }
    });

    if (!membership || membership.userId !== session.id) {
        redirect("/membership");
    }

    const { plan, payment } = membership;

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-slate-50/50">
            <div className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Subscription Confirmed!</h1>
                    <p className="text-lg font-medium text-slate-600">You are now a {membership.planName} member.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Membership Details */}
                    <Card className="border-2 border-slate-900 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-6">
                            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                                Validity Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Plan Name</p>
                                    <p className="text-xl font-black text-slate-900">{membership.planName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Activated On</p>
                                        <p className="font-bold text-slate-900">{format(membership.validFrom, "PPP")}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Expires On</p>
                                        <p className="font-bold text-slate-900">{format(membership.validUntil, "PPP")}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 font-bold px-3 py-1">
                                        STATUS: ACTIVE
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <Card className="border-2 border-slate-200 border-dashed shadow-sm bg-white">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                <CreditCard className="w-5 h-5 text-slate-400" />
                                Payment Receipt
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-500">Transaction ID</span>
                                    <span className="font-mono font-bold text-slate-900 text-xs">{payment?.cashfreePaymentId || "N/A (FREE)"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-500">Order Reference</span>
                                    <span className="font-mono font-bold text-slate-900 text-xs">{payment?.cashfreeOrderId || membership.paymentId}</span>
                                </div>
                                <div className="h-px bg-slate-100 my-2" />
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-500">Amount Paid</span>
                                    <span className="font-black text-slate-900 text-lg">₹{(payment?.amount || 0).toLocaleString()}</span>
                                </div>
                                {payment?.discountAmount && payment.discountAmount > 0 && (
                                    <div className="flex justify-between text-[10px] text-green-600 font-bold uppercase tracking-tight">
                                        <span>Discount ({payment.coupon?.code})</span>
                                        <span>-₹{(payment.discountAmount || 0).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 space-y-3">
                                <Button variant="outline" className="w-full font-black uppercase tracking-widest text-xs gap-2 border-2" disabled>
                                    <Download className="w-4 h-4" /> Download Invoice
                                </Button>
                                <p className="text-[9px] text-center font-bold text-slate-400 uppercase">Coming Soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-base font-black uppercase tracking-widest gap-2">
                        <Link href="/vendor/dashboard">
                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 h-14 border-2 text-base font-black uppercase tracking-widest gap-2">
                        <Link href="/membership">
                            View All Plans
                        </Link>
                    </Button>
                </div>

                <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">A confirmation email has been sent to {session.email as string}</p>
                </div>
            </div>
        </div>
    );
}
