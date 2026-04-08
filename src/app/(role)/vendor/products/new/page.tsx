export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "../product-form";

import { getAllCategories } from "@/lib/actions/vendor";

export default async function NewProductPage() {
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
          <h1 className="text-3xl font-bold">Add New Product/Service</h1>
          <p className="text-muted-foreground">
            List a new product or service for OEMs and consultants.
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
