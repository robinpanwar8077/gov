
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { getAdminUsers } from "@/lib/actions/admin";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users,
    Search,
    ShieldCheck,
    ShieldOff,
    UserCog,
    ArrowUpRight,
    Building2,
    Briefcase,
    Wrench,
} from "lucide-react";
import { UsersFilterBar } from "@/app/(role)/admin/users/users-filter-bar";

const KYC_STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    APPROVED: "bg-green-100 text-green-800 border-green-300",
    REJECTED: "bg-red-100 text-red-800 border-red-300",
    NEEDS_MORE_INFO: "bg-blue-100 text-blue-800 border-blue-300",
};

const ROLE_ICON: Record<string, React.ReactNode> = {
    VENDOR: <Wrench className="h-3.5 w-3.5" />,
    OEM: <Building2 className="h-3.5 w-3.5" />,
    CONSULTANT: <Briefcase className="h-3.5 w-3.5" />,
    ADMIN: <UserCog className="h-3.5 w-3.5" />,
};

const ROLE_COLOR: Record<string, string> = {
    VENDOR: "bg-purple-100 text-purple-800 border-purple-300",
    OEM: "bg-sky-100 text-sky-800 border-sky-300",
    CONSULTANT: "bg-amber-100 text-amber-800 border-amber-300",
    ADMIN: "bg-rose-100 text-rose-800 border-rose-300",
};

function getProfileName(user: any): string {
    if (user.vendorProfile) return user.vendorProfile.companyName;
    if (user.oemProfile) return user.oemProfile.companyName;
    if (user.consultantProfile) return user.consultantProfile.name;
    return "—";
}

function getKycStatus(user: any): string | null {
    if (user.vendorProfile) return user.vendorProfile.kycStatus;
    if (user.oemProfile) return user.oemProfile.kycStatus;
    if (user.consultantProfile) return user.consultantProfile.kycStatus;
    return null;
}

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) redirect("/login");

    const params = await searchParams;
    const page = parseInt(params.page || "1", 10);
    const search = params.search || "";
    const role = params.role || "";
    const verified = params.verified || "";

    const data = await getAdminUsers({ page, search, role, verified });

    const users = data?.users || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 1;

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">User Directory</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Manage all platform users — vendors, OEMs, consultants, and admins.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 border-2 border-slate-200">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-bold text-slate-700">{total} Users</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar (Client Component) */}
            <UsersFilterBar defaultSearch={search} defaultRole={role} defaultVerified={verified} />

            {/* Table */}
            <div className="rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-bold text-slate-700 w-[220px]">Email</TableHead>
                            <TableHead className="font-bold text-slate-700">Profile / Company</TableHead>
                            <TableHead className="font-bold text-slate-700">Role</TableHead>
                            <TableHead className="font-bold text-slate-700">KYC</TableHead>
                            <TableHead className="font-bold text-slate-700">Membership</TableHead>
                            <TableHead className="font-bold text-slate-700">Verified</TableHead>
                            <TableHead className="font-bold text-slate-700">Joined</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center h-40 text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-10 w-10 text-slate-300" />
                                        <span className="font-medium">No users found matching your filters.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user: any) => {
                                const kycStatus = getKycStatus(user);
                                const profileName = getProfileName(user);
                                const activeMembership = user.memberships?.[0];

                                return (
                                    <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                        {/* Email */}
                                        <TableCell className="font-medium text-slate-800 max-w-[220px] truncate">
                                            {user.email}
                                            {user.mobile && (
                                                <div className="text-xs text-slate-400 mt-0.5">{user.mobile}</div>
                                            )}
                                        </TableCell>

                                        {/* Profile Name */}
                                        <TableCell className="text-slate-600">
                                            {profileName}
                                        </TableCell>

                                        {/* Role */}
                                        <TableCell>
                                            {user.role ? (
                                                <span
                                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLOR[user.role] || "bg-gray-100 text-gray-800 border-gray-300"}`}
                                                >
                                                    {ROLE_ICON[user.role]}
                                                    {user.role}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">No role</span>
                                            )}
                                        </TableCell>

                                        {/* KYC Status */}
                                        <TableCell>
                                            {kycStatus ? (
                                                <span
                                                    className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${KYC_STATUS_STYLES[kycStatus] || "bg-gray-100 text-gray-700 border-gray-300"}`}
                                                >
                                                    {kycStatus.replace("_", " ")}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">—</span>
                                            )}
                                        </TableCell>

                                        {/* Membership */}
                                        <TableCell>
                                            {activeMembership ? (
                                                <div>
                                                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1">
                                                        {activeMembership.planName}
                                                    </span>
                                                    <div className="text-xs text-slate-400 mt-0.5">
                                                        Until {formatDate(activeMembership.validUntil)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">Free</span>
                                            )}
                                        </TableCell>

                                        {/* Verified */}
                                        <TableCell>
                                            {user.isVerified ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                                                    <ShieldOff className="h-4 w-4" />
                                                    No
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Joined */}
                                        <TableCell className="text-sm text-slate-500">
                                            {formatDate(user.createdAt)}
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Link href={`/admin/users/${user.id}`}>
                                                    View
                                                    <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                        {Math.min((page - 1) * 15 + 1, total)}–{Math.min(page * 15, total)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-800">{total}</span> users
                </p>
                <Pagination currentPage={page} totalPages={totalPages} />
            </div>
        </div>
    );
}
