
import { ProductForm } from "../product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getAllCategories } from "@/lib/actions/vendor";

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
    const awatedParams = await params;
    const session = await getSession();
    if (!session) redirect("/login");

    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.id as string } });
    if (!vendor) redirect("/vendor/onboarding");

    const product = await prisma.product.findUnique({
        where: { id: awatedParams.id },
        include: { media: true }
    });

    if (!product || product.vendorId !== vendor.id) {
        notFound();
    }

    const categories = await getAllCategories();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/vendor/products">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Product</h1>
                    <p className="text-muted-foreground">Update your product details and attachments.</p>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <ProductForm product={product as any} categories={categories} />
            </div>
        </div>
    )
}
