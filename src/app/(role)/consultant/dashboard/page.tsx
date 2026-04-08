import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import {
    Activity, CheckCircle2, Users, ShieldCheck, Zap, ArrowRight,
    XCircle, AlertCircle, Briefcase, BookOpen, MessageSquare,
    Star, TrendingUp, UserCheck, FileText, Clock, Award
} from "lucide-react"
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { AlertTriangle, Calendar } from "lucide-react";

export default async function Dashboard() {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        redirect("/login");
    }

    let consultant = null;
    let error = null;

    try {
        consultant = await prisma.consultantProfile.findUnique({
            where: { userId: session.id as string },
            include: {
                kycDocuments: true,
                categories: true,
                services: true,
                user: {
                    include: { memberships: true }
                }
            }
        });
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

    const activeServices = (consultant?.services || []).filter(s => s.isActive).length;
    const totalServices = (consultant?.services || []).length;
    const hasCategories = (consultant?.categories || []).length > 0;
    const hasBio = !!consultant?.bio;
    const hasContactEmail = !!consultant?.contactEmail;
    const hasContactPhone = !!consultant?.contactPhone;

    // Membership Logic
    const memberships = consultant?.user?.memberships || [];
    const activeMembership = memberships
        .filter(m => m.isActive)
        .sort((a, b) => new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime())[0];

    const isMembershipActive = activeMembership ? new Date(activeMembership.validUntil) > new Date() : false;
    const daysLeft = activeMembership
        ? Math.ceil((new Date(activeMembership.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const showExpiryWarning = isMembershipActive && daysLeft <= 7;

    // Profile Completeness Score
    let profileScore = 0;
    if (consultant?.name) profileScore += 15;
    if (hasBio) profileScore += 20;
    if (consultant?.experience) profileScore += 10;
    if (hasContactEmail) profileScore += 10;
    if (hasContactPhone) profileScore += 10;
    if (hasCategories) profileScore += 15;
    if (consultant?.kycStatus === 'APPROVED') profileScore += 20;

    // Readiness score for consulting
    let readinessScore = 0;
    if (consultant?.kycStatus === 'APPROVED') readinessScore += 30;
    if (activeServices > 0) readinessScore += 30;
    if (hasBio && hasCategories) readinessScore += 20;
    if (isMembershipActive) readinessScore += 20;

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
            <div className="bg-linear-to-r from-sky-700 to-cyan-800 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {consultant?.name || 'Consultant'}!</h1>
                    <p className="text-sky-100 text-lg max-w-3xl">
                        Manage your consulting services, connect with vendors & OEMs, and grow your government consulting practice.
                    </p>
                </div>
            </div>

            {/* B. Profile Completeness & Readiness */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Completeness */}
                <div className="lg:col-span-2">
                    {consultant?.kycStatus === 'APPROVED' ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest updates for your account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 pb-4 border-b">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">Welcome to GovProNet!</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Your consulting profile is live and visible to vendors & OEMs.</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(consultant?.user?.createdAt || new Date()).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {consultant?.kycStatus === 'APPROVED' && (
                                        <div className="flex items-start gap-4 pb-4 border-b">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">KYC Verification Complete</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Status: <span className="font-medium text-green-600">APPROVED</span></p>
                                            </div>
                                        </div>
                                    )}
                                    {activeServices > 0 && (
                                        <div className="flex items-start gap-4 pb-4 border-b">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">{activeServices} Active Service{activeServices > 1 ? 's' : ''} Listed</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Your services are visible in the consultant directory.</p>
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
                        /* Profile Completion Checklist for un-verified consultants */
                        <Card className="border-sky-200 shadow-sm bg-sky-50/30">
                            <CardHeader>
                                <CardTitle className="text-sky-800">Complete Your Profile</CardTitle>
                                <CardDescription>Complete these steps to get verified and start receiving inquiries</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                                        {consultant?.name ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-slate-300 shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">Basic Information</p>
                                            <p className="text-xs text-muted-foreground">Name, firm name, experience</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/consultant/profile">Update</Link>
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                                        {hasBio ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-slate-300 shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">Professional Bio</p>
                                            <p className="text-xs text-muted-foreground">Describe your expertise and specializations</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/consultant/profile">Add Bio</Link>
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                                        {hasCategories ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-slate-300 shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">Expertise Areas</p>
                                            <p className="text-xs text-muted-foreground">Select your consulting categories</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/consultant/profile">Select</Link>
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                                        {activeServices > 0 ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-slate-300 shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">Service Listings</p>
                                            <p className="text-xs text-muted-foreground">Add at least one consulting service</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/consultant/services">Add Service</Link>
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                                        {String(consultant?.kycStatus) === 'APPROVED' ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> : <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">KYC Verification</p>
                                            <p className="text-xs text-muted-foreground">Upload your documents for verification</p>
                                        </div>
                                        <Badge className={
                                            String(consultant?.kycStatus) === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                String(consultant?.kycStatus) === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                String(consultant?.kycStatus) === 'NEEDS_MORE_INFO' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                        }>{consultant?.kycStatus?.replace(/_/g, ' ') || 'PENDING'}</Badge>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">Profile Completion</span>
                                        <span className="text-xs font-black text-sky-900">{profileScore}%</span>
                                    </div>
                                    <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-600 rounded-full transition-all duration-500" style={{ width: `${profileScore}%` }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Readiness Score */}
                <Card className="border-sky-200 shadow-sm bg-sky-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-sky-800">Consulting Readiness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative h-20 w-20 flex items-center justify-center">
                                <div className="text-3xl font-bold text-sky-700">{readinessScore}%</div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    {consultant?.kycStatus === 'APPROVED' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                    <span className={consultant?.kycStatus === 'APPROVED' ? "text-slate-700 font-medium" : "text-slate-500"}>KYC Verified</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeServices > 0 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                    <span className={activeServices > 0 ? "text-slate-700 font-medium" : "text-slate-500"}>Services Listed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasBio && hasCategories ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                    <span className={hasBio && hasCategories ? "text-slate-700 font-medium" : "text-slate-500"}>Profile Complete</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isMembershipActive ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                                    <span className={isMembershipActive ? "text-slate-700 font-medium" : "text-slate-500"}>Active Membership</span>
                                </div>
                            </div>
                        </div>
                        {readinessScore < 100 && (
                            <p className="text-xs text-sky-600 font-medium mt-2">
                                Complete pending steps to attract more clients and inquiries!
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* C. Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Services Card */}
                <Card className="border-purple-100 shadow-md p-0">
                    <CardHeader className="pb-2 pt-5 pl-5 bg-purple-50/50 border-b border-purple-100 rounded-t-xl">
                        <div className="flex items-center gap-2 text-purple-700">
                            <Briefcase className="h-5 w-5" />
                            <CardTitle className="text-base font-bold">My Services</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{activeServices}</p>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Active Services</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{totalServices - activeServices}</p>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Inactive</p>
                            </div>
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-3" asChild>
                            <Link href="/consultant/services">Manage Services</Link>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            Well-defined services attract more clients on the platform.
                        </p>
                    </CardContent>
                </Card>

                {/* KYC & Profile Card */}
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Profile & Verification</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">KYC Status</span>
                                <Badge className={
                                    consultant?.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                        consultant?.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-amber-100 text-amber-700 border-amber-200'
                                }>{consultant?.kycStatus || 'PENDING'}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Expertise Areas</span>
                                <span className="text-sm font-bold text-slate-900">{(consultant?.categories || []).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Experience</span>
                                <span className="text-sm font-bold text-slate-900">{consultant?.experience ? `${consultant.experience} yrs` : 'Not set'}</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-dashed border-slate-300" asChild>
                            <Link href="/consultant/profile">
                                Update Profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Membership Card */}
                <Card className={!isMembershipActive ? "border-amber-200 bg-amber-50/30" : "border-slate-200 shadow-md"}>
                    <CardHeader className="pb-2 pt-5 pl-5 bg-slate-50/50 border-b border-slate-100 rounded-t-xl">
                        <div className="flex items-center justify-between gap-2 text-slate-700">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-sky-600" />
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

            {/* D. Active Services Showcase */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Your Active Services</h3>
                    <Link href="/consultant/services" className="text-xs font-bold text-sky-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                        Manage All <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeServices === 0 ? (
                        <Card className="col-span-full border-dashed p-10 bg-muted/5">
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="p-3 bg-muted rounded-full text-muted-foreground">
                                    <Briefcase className="w-8 h-8 opacity-20" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-muted-foreground">No Services Listed Yet</h4>
                                    <p className="text-xs text-muted-foreground max-w-sm">Add your consulting services to be visible in the directory and attract potential clients.</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/consultant/services/add">Add Your First Service</Link>
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        consultant?.services?.filter(s => s.isActive).slice(0, 6).map((svc) => (
                            <Card key={svc.id} className="bg-white border-purple-50 shadow-sm group hover:shadow-md transition-all">
                                <CardContent className="p-5">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 uppercase text-[9px] font-black border-green-200 h-5 px-1.5">
                                                Active
                                            </Badge>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight text-slate-800 line-clamp-1">{svc.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{svc.description}</p>
                                        </div>
                                        {svc.pricingModel && (
                                            <div className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md w-fit">
                                                {svc.pricingModel}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* E. How It Helps Section */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">How GovProNet Helps Consultants</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-50 border-none shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                            <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                                <Users className="h-5 w-5" />
                            </div>
                            <h4 className="font-semibold mb-1">Direct Client Access</h4>
                            <p className="text-xs text-muted-foreground">Connect with verified vendors and OEMs seeking expert consulting services.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-none shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                            <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                                <Award className="h-5 w-5" />
                            </div>
                            <h4 className="font-semibold mb-1">Verified Credibility</h4>
                            <p className="text-xs text-muted-foreground">KYC verification badge builds trust and boosts your profile visibility.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-none shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center text-center p-6">
                            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <h4 className="font-semibold mb-1">Grow Your Practice</h4>
                            <p className="text-xs text-muted-foreground">Showcase services and gain visibility in government procurement networks.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* F. Quick Actions */}
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Shortcuts to manage your consulting practice</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Link href="/consultant/services/add" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2 text-center group cursor-pointer">
                            <div className="p-2 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-200">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">Add New Service</span>
                        </Link>
                        <Link href="/consultant/profile" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2 text-center group cursor-pointer">
                            <div className="p-2 rounded-full bg-sky-100 text-sky-600 group-hover:bg-sky-200">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">Update Profile</span>
                        </Link>
                        <Link href="/consultant/messages" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2 text-center group cursor-pointer">
                            <div className="p-2 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">Check Messages</span>
                        </Link>
                        <Link href="/directory/consultants" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2 text-center group cursor-pointer">
                            <div className="p-2 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">View Directory</span>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
