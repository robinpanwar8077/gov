
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Activity, CreditCard, CheckCircle2, Users, Store, ShieldCheck, Zap, ArrowRight, XCircle, AlertCircle, Briefcase } from "lucide-react"
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role, AuthorizationRequest, Product, Membership } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { OnboardingProgress } from "@/components/vendor/onboarding-progress";
import Link from "next/link";
import { format } from "date-fns";
import { AlertTriangle, Calendar } from "lucide-react";


import { getVendorDashboardMetrics } from "@/lib/actions/vendor";
import { VendorDashboardCharts } from "@/components/vendor/vendor-dashboard-charts";


import { subDays } from "date-fns";
import { DashboardDateFilters } from "@/components/dashboard-date-filters";

export default async function Dashboard({
    searchParams
}: {
    searchParams: Promise<{ range?: string }>
}) {
    const session = await getSession();
    if (!session || session.role !== Role.VENDOR) {
        redirect("/login");
    }

    const params = await searchParams;
    const range = params.range || "ALL";

    let vendor = null;
    let stats = null;
    let error = null;

    try {
        [vendor, stats] = await Promise.all([
            prisma.vendorProfile.findUnique({
                where: { userId: session.id as string },
                include: {
                    kycDocuments: true,
                    categories: true,
                    products: {
                        where: (range !== "ALL") ? {
                            createdAt: { gte: subDays(new Date(), parseInt(range)) }
                        } : {}
                    },
                    authRequests: {
                        where: (range !== "ALL") ? {
                            createdAt: { gte: subDays(new Date(), parseInt(range)) }
                        } : {},
                        include: {
                            oem: true,
                            product: true
                        }
                    },
                    user: {
                        include: { memberships: true }
                    }
                }
            }),
            getVendorDashboardMetrics(range)
        ]);
    } catch (e) {
        console.error("Dashboard Data Fetch Error:", e);
        error = "We encountered an issue loading your dashboard. Please try again later.";
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-red-50/50 rounded-xl border border-red-100 text-center">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-900 mb-2">System Error</h3>
                <p className="text-red-700 max-w-md mx-auto mb-6">{error}</p>
                <Button asChild variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
        );
    }

    const pendingAuths = (vendor?.authRequests || []).filter((r) => r.status === 'PENDING').length;
    const authorizedAuths = (vendor?.authRequests || []).filter((r) => r.status === 'APPROVED').length;
    const activeProducts = (vendor?.products || []).filter((p: Product) => !p.isArchived).length;

    // Membership Logic
    const memberships = vendor?.user?.memberships || [];
    const activeMembership = memberships
        .filter(m => m.isActive)
        .sort((a, b) => new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime())[0];

    const isMembershipActive = activeMembership ? new Date(activeMembership.validUntil) > new Date() : false;
    const daysLeft = activeMembership
        ? Math.ceil((new Date(activeMembership.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const showExpiryWarning = isMembershipActive && daysLeft <= 7;
    const isPremium = isMembershipActive && activeMembership?.planName?.toLowerCase() !== 'starter';

    // Simple Logic for Readiness Score
    let readinessScore = 0;
    if (vendor?.kycStatus === 'APPROVED') readinessScore += 40;
    if (authorizedAuths > 0) readinessScore += 30;
    if (activeProducts > 0) readinessScore += 30;

    return (
        <div className="flex flex-col gap-8">
            {/* Expiry Warning Banner */}
            {showExpiryWarning && activeMembership && (
                <div className="bg-amber-100 border-2 border-amber-200 p-4 rounded-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-200 p-2 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-amber-900" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Membership Expiring Soon!</p>
                            <p className="text-xs font-bold text-amber-700">Your {activeMembership.planName} plan expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'} ({format(activeMembership.validUntil, 'PPP')}).</p>
                        </div>
                    </div>
                    <Button variant="default" className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest text-xs" asChild>
                        <Link href="/membership">Renew Now</Link>
                    </Button>
                </div>
            )}

            {/* A. Hero Strip */}
            <div className="bg-linear-to-r from-blue-700 to-indigo-800 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome to GovProNet – Your GeM Business Growth Hub</h1>
                    <p className="text-blue-100 text-lg max-w-3xl">
                        Get verified OEM authorizations, increase bid eligibility, and unlock trusted government business opportunities.
                    </p>
                </div>
            </div>

            <DashboardDateFilters defaultRange={range} basePath="/vendor/dashboard" />

            {/* B. Onboarding & GeM Readiness */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    {
                        vendor?.kycStatus === 'APPROVED' ? (
                            <Card >
                                <CardHeader>
                                    <CardTitle>Recent Updates</CardTitle>
                                    <CardDescription>Latest notifications for your account</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Placeholder for real activity log */}
                                        <div className="flex items-start gap-4 pb-4 border-b">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Welcome to GovProNet!</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Start by completing your profile details.</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">{new Date(vendor?.user?.createdAt || new Date()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {vendor?.kycStatus === 'APPROVED' && (
                                            <div className="flex items-start gap-4 pb-4 border-b">
                                                <div className={`mt-1 w-2 h-2 rounded-full ${vendor?.kycStatus === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'} shrink-0`} />
                                                <div>
                                                    <p className="text-sm font-medium">KYC Assessment Update</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Status: <span className="font-medium">{vendor?.kycStatus}</span></p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-center pt-2">
                                            <Button variant="ghost" size="sm" className="text-xs h-auto py-1">View All Notifications</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <OnboardingProgress vendor={vendor} />
                        )
                    }
                </div>

                <Card className="border-blue-200 shadow-sm bg-blue-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-blue-800">GeM Readiness Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative h-20 w-20 flex items-center justify-center">
                                {/* Simple SVG Circular Progress could go here, for now just text */}
                                <div className="text-3xl font-bold text-blue-700">{readinessScore}%</div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    {vendor?.kycStatus === 'APPROVED' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                    <span className={vendor?.kycStatus === 'APPROVED' ? "text-slate-700 font-medium" : "text-slate-500"}>Profile Verified</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {authorizedAuths > 0 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                    <span className={authorizedAuths > 0 ? "text-slate-700 font-medium" : "text-slate-500"}>OEM Authorization</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeProducts > 0 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                    <span className={activeProducts > 0 ? "text-slate-700 font-medium" : "text-slate-500"}>Product Mapping</span>
                                </div>
                            </div>
                        </div>
                        {readinessScore < 100 && (
                            <p className="text-xs text-blue-600 font-medium mt-2">
                                Complete pending steps to boost your GeM bid eligibility!
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>


            {/* C. Business Performance Analytics */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Business Performance & Analytics</h3>
                {stats ? (
                    <VendorDashboardCharts stats={stats} />
                ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-xl bg-slate-50">
                        <p className="text-muted-foreground">Unable to load analytics data.</p>
                    </div>
                )}

            </div>

            {/* D. Hero Cards & Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* 1. OEM Authorization Hero Card */}
                <Card className="border-indigo-100 shadow-md p-0">
                    <CardHeader className="pb-2 pt-5 pl-5 bg-indigo-50/50 border-b border-indigo-100 rounded-t-xl">
                        <div className="flex items-center gap-2 text-indigo-700">
                            <ShieldCheck className="h-5 w-5" />
                            <CardTitle className="text-base font-bold">OEM Authorization Status</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{authorizedAuths}</p>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Authorized OEMs</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{pendingAuths}</p>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending Requests</p>
                            </div>
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mb-3" asChild>
                            <Link href="/vendor/auth-requests">Request OEM Authorization</Link>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            Authorized vendors get higher bid eligibility on GeM.
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Product Catalog */}
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Product Catalog</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-1">{activeProducts}</div>
                        <p className="text-sm text-muted-foreground mb-6">Active Products Listed</p>
                        <Button variant="outline" className="w-full border-dashed border-slate-300" asChild>
                            <Link href="/vendor/products/new">
                                + Add GeM Product
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* 3. Membership & Networking */}
                <Card className={!isMembershipActive ? "border-amber-200 bg-amber-50/30" : "border-slate-200 shadow-md"}>
                    <CardHeader className="pb-2 pt-5 pl-5 bg-slate-50/50 border-b border-slate-100 rounded-t-xl">
                        <div className="flex items-center justify-between gap-2 text-slate-700">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                <CardTitle className="text-base font-bold">Membership Status</CardTitle>
                            </div>
                            {isMembershipActive ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 uppercase text-[10px] font-black">ACTIVE</Badge>
                            ) : (
                                <Badge className="bg-red-100 text-red-700 border-red-200 uppercase text-[10px] font-black">EXPIRED</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-black text-slate-900">{activeMembership?.planName || 'No Active Plan'}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CURRENT PACKAGE</p>
                            </div>

                            {activeMembership && (
                                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Valid Until</p>
                                        <p className="text-xs font-bold text-slate-900">{format(activeMembership.validUntil, 'PPP')}</p>
                                    </div>
                                </div>
                            )}

                            {!isMembershipActive && (
                                <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                        Your access is restricted. Renew or upgrade to regain full platform capabilities.
                                    </p>
                                </div>
                            )}

                            <Button variant={isMembershipActive ? "outline" : "default"} className={!isMembershipActive ? "w-full bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest text-xs" : "w-full font-black uppercase tracking-widest text-xs"} asChild>
                                <Link href="/membership">
                                    {isMembershipActive ? "Renew or Upgrade" : "Purchase Membership"}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* E. Product Portfolio: Authorized vs Regular */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">Product Portfolio Tracking</h3>
                    <div className="flex items-center gap-4">
                        <Link href="/vendor/auth-requests" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            Auth Requests <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link href="/vendor/products" className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:underline flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            My Catalog <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* 1. Authorized OEM Products */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700">Verified OEM Capabilities ({authorizedAuths})</h4>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {authorizedAuths === 0 ? (
                                <Card className="col-span-full border-dashed p-8 bg-green-50/10 border-green-100">
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <ShieldCheck className="w-6 h-6 text-green-200" />
                                        <p className="text-xs font-bold text-slate-400 uppercase">No Active Authorizations</p>
                                        <Button variant="outline" size="sm" className="h-7 text-[9px] font-black uppercase" asChild>
                                            <Link href="/vendor/auth-requests/new">Add First</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                vendor?.authRequests?.filter(r => r.status === 'APPROVED').slice(0, 4).map((req) => (
                                    <Card key={req.id} className="bg-white border-green-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-green-500">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge className="bg-green-100 text-green-700 uppercase text-[8px] font-black border-green-200 h-4 px-1">
                                                        Authorized
                                                    </Badge>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">{format(req.updatedAt, 'MMM yyyy')}</span>
                                                </div>
                                                <h5 className="font-bold text-xs tracking-tight text-slate-800 line-clamp-1">{req.product.name}</h5>
                                                <p className="text-[9px] text-muted-foreground font-black uppercase truncate">{req.oem.companyName}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 2. Non-Authorized / Independent Listings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Store className="w-5 h-5 text-slate-600" />
                            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700">Independent Product Listings ({activeProducts})</h4>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {activeProducts === 0 ? (
                                <Card className="col-span-full border-dashed p-8 bg-slate-50/50 border-slate-200">
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <Store className="w-6 h-6 text-slate-200" />
                                        <p className="text-xs font-bold text-slate-400 uppercase">No Custom Listings</p>
                                        <Button variant="outline" size="sm" className="h-7 text-[9px] font-black uppercase" asChild>
                                            <Link href="/vendor/products/new">Add Product</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                vendor?.products?.filter(p => !p.isArchived).slice(0, 4).map((product: any) => (
                                    <Card key={product.id} className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-slate-400">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-slate-500 uppercase text-[8px] font-black border-slate-200 h-4 px-1">
                                                        Independent
                                                    </Badge>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">{format(product.createdAt, 'MMM yyyy')}</span>
                                                </div>
                                                <h5 className="font-bold text-xs tracking-tight text-slate-800 line-clamp-1">{product.name}</h5>
                                                <p className="text-[9px] text-muted-foreground font-black uppercase truncate">Self-Listed Item</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* F. "How It Helps" Section */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">How GovProNet Helps You Win GeM Business</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-50 border-none shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h4 className="font-semibold mb-1">Verified OEM Access</h4>
                            <p className="text-xs text-muted-foreground">Directly connect with genuine OEMs for authorization letters.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-none shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                                <Zap className="h-5 w-5" />
                            </div>
                            <h4 className="font-semibold mb-1">Faster Workflows</h4>
                            <p className="text-xs text-muted-foreground">Digital authorization requests reduce delays and paperwork.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-none shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                            <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                                <Users className="h-5 w-5" />
                            </div>
                            <h4 className="font-semibold mb-1">Trusted Networking</h4>
                            <p className="text-xs text-muted-foreground">Join a closed network of verified government suppliers.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* G. Quick Actions (Business Language) */}
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Business Actions</CardTitle>
                        <CardDescription>Shortcuts to grow your business</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Link href="/vendor/products/new" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2 text-center group cursor-pointer">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                                <Store className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">Add GeM Product</span>
                        </Link>
                        <Link href="/vendor/auth-requests" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2 text-center group cursor-pointer">
                            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">Request OEM Authorization</span>
                        </Link>
                        <Link href="#" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2 text-center group cursor-pointer opacity-50" title="Coming Soon">
                            <div className="p-2 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-200">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">Manage Orders</span>
                        </Link>
                        <Link href="/events" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2 text-center group cursor-pointer">
                            <div className="p-2 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">View Government Events</span>
                        </Link>
                    </CardContent>
                </Card>


            </div>
        </div>
    )
}

