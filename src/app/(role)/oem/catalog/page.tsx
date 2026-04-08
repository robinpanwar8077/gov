
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
import { PlusCircle, Edit, Archive, ArchiveRestore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { archiveProduct, unarchiveProduct } from "@/lib/actions/oem";

import { ProductArchiveToggle } from "./product-actions";

export default async function CatalogPage() {
    const session = await getSession();
    const userId = session?.id as string;

    const oem = await prisma.oEMProfile.findUnique({ where: { userId } });

    const products = oem ? await prisma.product.findMany({
        where: { oemId: oem.id },
        orderBy: { createdAt: 'desc' }
    }) : [];

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Product Catalog</h1>
                    <p className="text-muted-foreground">Manage your master product catalog.</p>
                </div>
                <Button asChild>
                    <Link href="/oem/catalog/new" className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 italic text-muted-foreground">No products in catalog.</TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: any) => (
                                <TableRow key={product.id} className={product.isArchived ? "opacity-60 bg-muted/20 text-muted-foreground" : ""}>
                                    <TableCell>
                                        {product.isArchived ? (
                                            <Badge variant="secondary" className="font-bold">ARCHIVED</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 font-bold">ACTIVE</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{product.sku || '-'}</TableCell>
                                    <TableCell className="font-semibold">{product.name}</TableCell>
                                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">{product.description}</TableCell>
                                    <TableCell className="text-xs">{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild title="Edit Product">
                                                <Link href={`/oem/catalog/${product.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>

                                            <ProductArchiveToggle productId={product.id} isArchived={product.isArchived} />
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
