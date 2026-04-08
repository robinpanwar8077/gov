
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { getAdminApprovals } from "@/lib/actions/admin";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    ArrowUpRight,
    Building2,
    Briefcase,
    Wrench,
    FileCheck,
} from "lucide-react";
import { ApprovalsFilterBar } from "./approvals-filter-bar";

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    PENDING: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    APPROVED: { label: "Approved", icon: CheckCircle2, color: "bg-green-100 text-green-800 border-green-300" },
    REJECTED: { label: "Rejected", icon: XCircle, color: "bg-red-100 text-red-800 border-red-300" },
    NEEDS_MORE_INFO: { label: "Needs Info", icon: AlertCircle, color: "bg-blue-100 text-blue-800 border-blue-300" },
};

const ROLE_ICON: Record<string, any> = {
    VENDOR: Wrench,
    OEM: Building2,
    CONSULTANT: Briefcase,
};

function getProfileDetails(user: any) {
    if (user.vendorProfile) return { name: user.vendorProfile.companyName, status: user.vendorProfile.kycStatus };
    if (user.oemProfile) return { name: user.oemProfile.companyName, status: user.oemProfile.kycStatus };
    if (user.consultantProfile) return { name: user.consultantProfile.name, status: user.consultantProfile.kycStatus };
    return { name: "—", status: "PENDING" };
}

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default async function ApprovalsPage({
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
    const status = params.status || "";

    const data = await getAdminApprovals({ page, search, role, status });

    const approvals = data?.approvals || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 1;

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">KYC Approvals</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Review and approve vendor, OEM, and consultant profile documents.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 border-2 border-slate-200">
                    <FileCheck className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-bold text-slate-700">{total} Items</span>
                </div>
            </div>

            {/* Filter Bar */}
            <ApprovalsFilterBar defaultSearch={search} defaultRole={role} defaultStatus={status} />

            {/* Table */}
            <div className="rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-2 border-slate-200">
                            <TableHead className="font-bold text-slate-700">Entity / Name</TableHead>
                            <TableHead className="font-bold text-slate-700">Role</TableHead>
                            <TableHead className="font-bold text-slate-700">Email</TableHead>
                            <TableHead className="font-bold text-slate-700">Status</TableHead>
                            <TableHead className="font-bold text-slate-700">Last Updated</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {approvals.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center h-40 text-muted-foreground"
                                >
                                    No approval requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            approvals.map((user: any) => {
                                const { name, status: kycStatus } = getProfileDetails(user);
                                const config = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.PENDING;
                                const Icon = config.icon;
                                const RoleIcon = ROLE_ICON[user.role] || Clock;

                                return (
                                    <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                                                    {name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <RoleIcon className="h-4 w-4 text-slate-400" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 font-medium">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${config.color}`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                {config.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500 font-medium">
                                            {formatDate(user.updatedAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Link href={`/admin/users/${user.id}`}>
                                                    Review
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
                <p className="text-sm text-muted-foreground font-medium">
                    Showing{" "}
                    <span className="text-slate-900 font-bold">
                        {Math.min((page - 1) * 15 + 1, total)}–{Math.min(page * 15, total)}
                    </span>{" "}
                    of <span className="text-slate-900 font-bold">{total}</span> requests
                </p>
                <Pagination currentPage={page} totalPages={totalPages} />
            </div>
        </div>
    );
}
