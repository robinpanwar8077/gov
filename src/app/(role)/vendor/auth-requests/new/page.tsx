
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import prisma from "@/lib/db";
import { RequestForm } from "./request-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@/lib/types";
import { getProductById } from "@/lib/actions/search";
import { Badge } from "@/components/ui/badge";
import { Building2, Package } from "lucide-react";

export default async function NewAuthRequestPage({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
    const session = await getSession();
    if (!session || session.role !== Role.VENDOR) {
        redirect("/login");
    }

    const { productId } = await searchParams;
    const vendor = await prisma.vendorProfile.findUnique({
        where: { userId: session.id as string }
    });

    if (!vendor) {
        redirect("/vendor/profile");
    }

    const preSelectedProduct = productId ? await getProductById(productId) : null;

    // Only show products from OEMs that are APPROVED and products that are NOT archived.
    const oemProducts = await prisma.product.findMany({
        where: {
            NOT: { oemId: null },
            isArchived: false,
            oem: {
                kycStatus: 'APPROVED'
            }
        },
        include: { oem: true },
        take: 100 // Increased limit
    });

    // Ensure preselected product is in the list
    const finalProducts = [...oemProducts];
    if (preSelectedProduct && !finalProducts.find(p => p.id === preSelectedProduct.id)) {
        finalProducts.unshift(preSelectedProduct as any);
    }

    return (
        <div className="grid gap-8 min-w-6xl mx-auto w-full pb-20">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/vendor/auth-requests"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h1 className="text-3xl font-black tracking-tight">Request Authorization</h1>
                </div>
                <p className="text-muted-foreground ml-12">
                    Initiate a formal partnership request with an Original Equipment Manufacturer.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border shadow-sm">
                        <RequestForm products={finalProducts} defaultProductId={productId} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-4">
                        <h3 className="font-bold flex items-center gap-2 text-primary">
                            <Building2 className="w-4 h-4" /> Requesting As
                        </h3>
                        <div>
                            <p className="text-sm font-bold">{vendor.companyName}</p>
                            <p className="text-xs text-muted-foreground">GST: {vendor.gst}</p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                            Verified Vendor
                        </Badge>
                    </div>

                    {preSelectedProduct && (
                        <div className="bg-muted/30 border p-6 rounded-2xl space-y-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Package className="w-4 h-4" /> Targeted Product
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm font-bold line-clamp-2">{preSelectedProduct.name}</p>
                                <p className="text-xs text-muted-foreground">OEM: {preSelectedProduct.oem?.companyName}</p>
                            </div>
                            <div className="pt-2">
                                <Link href={`/directory/products/${preSelectedProduct.id}`} className="text-[10px] font-bold text-primary hover:underline">
                                    View Full Specifications →
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-3">
                        <h3 className="font-bold text-amber-900 text-sm">💡 Pro Tip</h3>
                        <p className="text-xs text-amber-800 leading-relaxed">
                            OEMs are more likely to approve requests that include a clear <b>proposal</b> or project context in the notes section.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
