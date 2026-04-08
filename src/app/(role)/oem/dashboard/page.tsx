import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role } from "@/lib/types";
import { redirect } from "next/navigation";
import { OnboardingProgress } from "@/components/oem/onboarding-progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, GitPullRequest, Settings, CheckCircle, FileText, LayoutDashboard, AlertTriangle, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { getOEMDashboardMetrics } from "@/lib/actions/oem";
import { OEMDashboardCharts } from "@/components/oem/oem-dashboard-charts";
import { Badge } from "@/components/ui/badge";

export default async function Dashboard() {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        redirect("/login");
    }

    let oem = null;
    let stats = null;
    let error = null;

    try {
        [oem, stats] = await Promise.all([
            prisma.oEMProfile.findUnique({
                where: { userId: session.id as string },
                include: {
                    kycDocuments: true,
                    catalog: {
                        where: { isArchived: false }
                    },
                    receivedRequests: {
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            vendor: true,
                            product: true
                        }
                    }
                }
            }),
            getOEMDashboardMetrics()
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

    return (
        <div className="flex flex-col gap-8">
            {/* A. Hero Strip */}
            <div className="bg-linear-to-r from-emerald-700 to-teal-800 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back, {oem?.companyName || 'Partner'}</h1>
                    <p className="text-emerald-100 text-lg max-w-3xl">
                        Manage your product catalog, authorize vendors, and track your channel performance on GeM.
                    </p>
                </div>
            </div>

            {/* B. Onboarding Status */}
            {oem?.kycStatus !== 'APPROVED' && (
                <div className="animate-in slide-in-from-top-4">
                    <OnboardingProgress oem={oem as any} />
                </div>
            )}

            {/* C. Business Performance Analytics */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Business Performance & Analytics</h3>
                {stats ? (
                    <OEMDashboardCharts stats={stats} />
                ) : (
                    <div className="p-8 text-center border-2 border-dashed rounded-xl bg-slate-50">
                        <p className="text-muted-foreground">Unable to load analytics data.</p>
                    </div>
                )}
            </div>

            {/* D. Recent Authorization Requests List (More detailed view) */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Authorization Requests</CardTitle>
                            <CardDescription>Manage incoming requests from vendors</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/oem/requests">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {oem?.receivedRequests.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed">
                                    <p className="text-sm text-muted-foreground">No pending requests at the moment.</p>
                                </div>
                            ) : (
                                oem?.receivedRequests.map((req: any) => (
                                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {req.vendor?.companyName?.charAt(0) || 'V'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{req.vendor?.companyName}</p>
                                                <p className="text-xs text-muted-foreground">Request for: <span className="font-medium text-slate-700">{req.product?.name}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className={`uppercase text-[10px] font-black border-0 ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                        'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                }`}>
                                                {req.status}
                                            </Badge>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                <Link href={`/oem/requests/${req.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* E. Quick Actions & Status */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Link href="/oem/catalog/new" className="flex items-center p-3 border rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-all group cursor-pointer gap-3">
                                <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                                    <Package className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm text-slate-700">Add New Product</span>
                            </Link>
                            <Link href="/oem/requests" className="flex items-center p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all group cursor-pointer gap-3">
                                <div className="p-2 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                                    <GitPullRequest className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm text-slate-700">Review Requests</span>
                            </Link>
                            <Link href="/oem/profile" className="flex items-center p-3 border rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all group cursor-pointer gap-3">
                                <div className="p-2 rounded-full bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                                    <Settings className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm text-slate-700">Settings</span>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-400">
                                <ShieldCheck className="h-5 w-5" />
                                Data Privacy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-slate-400 mb-4">
                                Your catalog data is secure. Only authorized vendors can generate certificates for your products.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-500">
                                <CheckCircle className="h-3 w-3" />
                                <span>End-to-End Encrypted</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
