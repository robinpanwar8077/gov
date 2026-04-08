import { getProductById } from "@/lib/actions/search";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Factory, ShieldCheck, Info } from "lucide-react";
import { Role } from "@/lib/types";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const awaitedParam = await params;
    const product = await getProductById(awaitedParam.id);

    if (!product) {
        return { title: "Product Not Found" };
    }

    return {
        title: `${product.name} - OEM Product | GovProNet`,
        description: product.description ? product.description.substring(0, 160) : `View details for ${product.name} by ${product.oem?.companyName}.`,
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const awaitedParam = await params;
    const product = await getProductById(awaitedParam.id);
    const session = await getSession();

    if (!product) {
        notFound();
    }

    const isVendor = session?.role === Role.VENDOR;
    const oemSlug = product.oem?.slug || product.oemId;

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <Button variant="ghost" asChild className="mb-6 pl-0">
                <Link href={`/directory/oems/${oemSlug}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to OEM Profile</Link>
            </Button>

            <div className="grid gap-10 md:grid-cols-2">
                {/* Visuals / Media */}
                <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-xl flex items-center justify-center border overflow-hidden">
                        {product.media && product.media.length > 0 ? (
                            <img
                                src={product.media[0].url}
                                alt={product.name}
                                className="object-contain w-full h-full p-4"
                            />
                        ) : (
                            <Factory className="w-20 h-20 text-muted-foreground/30" />
                        )}
                    </div>
                    {product.media && product.media.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.media.slice(1).map((m: any) => (
                                <div key={m.id} className="aspect-square bg-muted rounded-lg border overflow-hidden">
                                    <img src={m.url} alt={m.fileName} className="object-contain w-full h-full p-1" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{product.category?.name || 'General Product'}</Badge>
                            {product.subCategory && <Badge variant="secondary">{product.subCategory.name}</Badge>}
                        </div>
                        <h1 className="text-4xl font-bold">{product.name}</h1>
                        <p className="text-xl text-muted-foreground mt-2">SKU: {product.sku || 'N/A'}</p>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md border shadow-sm">
                                <Factory className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Offered By (OEM)</p>
                                <Link href={`/directory/oems/${oemSlug}`} className="font-bold hover:underline">
                                    {product.oem?.companyName}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {product.description || 'No description provided for this product.'}
                        </p>
                    </div>

                    {product.specifications && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">Technical Specifications</h3>
                            <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                                {product.specifications}
                            </div>
                        </div>
                    )}

                    {/* Vendor Action */}
                    <div className="pt-6 border-t mt-10">
                        {isVendor ? (
                            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 space-y-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold">OEM Authorization Required</h4>
                                        <p className="text-sm text-muted-foreground">
                                            As a registered vendor, you can request direct authorization from {product.oem?.companyName} to list and supply this product on government portals.
                                        </p>
                                    </div>
                                </div>
                                <Button size="lg" className="w-full shadow-lg shadow-primary/20" asChild>
                                    <Link href={`/vendor/auth-requests/new?productId=${product.id}`}>
                                        Request Formal Authorization
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex items-start gap-4">
                                <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-amber-900">Ordering / Authorization</h4>
                                    <p className="text-sm text-amber-800">
                                        Only verified vendors can request OEM authorization. If you are a vendor, please log in to initiate the authorization workflow.
                                    </p>
                                    {!session && (
                                        <Button size="sm" variant="outline" className="mt-4 border-amber-200 text-amber-900 hover:bg-amber-100" asChild>
                                            <Link href="/login">Login as Vendor</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
