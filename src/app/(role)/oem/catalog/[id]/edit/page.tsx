
import { CatalogForm } from "../../new/catalog-form";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const awaitedParams = await params;
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        redirect("/login");
    }

    const { id } = awaitedParams;

    const product = await prisma.product.findUnique({
        where: { id },
        include: { media: true }
    });

    if (!product) {
        notFound();
    }

    // Verify ownership
    const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });
    if (!oem || product.oemId !== oem.id) {
        redirect("/oem/catalog");
    }

    // Fetch categories for the dropdown
    const categories = await prisma.category.findMany({
        include: { subCategories: true }
    });

    return (
        <div className="min-w-7xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/oem/catalog">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Catalog
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-muted-foreground">Update details for {product.name}</p>
                </div>
            </div>

            <CatalogForm categories={categories} product={product} />
        </div>
    );
}
