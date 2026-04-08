
import { CatalogForm } from "./catalog-form";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewProductPage() {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        redirect("/login");
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
                    <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
                    <p className="text-muted-foreground">Add a product to your OEM catalog for vendors to see.</p>
                </div>
            </div>

            <CatalogForm categories={categories} />
        </div>
    );
}
