import { searchVendors } from "@/lib/actions/search";
import { getAllCategories } from "@/lib/actions/vendor";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, CheckCircle, ShieldCheck } from "lucide-react";
import { VendorSearchFilters } from "@/components/vendor-search-filters";
import { Pagination } from "@/components/pagination";

export default async function VendorsDirectory({
    searchParams
}: {
    searchParams: Promise<{ q?: string, cat?: string, loc?: string, page?: string }>
}) {
    const params = await searchParams;
    const query = params?.q || "";
    const categoryId = params?.cat || "";
    const location = params?.loc || "";
    const page = parseInt(params?.page || "1");

    const [searchData, categories] = await Promise.all([
        searchVendors({
            query,
            categoryId,
            location,
            page,
            pageSize: 9
        }),
        getAllCategories()
    ]);

    const { results: vendors, total, totalPages } = searchData;

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
                        <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tight">Vendor Ecosystem</h1>
                        <p className="text-xl text-slate-600 font-medium italic max-w-2xl">Connect with verified government contractors and service providers to scale your bidding capabilities.</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10">
                <VendorSearchFilters categories={categories.map(c => ({ id: c.id, name: c.name }))} />

                <div className="flex justify-between items-center mb-8">
                    <p className="font-black uppercase tracking-widest text-xs text-slate-500">
                        Showing <span className="text-slate-900">{vendors.length}</span> of <span className="text-slate-900">{total}</span> Verified Vendors
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {vendors.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                            <Building2 className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-black text-slate-900 uppercase">No Vendors Found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
                        </div>
                    ) : (
                        vendors.map((v: any) => (
                            <Card key={v.id} className="group overflow-hidden border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-white rounded-3xl">
                                <CardHeader className="p-6 pb-4 border-b-2 border-slate-900 bg-indigo-50/50">
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-slate-900 text-white border-none font-black uppercase tracking-tighter text-[10px]">Vendor</Badge>
                                        <div className="flex items-center gap-1 text-green-600">
                                            <ShieldCheck className="w-4 h-4 fill-green-100" />
                                            <span className="font-black uppercase text-[10px] tracking-widest">Verified</span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-black text-slate-900 mt-4 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {v.companyName}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                            <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                                            <span className="line-clamp-2 italic">{v.registeredAddress || 'Location not specified'}</span>
                                        </div>

                                        <div className="pt-4 border-t-2 border-slate-50 space-y-3">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Core Capabilities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {v.categories?.length > 0 ? (
                                                    v.categories.slice(0, 3).map((cat: any) => (
                                                        <Badge key={cat.id} variant="outline" className="border-slate-200 text-slate-600 font-bold uppercase text-[9px] px-2 py-0 border-2">
                                                            {cat.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic font-medium">General Contractor</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {v._count?.authRequests > 0 && (
                                        <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border-2 border-emerald-100 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
                                                {v._count.authRequests} OEM Authorizations
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="p-6 pt-0">
                                    <Button className="w-full bg-slate-900 hover:bg-slate-800 font-black uppercase tracking-widest h-12 rounded-2xl shadow-[4px_4px_0px_0px_rgba(79,70,229,0.2)]" asChild>
                                        <Link href={`/directory/vendors/${v.slug || v.id}`}>View Partner Full Profile</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                <Pagination currentPage={page} totalPages={totalPages} />
            </div>
        </div>
    )
}
