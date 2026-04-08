
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { getAdminUserById } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    Mail,
    Phone,
    ShieldCheck,
    ShieldOff,
    Calendar,
    Building2,
    Briefcase,
    Wrench,
    UserCog,
    FileText,
    CreditCard,
    Bell,
    ClipboardList,
    ExternalLink,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Info,
    Star,
} from "lucide-react";

const KYC_STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
    PENDING: {
        color: "bg-yellow-50 text-yellow-800 border-yellow-300",
        icon: <AlertCircle className="h-4 w-4" />,
    },
    APPROVED: {
        color: "bg-green-50 text-green-800 border-green-300",
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    REJECTED: {
        color: "bg-red-50 text-red-800 border-red-300",
        icon: <XCircle className="h-4 w-4" />,
    },
    NEEDS_MORE_INFO: {
        color: "bg-blue-50 text-blue-800 border-blue-300",
        icon: <Info className="h-4 w-4" />,
    },
};

const ROLE_META: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    VENDOR: {
        color: "text-purple-700 bg-purple-50 border-purple-200",
        icon: <Wrench className="h-4 w-4" />,
        label: "Vendor",
    },
    OEM: {
        color: "text-sky-700 bg-sky-50 border-sky-200",
        icon: <Building2 className="h-4 w-4" />,
        label: "OEM",
    },
    CONSULTANT: {
        color: "text-amber-700 bg-amber-50 border-amber-200",
        icon: <Briefcase className="h-4 w-4" />,
        label: "Consultant",
    },
    ADMIN: {
        color: "text-rose-700 bg-rose-50 border-rose-200",
        icon: <UserCog className="h-4 w-4" />,
        label: "Admin",
    },
};

function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(d: Date | string) {
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b last:border-b-0 border-slate-100">
            <span className="text-sm font-semibold text-slate-500 min-w-[160px]">{label}</span>
            <span className="text-sm text-slate-800">{value || <span className="text-slate-400">—</span>}</span>
        </div>
    );
}

function KycDocList({ docs }: { docs: any[] }) {
    if (!docs || docs.length === 0) return <p className="text-sm text-slate-400 py-2">No documents uploaded.</p>;
    return (
        <div className="space-y-2">
            {docs.map((doc: any) => {
                const style = KYC_STATUS_STYLES[doc.status] || { color: "bg-gray-50 text-gray-700 border-gray-200", icon: null };
                return (
                    <div key={doc.id} className="flex items-center justify-between rounded-xl border-2 border-slate-100 px-4 py-2.5 bg-slate-50">
                        <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <div>
                                <p className="text-sm font-semibold text-slate-700">{doc.documentType}</p>
                                {doc.notes && <p className="text-xs text-slate-400 mt-0.5">{doc.notes}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${style.color}`}
                            >
                                {style.icon}
                                {doc.status.replace("_", " ")}
                            </span>
                            <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) redirect("/login");

    const { id } = await params;
    const user = await getAdminUserById(id);

    if (!user) notFound();

    const roleMeta = user.role ? ROLE_META[user.role] : null;
    const profile = user.vendorProfile || user.oemProfile || user.consultantProfile;
    const profileName = user.consultantProfile?.name || (profile as any)?.companyName || "—";
    const kycStatus = (profile as any)?.kycStatus;
    const kycStyle = kycStatus ? KYC_STATUS_STYLES[kycStatus] : null;

    const activeMembership = user.memberships?.find((m: any) => m.isActive);

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
            {/* Back + Header */}
            <div className="flex items-start gap-4">
                <Button variant="outline" size="icon" asChild className="border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:shadow-none transition-all rounded-xl mt-1">
                    <Link href="/admin/users">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tight">{profileName}</h1>
                        {roleMeta && (
                            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full border-2 ${roleMeta.color}`}>
                                {roleMeta.icon}
                                {roleMeta.label}
                            </span>
                        )}
                        {kycStyle && kycStatus && (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${kycStyle.color}`}>
                                {kycStyle.icon}
                                KYC: {kycStatus.replace("_", " ")}
                            </span>
                        )}
                        {user.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-300 px-2.5 py-1 rounded-full">
                                <ShieldCheck className="h-3.5 w-3.5" /> Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-full">
                                <ShieldOff className="h-3.5 w-3.5" /> Unverified
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                        User ID: <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{user.id}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Account Info */}
                    <Card className="border-2 border-slate-200 rounded-2xl shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <UserCog className="h-4 w-4 text-slate-500" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InfoRow label="Email" value={
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    {user.email}
                                </span>
                            } />
                            <InfoRow label="Mobile" value={user.mobile ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    {user.mobile}
                                </span>
                            ) : null} />
                            <InfoRow label="Role" value={user.role || "Not assigned"} />
                            <InfoRow label="Verified" value={user.isVerified ? "Yes" : "No"} />
                            <InfoRow label="Joined" value={
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {formatDate(user.createdAt)}
                                </span>
                            } />
                            <InfoRow label="Last Updated" value={formatDate(user.updatedAt)} />
                        </CardContent>
                    </Card>

                    {/* Profile Details */}
                    {user.vendorProfile && (
                        <Card className="border-2 border-purple-200 rounded-2xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-purple-700">
                                    <Wrench className="h-4 w-4" /> Vendor Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InfoRow label="Company Name" value={user.vendorProfile.companyName} />
                                <InfoRow label="PAN" value={(user.vendorProfile as any).pan} />
                                <InfoRow label="GST" value={(user.vendorProfile as any).gst} />
                                <InfoRow label="Contact Person" value={(user.vendorProfile as any).contactPerson} />
                                <InfoRow label="Contact Email" value={(user.vendorProfile as any).contactEmail} />
                                <InfoRow label="Contact Phone" value={(user.vendorProfile as any).contactPhone} />
                                <InfoRow label="Registered Address" value={(user.vendorProfile as any).registeredAddress} />
                                <InfoRow label="Onboarding Step" value={`Step ${(user.vendorProfile as any).onboardingStep}`} />
                                <div className="pt-3">
                                    <p className="text-sm font-semibold text-slate-500 mb-2">KYC Documents</p>
                                    <KycDocList docs={user.vendorProfile.kycDocuments} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {user.oemProfile && (
                        <Card className="border-2 border-sky-200 rounded-2xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-sky-700">
                                    <Building2 className="h-4 w-4" /> OEM Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InfoRow label="Company Name" value={user.oemProfile.companyName} />
                                <InfoRow label="OEM Type" value={(user.oemProfile as any).oemType} />
                                <InfoRow label="Registration No." value={(user.oemProfile as any).registrationNumber} />
                                <InfoRow label="Contact Person" value={(user.oemProfile as any).contactPerson} />
                                <InfoRow label="Contact Email" value={(user.oemProfile as any).contactEmail} />
                                <InfoRow label="Contact Phone" value={(user.oemProfile as any).contactPhone} />
                                <InfoRow label="Registered Address" value={(user.oemProfile as any).registeredAddress} />
                                <div className="pt-3">
                                    <p className="text-sm font-semibold text-slate-500 mb-2">KYC Documents</p>
                                    <KycDocList docs={user.oemProfile.kycDocuments} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {user.consultantProfile && (
                        <Card className="border-2 border-amber-200 rounded-2xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-700">
                                    <Briefcase className="h-4 w-4" /> Consultant Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InfoRow label="Name" value={user.consultantProfile.name} />
                                <InfoRow label="Firm Name" value={user.consultantProfile.firmName} />
                                <InfoRow label="Experience" value={user.consultantProfile.experience ? `${user.consultantProfile.experience} years` : null} />
                                <InfoRow label="Bio" value={user.consultantProfile.bio} />
                                <InfoRow label="Key Services" value={user.consultantProfile.keyServices} />
                                <InfoRow label="Contact Email" value={user.consultantProfile.contactEmail} />
                                <InfoRow label="Contact Phone" value={user.consultantProfile.contactPhone} />
                                <InfoRow label="Office Address" value={user.consultantProfile.officeAddress} />
                                {user.consultantProfile.services && user.consultantProfile.services.length > 0 && (
                                    <div className="pt-3">
                                        <p className="text-sm font-semibold text-slate-500 mb-2">Active Services ({user.consultantProfile.services.length})</p>
                                        <div className="space-y-1.5">
                                            {user.consultantProfile.services.map((svc: any) => (
                                                <div key={svc.id} className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                                    <p className="font-semibold text-amber-800">{svc.title}</p>
                                                    {svc.pricingModel && <p className="text-xs text-amber-600 mt-0.5">{svc.pricingModel}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="pt-3">
                                    <p className="text-sm font-semibold text-slate-500 mb-2">KYC Documents</p>
                                    <KycDocList docs={user.consultantProfile.kycDocuments} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Audit Log */}
                    {user.auditLogs && user.auditLogs.length > 0 && (
                        <Card className="border-2 border-slate-200 rounded-2xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <ClipboardList className="h-4 w-4 text-slate-500" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>Last 20 audit log entries</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {user.auditLogs.map((log: any) => (
                                        <div key={log.id} className="flex items-start gap-3 text-sm py-2 border-b last:border-b-0 border-slate-100">
                                            <span className="font-mono text-xs text-slate-400 whitespace-nowrap mt-0.5">{formatDateTime(log.createdAt)}</span>
                                            <div>
                                                <span className="font-semibold text-slate-700">{log.action}</span>
                                                {log.details && <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    {/* Membership */}
                    <Card className="border-2 border-indigo-200 rounded-2xl shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-700">
                                <Star className="h-4 w-4" /> Membership
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeMembership ? (
                                <div>
                                    <p className="text-lg font-black text-indigo-800">{activeMembership.planName}</p>
                                    <p className="text-xs text-slate-500 mt-1">Valid until {formatDate(activeMembership.validUntil)}</p>
                                    {activeMembership.plan && (
                                        <p className="text-xs text-slate-400 mt-1">{activeMembership.plan.type}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">No active membership</p>
                            )}
                            {user.memberships && user.memberships.length > 1 && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500 mb-2">History ({user.memberships.length})</p>
                                    <div className="space-y-1.5">
                                        {user.memberships.slice(0, 4).map((m: any) => (
                                            <div key={m.id} className="text-xs text-slate-600 flex justify-between">
                                                <span>{m.planName}</span>
                                                <span className={m.isActive ? "text-green-600 font-semibold" : "text-slate-400"}>{m.isActive ? "Active" : "Expired"}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payments */}
                    {user.payments && user.payments.length > 0 && (
                        <Card className="border-2 border-slate-200 rounded-2xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-slate-500" /> Payments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {user.payments.map((p: any) => (
                                        <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b last:border-b-0 border-slate-100">
                                            <div>
                                                <p className="font-semibold text-slate-700">₹{p.amount.toLocaleString("en-IN")}</p>
                                                <p className="text-xs text-slate-400">{formatDate(p.createdAt)}</p>
                                            </div>
                                            <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                                                p.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-700"
                                                    : p.status === "FAILED"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notifications */}
                    {user.notifications && user.notifications.length > 0 && (
                        <Card className="border-2 border-slate-200 rounded-2xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-slate-500" /> Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {user.notifications.map((n: any) => (
                                        <div key={n.id} className={`rounded-xl px-3 py-2.5 text-sm border ${n.isRead ? "bg-slate-50 border-slate-100 text-slate-500" : "bg-indigo-50 border-indigo-200 text-indigo-800"}`}>
                                            <p className="font-semibold">{n.title}</p>
                                            <p className="text-xs mt-0.5 opacity-80">{n.message}</p>
                                            <p className="text-xs mt-1 opacity-50">{formatDate(n.createdAt)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Links */}
                    {user.role && user.role !== "ADMIN" && (
                        <Card className="border-2 border-slate-200 rounded-2xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                {(user.vendorProfile || user.oemProfile || user.consultantProfile) && (
                                    <Button variant="outline" size="sm" asChild className="justify-start border-2 border-slate-200 rounded-xl">
                                        <Link href={`/admin/approvals/${profile?.id}?role=${user.role}`}>
                                            <FileText className="h-3.5 w-3.5 mr-2" />
                                            Review KYC
                                            <ExternalLink className="h-3 w-3 ml-auto" />
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
