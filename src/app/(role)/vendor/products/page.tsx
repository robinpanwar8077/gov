
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
import Link from "next/link";
import { PlusCircle, ShieldCheck, AlertCircle, Eye, EyeOff, FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ProductsPage() {
    const session = await getSession();
    const userId = session?.id as string;

    // Find vendor profile
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });

    // Get products
    const products = vendor ? await prisma.product.findMany({
        where: { vendorId: vendor.id },
        include: {
            media: true,
            // category: true, // Assuming category relation exists or we infer from somewhere
        },
        orderBy: { createdAt: 'desc' }
    }) : [];

    // Get auth requests to map status - Fetching AuthorizationRequest is needed
    // Assuming the table name is AuthorizationRequest or similar based on previous context
    // If we look at dashboard page we saw `vendor.authRequests`.
    // Let's use `vendor.authRequests` query if we fetch vendor with include.

    const vendorWithAuth = await prisma.vendorProfile.findUnique({
        where: { userId },
        include: { authRequests: true }
    });
    const authRequests = vendorWithAuth?.authRequests || [];

    return (
        <div className="grid gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">GeM Product Mapping</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage products, map them to GeM categories, and request OEM authorization.
                    </p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md">
                    <Link href="/vendor/products/new" className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add New Product
                    </Link>
                </Button>
            </div>

            {/* Guidance Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-blue-900">Why Map Products?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                        Products with complete GeM mapping and approved OEM authorization receive <span className="font-bold">3x higher visibility</span> to buyers and OEMs.
                    </p>
                </div>
            </div>

            <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[300px]">Product Details</TableHead>
                            <TableHead>GeM / Business Status</TableHead>
                            <TableHead>OEM Authorization</TableHead>
                            <TableHead>Documentation</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <AlertCircle className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <h3 className="font-semibold text-lg text-slate-900">No Products Listed</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm">
                                            Start by adding your first product to map it to GeM categories and unlock OEM authorization.
                                        </p>
                                        <Button asChild variant="outline" className="mt-2">
                                            <Link href="/vendor/products/new">Add First Product</Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: any) => {
                                // Logic for status
                                const productAuthRequests = authRequests.filter((r: any) => r.productId === product.id);
                                const hasRecentAuth = productAuthRequests.length > 0;
                                const isAuthApproved = productAuthRequests.some((r: any) => r.status === 'APPROVED');
                                const isAuthPending = productAuthRequests.some((r: any) => r.status === 'PENDING');

                                return (<TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-900">{product.name}</span>
                                            <span className="text-xs text-muted-foreground max-w-xs truncate line-clamp-1">{product.description}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-none">
                                                    Created: {new Date(product.createdAt).toLocaleDateString()}
                                                </Badge>
                                                {/* Mock Category or display real if available */}
                                                <Badge variant="secondary" className="text-[10px]">
                                                    General Category
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            {/* Business Signals */}
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className={`h-2 w-2 rounded-full ${vendor?.kycStatus === 'APPROVED' ? 'bg-green-500' : 'bg-amber-400'}`} />
                                                <span className="font-medium text-slate-700">KYC Verified Vendor</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className={`h-2 w-2 rounded-full ${hasRecentAuth ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                <span className="text-slate-600">GeM Mapping {hasRecentAuth ? 'Active' : 'Pending'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {isAuthApproved ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
                                                    Authorized
                                                </Badge>
                                            ) : isAuthPending ? (
                                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200">
                                                    Verification Pending
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50">
                                                    Not Requested
                                                </Badge>
                                            )}

                                            {!isAuthApproved && !isAuthPending && (
                                                <div>
                                                    <Button size="sm" variant="link" className="h-auto p-0 text-blue-600 font-semibold text-xs" asChild>
                                                        <Link href={`/vendor/auth-requests/new?productId=${product.id}`}>
                                                            Request Authorization
                                                        </Link>
                                                    </Button>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">Allow OEMs to review.</p>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm space-y-1">
                                            {product.media?.length > 0 ? (
                                                <>
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                                                        <span className="text-xs font-medium">{product.media.length} Document(s)</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground pl-5">Brochure / Spec Sheet</p>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-amber-600">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-medium">Docs Missing</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium hover:bg-slate-100 hover:text-slate-900" asChild>
                                                <Link href={`/vendor/products/${product.id}`}>Edit Details</Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
