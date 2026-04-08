"use client";

import { useActionState, useState } from "react";
import { FormState, Product, ProductMedia } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct, deleteProductMedia, deleteProduct } from "@/lib/actions/vendor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useTransition } from "react";
import { Trash2, FileIcon, Loader2, Info, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { toProxyUrl } from "@/lib/storage-utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const initialState: FormState = { error: "", success: false };

interface ProductFormProps {
    product?: Product & { media?: ProductMedia[] };
    categories?: any[]; // We'll pass categories from the page to the form
}

export function ProductForm({ product, categories = [] }: ProductFormProps) {
    const isEdit = !!product;
    const router = useRouter();
    const [isUpdating, startTransition] = useTransition();
    const [state, formAction, isPending] = useActionState(isEdit ? updateProduct : createProduct, initialState);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>((product as any)?.categoryId || "");

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    const subCategories = selectedCategory?.subCategories || [];

    useEffect(() => {
        if (state.success) {
            toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!");
            // Short delay to let the toast be seen
            setTimeout(() => {
                router.push("/vendor/products");
                router.refresh();
            }, 1000);
        }
    }, [state.success, isEdit, router]);

    const handleDeleteMedia = async (mediaId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;
        
        startTransition(async () => {
            const result = await deleteProductMedia(mediaId);
            if (result.success) {
                toast.success("File deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete file");
            }
        });
    };

    const handleDeleteProduct = async () => {
        if (!product?.id) return;
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        startTransition(async () => {
            const result = await deleteProduct(product.id);
            if (result.success) {
                toast.success("Product deleted successfully");
                router.push("/vendor/products");
            } else {
                toast.error(result.error || "Failed to delete product");
            }
        });
    }

    return (
        <form action={formAction} className="grid md:grid-cols-3 gap-8">
            {isEdit && <input type="hidden" name="productId" value={product.id} />}
            {/* Hidden inputs to pass selected values if they aren't part of form data automatically via Select? 
            Radix UI Select sets a hidden input with the name prop, so name="categoryId" works. */}

            <div className="md:col-span-2 space-y-8">
                {/* 1. Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">1. Product Details</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" name="name" defaultValue={product?.name} placeholder="e.g. Enterprise Cloud Hosting Service" required />
                            <p className="text-xs text-muted-foreground">This name will be visible to OEMs and on your catalog.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" name="description" defaultValue={product?.description || ""} placeholder="Describe key features, specifications, and benefits..." rows={6} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU / Model Number (Optional)</Label>
                                <Input id="sku" name="sku" defaultValue={product?.sku || ""} placeholder="e.g. PRO-2024-X" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priceRange">Approx. Price Range (Optional)</Label>
                                <Input id="priceRange" name="priceRange" defaultValue={(product as any)?.priceRange || ""} placeholder="e.g. ₹10k - ₹50k" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. GeM Mapping */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-semibold">2. GeM Category Mapping</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Critical for Visibility</span>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex gap-3 text-sm text-blue-800 mb-2">
                        <Info className="h-5 w-5 shrink-0" />
                        <p>
                            Select the GeM category and subcategory that best matches this product. Correct mapping ensures your product appears in relevant OEM searches.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="gemCategory">GeM Category *</Label>
                            <Select 
                                name="categoryId" 
                                value={selectedCategoryId} 
                                onValueChange={(val) => {
                                    setSelectedCategoryId(val);
                                    // Reset subcategory on category change
                                    const subSelect = document.getElementsByName("subCategoryId")[0] as HTMLSelectElement;
                                    if (subSelect) subSelect.value = "";
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories && categories.length > 0 ? (
                                        categories.map((cat: any) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No categories available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="gemSubCategory">Subcategory *</Label>
                            {/* Adding a key ensures the select resets when categories change */}
                            <Select 
                                key={selectedCategoryId} 
                                name="subCategoryId" 
                                defaultValue={(product as any)?.subCategoryId || ""} 
                                disabled={!selectedCategoryId || subCategories.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subcategory" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subCategories.length > 0 ? (
                                        subCategories.map((sub: any) => (
                                            <SelectItem key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>
                                            {selectedCategoryId ? "No subcategories found" : "Select Category First"}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 3. Documentation */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">3. Documentation</h3>
                    <div className="grid gap-2">
                        <Label htmlFor="media">Brochures / Specifications / Certificates</Label>
                        <Input id="media" name="media" type="file" multiple accept="image/*,application/pdf" className="cursor-pointer" />
                        <p className="text-xs text-muted-foreground">Upload brochures or spec sheets to help OEMs verify your product. PDF preferred.</p>
                    </div>

                    {isEdit && product.media && product.media.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h4 className="font-medium text-sm">Uploaded Files:</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {product.media.map((item) => (
                                    <div key={item.id} className="relative group border rounded-lg p-3 flex items-center gap-3 bg-white">
                                        <div className="h-10 w-10 shrink-0 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                                            {item.type === 'IMAGE' ? <FileIcon className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" title={item.fileName}>{item.fileName}</p>
                                            <a href={toProxyUrl(item.url)} target="_blank" className="text-[10px] text-blue-600 hover:underline">View File</a>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMedia(item.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete file"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t mt-4">
                    {isEdit ? (
                        <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDeleteProduct}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Product
                        </Button>
                    ) : (
                        <div></div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/vendor/products">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isPending || isUpdating} className="bg-blue-600 hover:bg-blue-700">
                            {(isPending || isUpdating) ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isEdit ? "Saving..." : "Creating..."}
                                </>
                            ) : (
                                isEdit ? "Save Product Changes" : "Create & Map Product"
                            )}
                        </Button>
                    </div>
                </div>

                {state?.success && (
                    <div className="p-3 rounded-md bg-green-50 text-green-700 border border-green-200 text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Successfully saved! Redirecting...
                    </div>
                )}

                {state?.error && (
                    <div className="p-3 rounded-md bg-red-50 text-red-600 border border-red-200 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {state.error}
                    </div>
                )}
            </div>

            {/* Sidebar Context */}
            <div className="space-y-6">
                {/* Readiness Card */}
                <Card className="p-5 bg-linear-to-br from-slate-50 to-white border-blue-200">
                    <div className="flex items-center gap-2 mb-3 text-blue-800">
                        <ShieldCheck className="h-5 w-5" />
                        <h4 className="font-bold">Readiness Check</h4>
                    </div>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-slate-600">Name & Description</span>
                        </li>
                        <li className="flex gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                            <span className="text-slate-600">GeM Category Mapping</span>
                        </li>
                        <li className="flex gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                            <span className="text-slate-600">Documentation</span>
                        </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-muted-foreground">
                            Complete these steps to unlock OEM authorization requests.
                        </p>
                    </div>
                </Card>

                {/* Help Card */}
                <Card className="p-5">
                    <h4 className="font-bold text-sm mb-2">Need Help?</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                        If you can't find your exact GeM category, select "General" or contact support for manual mapping assistance.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-xs text-blue-600">
                        <Link href="/vendor/support">Contact Mapping Support</Link>
                    </Button>
                </Card>
            </div>
        </form>
    )
}
