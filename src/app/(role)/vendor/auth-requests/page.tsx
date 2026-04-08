
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
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function AuthRequestsPage() {
    const session = await getSession();
    const userId = session?.id as string;

    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });

    const requests = vendor ? await prisma.authorizationRequest.findMany({
        where: { vendorId: vendor.id },
        include: { product: true, oem: true },
        orderBy: { createdAt: 'desc' }
    }) : [];

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Authorization Requests</h1>
                    <p className="text-muted-foreground">Track your requests to sell OEM products.</p>
                </div>
                <Button asChild>
                    <Link href="/vendor/auth-requests/new" className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Request
                    </Link>
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>OEM</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Requested Date</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No requests found.</TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req: any) => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.oem.companyName}</TableCell>
                                    <TableCell>{req.product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'} className="whitespace-nowrap uppercase text-[9px] font-black tracking-widest px-2 h-5">
                                            {req.status === 'PENDING' ? 'Pending OEM Review' : req.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={req.oemComment}>
                                        {req.oemComment || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] font-black uppercase">
                                            <Link href={`/vendor/auth-requests/${req.id}`}>View Details</Link>
                                        </Button>
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
