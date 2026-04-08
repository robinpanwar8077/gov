
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
import { ActionButtons } from "./action-buttons";
import { SearchBar } from "@/components/search-bar";
import {
    Filter,
    Search,
    ArrowRight,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Package,
    Calendar,
    MessageSquare
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusFilter } from "./StatusFilter";

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ q?: string, status?: string }> }) {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        redirect("/login");
    }

    const params = await searchParams;
    const query = params.q || "";
    const statusFilter = params.status || "";

    const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });
    if (!oem) redirect("/oem/profile");

    const where: any = { oemId: oem.id };

    if (statusFilter && statusFilter !== "ALL") {
        where.status = statusFilter;
    }

    if (query) {
        where.OR = [
            { vendor: { companyName: { contains: query, mode: 'insensitive' } } },
            { product: { name: { contains: query, mode: 'insensitive' } } },
            { notes: { contains: query, mode: 'insensitive' } }
        ];
    }

    const requests = await prisma.authorizationRequest.findMany({
        where,
        include: { product: true, vendor: true },
        orderBy: { createdAt: 'desc' }
    });

    const stats = {
        total: await prisma.authorizationRequest.count({ where: { oemId: oem.id } }),
        pending: await prisma.authorizationRequest.count({ where: { oemId: oem.id, status: 'PENDING' } }),
        approved: await prisma.authorizationRequest.count({ where: { oemId: oem.id, status: 'APPROVED' } }),
    };

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Package className="w-10 h-10 text-primary" />
                        Authorization Requests
                    </h1>
                    <p className="text-muted-foreground font-medium">Review and manage partnership requests from registered vendors.</p>
                </div>

                <div className="flex bg-muted/30 p-1.5 rounded-xl border border-dashed gap-4">
                    <div className="px-4 py-1 text-center border-r last:border-0">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Total</p>
                        <p className="text-lg font-black">{stats.total}</p>
                    </div>
                    <div className="px-4 py-1 text-center border-r last:border-0">
                        <p className="text-[10px] font-black uppercase text-amber-600">Pending</p>
                        <p className="text-lg font-black text-amber-600">{stats.pending}</p>
                    </div>
                    <div className="px-4 py-1 text-center last:border-0 border-r">
                        <p className="text-[10px] font-black uppercase text-green-600">Approved</p>
                        <p className="text-lg font-black text-green-600">{stats.approved}</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <SearchBar placeholder="Search by vendor, product, or keywords..." />
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    <StatusFilter />
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-5 pl-8 font-black uppercase tracking-widest text-[10px]">Vendor & Status</TableHead>
                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Requested Product</TableHead>
                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Proposal (Snippet)</TableHead>
                            <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Submitted Date</TableHead>
                            <TableHead className="py-5 pr-8 text-right font-black uppercase tracking-widest text-[10px]">Admin Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                            <AlertCircle className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-muted-foreground">No requests found</p>
                                            <p className="text-sm text-muted-foreground">Adjust your filters or search terms.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req: any) => (
                                <TableRow key={req.id} className="group hover:bg-primary/5 transition-colors">
                                    <TableCell className="py-6 pl-8">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="font-bold text-sm tracking-tight">{req.vendor?.companyName}</span>
                                            </div>
                                            <Badge variant="outline" className={`w-fit text-[9px] font-black uppercase tracking-widest h-5 px-2 ${req.status === AuthStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' :
                                                req.status === AuthStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                {req.status === 'PENDING' ? <><Clock className="w-2.5 h-2.5 mr-1" /> Pending OEM Review</> : req.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-3.5 h-3.5 text-primary/60" />
                                                <span className="font-bold text-sm text-primary group-hover:underline cursor-pointer">
                                                    <Link href={`/oem/requests/${req.id}`}>{req.product.name}</Link>
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">SKU: {req.product.sku || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        {req.notes ? (
                                            <div className="flex items-start gap-2 max-w-[250px]">
                                                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                                <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                                                    "{req.notes}"
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/50">- No notes -</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-xs font-semibold">{new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 pr-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Button variant="ghost" size="sm" asChild className="text-[10px] font-black uppercase tracking-tighter hover:bg-primary/5 hover:text-primary">
                                                <Link href={`/oem/requests/${req.id}`}>
                                                    View Case <ArrowRight className="w-3 h-3 ml-1.5" />
                                                </Link>
                                            </Button>
                                            {req.status === AuthStatus.PENDING && (
                                                <div className="border-l pl-3">
                                                    <ActionButtons requestId={req.id} />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
