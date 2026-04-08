"use client";

import { useActionState, useEffect, useState } from "react";
import { FormState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCatalogProduct, updateCatalogProduct } from "@/lib/actions/oem";
import { PlusCircle, Upload, FileText, Image as ImageIcon, Save, Loader2, Info, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Category {
    id: string;
    name: string;
    subCategories: { id: string; name: string }[];
}

const initialState: FormState = { error: "", success: false };

export function CatalogForm({ categories, product }: { categories: Category[], product?: any }) {
    const action = product ? updateCatalogProduct : createCatalogProduct;
    const [state, formAction, isPending] = useActionState(action, initialState);
    const [selectedCategory, setSelectedCategory] = useState<string>(product?.categoryId || "");
    const router = useRouter();

    // Derived subcategories based on selection
    const subCategories = categories.find(c => c.id === selectedCategory)?.subCategories || [];

    const [fileNames, setFileNames] = useState({ image: "", datasheet: "" });

    useEffect(() => {
        if (state.success) {
            toast.success(product ? "Catalog product updated!" : "Catalog product created!");
            setTimeout(() => {
                router.push("/oem/catalog");
                router.refresh();
            }, 1000);
        }
    }, [state.success, product, router]);

    return (
        <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {product && <input type="hidden" name="productId" value={product.id} />}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
                    <h3 className="font-semibold text-lg border-b pb-2">Product Details</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="font-semibold">Product Name *</Label>
                            <Input id="name" name="name" defaultValue={product?.name} placeholder="e.g. Rack Server 2U" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="categoryId" className="font-semibold">Category *</Label>
                                <Select name="categoryId" onValueChange={setSelectedCategory} defaultValue={product?.categoryId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subCategoryId" className="font-semibold">Sub Category</Label>
                                <Select 
                                    key={selectedCategory}
                                    name="subCategoryId" 
                                    defaultValue={product?.subCategoryId} 
                                    disabled={!selectedCategory || subCategories.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Sub Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subCategories.length > 0 ? (
                                            subCategories.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>
                                                {selectedCategory ? "No subcategories found" : "Select Category First"}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="font-semibold">Short Description</Label>
                            <Textarea id="description" name="description" defaultValue={product?.description} placeholder="Brief overview of the product..." className="h-20" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
                    <h3 className="font-semibold text-lg border-b pb-2">Technical Specifications</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="specifications" className="font-semibold">Key Specs (JSON/Text)</Label>
                            <Textarea id="specifications" name="specifications" defaultValue={product?.specifications} placeholder="- Processor: ... &#10;- RAM: ..." className="h-48 font-mono text-xs" />
                            <p className="text-[10px] text-muted-foreground">Enter key technical details.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="features" className="font-semibold">Features</Label>
                            <Textarea id="features" name="features" defaultValue={product?.features} placeholder="Feature 1, Feature 2..." className="h-32" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:col-span-1 space-y-6">
                <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
                    <h3 className="font-semibold text-lg border-b pb-2">Identity & Sales</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sku" className="font-semibold">SKU / Model Number *</Label>
                            <Input id="sku" name="sku" defaultValue={product?.sku} placeholder="PROD-123-ABC" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priceRange" className="font-semibold">Price Range (Optional)</Label>
                            <Input id="priceRange" name="priceRange" defaultValue={product?.priceRange} placeholder="e.g. ₹50,000 - ₹1,00,000" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="warrantyInfo" className="font-semibold">Warranty Info</Label>
                            <Input id="warrantyInfo" name="warrantyInfo" defaultValue={product?.warrantyInfo} placeholder="e.g. 3 Years On-site" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
                    <h3 className="font-semibold text-lg border-b pb-2">Media & Docs</h3>

                    <div className="grid gap-2">
                        <Label htmlFor="image" className="font-semibold">Product Image</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition cursor-pointer relative">
                            <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">
                                {fileNames.image || "Click to upload image"}
                            </span>
                            <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                                onChange={(e) => setFileNames({ ...fileNames, image: e.target.files?.[0]?.name || "" })}
                            />
                        </div>
                        {product?.media?.find((m: any) => m.type === 'IMAGE') && (
                            <div>
                                <Image src={product.media.find((m: any) => m.type === 'IMAGE')?.url} alt={product.name} width={200} height={200} unoptimized />
                                <p className="text-[10px] text-green-600 font-medium italic">Already has image. Upload to replace.</p>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="datasheet" className="font-semibold">Technical Datasheet (PDF)</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition cursor-pointer relative">
                            <FileText className="w-6 h-6 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">
                                {fileNames.datasheet || "Click to upload PDF"}
                            </span>
                            <input
                                id="datasheet"
                                name="datasheet"
                                type="file"
                                accept=".pdf"
                                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                                onChange={(e) => setFileNames({ ...fileNames, datasheet: e.target.files?.[0]?.name || "" })}
                            />
                        </div>
                        {product?.media?.find((m: any) => m.type === 'DOCUMENT') && (
                            <div>
                                <p className="text-[10px] text-green-600 font-medium italic">Already has datasheet. Upload to replace.</p>
                                <Link href={product.media.find((m: any) => m.type === 'DOCUMENT')?.url} target="_blank">View Document</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {state?.error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {product ? "Changes saved!" : "Product added to catalog!"}
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        {isPending ? (
                            <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> SAVING...</>
                        ) : (
                            <><Save className="w-5 h-5 mr-2" /> {product ? "UPDATE CATALOG" : "PUBLISH TO CATALOG"}</>
                        )}
                    </Button>
                    <Button variant="outline" asChild className="h-12 font-medium">
                        <Link href="/oem/catalog">Cancel</Link>
                    </Button>
                </div>
            </div>
        </form>
    )
}
