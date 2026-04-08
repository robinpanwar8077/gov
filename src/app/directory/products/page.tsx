import { searchProducts } from "@/lib/actions/search";
import { getAllCategories } from "@/lib/actions/vendor";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Factory, Package, ShoppingBag, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import { ProductSearchFilters } from "@/components/product-search-filters";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = {
    title: "OEM Product Discovery | GovProNet",
    description: "Explore high-quality products from verified OEMs. Request authorization to list and supply on government portals.",
};

export default async function ProductDirectoryPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string, cat?: string, sub?: string, page?: string }>
}) {
    const params = await searchParams;
    const query = params?.q || "";
    const categoryId = params?.cat || "";
    const subCategoryId = params?.sub || "";
    const page = parseInt(params?.page || "1");

    const [searchData, categories] = await Promise.all([
        searchProducts({
            query,
            categoryId,
            subCategoryId,
            page,
            pageSize: 12
        }),
        getAllCategories()
    ]);

    const { results: products, total, totalPages } = searchData;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b-2 border-slate-900 pb-12 pt-10">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent -ml-2">
                        <Link href="/directory" className="font-black uppercase tracking-widest text-xs flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                        </Link>
                    </Button>
                    <div className="flex flex-col gap-4">
                        <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tight">OEM Product Catalog</h1>
                        <p className="text-xl text-slate-600 font-medium italic max-w-2xl">Find verified products to expand your government supply portfolio. Source directly from authorized manufacturers.</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10">
                {/* Filters */}
                <ProductSearchFilters categories={categories.map(c => ({
                    id: c.id,
                    name: c.name,
                    subCategories: c.subCategories.map(s => ({ id: s.id, name: s.name }))
                }))} />

                <div className="flex justify-between items-center mb-8">
                    <p className="font-black uppercase tracking-widest text-xs text-slate-500">
                        Showing <span className="text-slate-900">{products.length}</span> of <span className="text-slate-900">{total}</span> Verified Products
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                            <ShoppingBag className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-black text-slate-900 uppercase">No Products Found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your category filters or search keywords.</p>
                            <Button variant="link" asChild className="mt-2 text-indigo-600 font-bold">
                                <Link href="/directory/products">Clear all filters</Link>
                            </Button>
                        </div>
                    ) : (
                        products.map((p: any) => (
                            <Card key={p.id} className="group overflow-hidden border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-white rounded-3xl flex flex-col h-full">
                                <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center p-6 border-b-2 border-slate-900 group-hover:bg-slate-50 transition-colors">
                                    {p.media && p.media.length > 0 ? (
                                        <img
                                            src={p.media[0].url}
                                            alt={p.name}
                                            className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <Package className="w-16 h-16 text-slate-300" />
                                    )}
                                    <div className="absolute top-4 left-4 flex flex-col items-start gap-1">
                                        <Badge className="bg-white/90 text-slate-900 border-2 border-slate-900 shadow-sm backdrop-blur-sm font-bold text-[10px] uppercase">
                                            {p.category?.name || 'Uncategorized'}
                                        </Badge>
                                        <div className="flex items-center gap-1 bg-green-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-green-200">
                                            <ShieldCheck className="w-3 h-3 text-green-600" />
                                            <span className="text-[9px] font-black uppercase text-green-700 tracking-wide">Authorized OEM</span>
                                        </div>
                                    </div>
                                </div>

                                <CardHeader className="p-5 pb-2 space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Factory className="w-3 h-3" />
                                        <span className="truncate">{p.oem?.companyName}</span>
                                    </div>
                                    <CardTitle className="text-lg font-black text-slate-900 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-indigo-600 transition-colors">
                                        {p.name}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="px-5 pb-5 flex-1">
                                    <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                                        {p.description || 'Verified OEM product available for government procurement authorization request.'}
                                    </p>

                                    {p.oem?.kycStatus === 'APPROVED' && (
                                        <div className="mt-4 pt-3 border-t-2 border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <span>SKU: {p.sku || 'N/A'}</span>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="p-5 pt-0 mt-auto">
                                    <Button asChild className="w-full bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest h-12 rounded-2xl shadow-[4px_4px_0px_0px_rgba(79,70,229,0.2)]" variant="secondary">
                                        <Link href={`/directory/products/${p.id}`}>View Details & Request</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                <Pagination currentPage={page} totalPages={totalPages} />
            </div>
        </div>
    );
}
