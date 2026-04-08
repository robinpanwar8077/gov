
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { AuthStatus, Role } from "@/lib/types";
import {
    ShieldAlert,
    ArrowRight,
    Lock,
    Building2,
    Building,
    Package
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthorizationsFilterBar } from "./authorizations-filter-bar";
import { Pagination } from "@/components/pagination";

export default async function AdminAuthorizationsPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string, status?: string, page?: string }>
}) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
        redirect("/login");
    }

    const params = await searchParams;
    const query = params.q || "";
    const statusFilter = params.status || "";
    const page = parseInt(params.page || "1");
    const pageSize = 15;

    const where: any = {};

    if (statusFilter && statusFilter !== "ALL") {
        where.status = statusFilter;
    }

    if (query) {
        where.OR = [
            { vendor: { companyName: { contains: query, mode: 'insensitive' } } },
            { oem: { companyName: { contains: query, mode: 'insensitive' } } },
            { product: { name: { contains: query, mode: 'insensitive' } } }
        ];
    }

    const [requests, totalCount] = await Promise.all([
        prisma.authorizationRequest.findMany({
            where,
            include: {
                product: true,
                vendor: true,
                oem: true
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.authorizationRequest.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <ShieldAlert className="w-10 h-10 text-destructive" />
                        Global Authorization Oversight
                    </h1>
                    <p className="text-muted-foreground font-medium">Monitor and override OEM-Vendor authorization decisions across the platform.</p>
                </div>
            </div>

            <AuthorizationsFilterBar defaultSearch={query} defaultStatus={statusFilter} />

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-5 pl-8 font-black uppercase text-[10px]">Vendor & OEM</TableHead>
                            <TableHead className="py-5 font-black uppercase text-[10px]">Product</TableHead>
                            <TableHead className="py-5 font-black uppercase text-[10px]">Status</TableHead>
                            <TableHead className="py-5 font-black uppercase text-[10px]">Date</TableHead>
                            <TableHead className="py-5 pr-8 text-right font-black uppercase text-[10px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center text-muted-foreground font-medium">
                                    No authorization requests found matching filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req: any) => (
                                <TableRow key={req.id} className="group hover:bg-muted/30">
                                    <TableCell className="py-6 pl-8">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <Building className="w-3.5 h-3.5 text-blue-600" />
                                                <span className="font-bold text-sm">{req.vendor.companyName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">{req.oem.companyName}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-3.5 h-3.5 text-primary/60" />
                                            <span className="font-semibold text-sm">{req.product.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <Badge variant="outline" className={`w-fit text-[9px] font-black uppercase h-5 px-2 ${req.status === AuthStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' :
                                                    req.status === AuthStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                {req.status}
                                            </Badge>
                                            {req.isLocked && (
                                                <span className="flex items-center gap-1 text-[9px] font-black text-destructive uppercase">
                                                    <Lock className="w-2.5 h-2.5" /> Locked
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <span className="text-xs font-medium text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</span>
                                    </TableCell>
                                    <TableCell className="py-6 pr-8 text-right">
                                        <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] font-black uppercase hover:bg-primary/5">
                                            <Link href={`/admin/authorizations/${req.id}`}>
                                                Investigate <ArrowRight className="w-3 h-3 ml-1.5" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <p className="text-xs font-black uppercase tracking-tight text-muted-foreground">
                    Showing <span className="text-slate-900">{Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)}</span> of <span className="text-slate-900">{totalCount}</span> Authorization Requests
                </p>
                <Pagination currentPage={page} totalPages={totalPages} />
            </div>
        </div>
    )
}
