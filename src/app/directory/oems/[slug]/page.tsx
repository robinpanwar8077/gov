import { getOEMBySlug } from "@/lib/actions/search";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { StartChatButton } from "@/components/messaging/start-chat-button";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const awaitedParam = await params;
    const oem = await getOEMBySlug(awaitedParam.slug);

    if (!oem) {
        return { title: "OEM Not Found" };
    }

    return {
        title: `${oem.companyName} - OEM Profile | GovProNet`,
        description: `View products and catalog from ${oem.companyName}, a verified Original Equipment Manufacturer on GovProNet.`,
    };
}

export default async function PublicOEMProfile({ params }: { params: Promise<{ slug: string }> }) {
    const awaitedParam = await params;
    const oem = await getOEMBySlug(awaitedParam.slug);
    const session = await getSession();

    if (!oem) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Button variant="ghost" asChild className="mb-6 pl-0">
                <Link href="/directory/oems"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Link>
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Profile Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold">{oem.companyName}</h1>
                            {oem.kycStatus === 'APPROVED' && (
                                <Badge className="bg-green-600 hover:bg-green-700 flex gap-1 items-center">
                                    <CheckCircle className="h-3 w-3" /> Verified Original Equipment Manufacturer
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground mt-2">Member since {new Date().getFullYear()}</p>
                        {oem.registeredAddress && (
                            <div className="mt-4 text-sm text-muted-foreground border-t pt-4">
                                <span className="font-semibold text-foreground block mb-1">Headquarters:</span>
                                {oem.registeredAddress}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Product Catalog</h3>
                        {oem.catalog.length === 0 ? (
                            <p className="text-muted-foreground">No products listed publicly.</p>
                        ) : (
                            <div className="grid gap-4">
                                {oem.catalog.map((p: any) => (
                                    <div key={p.id} className="border p-4 rounded-md flex justify-between items-center group hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <Link href={`/directory/products/${p.id}`} className="hover:underline">
                                                <h4 className="font-semibold">{p.name}</h4>
                                            </Link>
                                            <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-sm text-muted-foreground">
                                                SKU: {p.sku || 'N/A'}
                                            </div>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/directory/products/${p.id}`}>View Details</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="font-semibold mb-4">Contact Information</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium">Email</p>
                                <p className="text-muted-foreground">{oem.user.email}</p>
                            </div>
                            <div>
                                <p className="font-medium">Mobile</p>
                                <p className="text-muted-foreground">{oem.user.mobile || 'Not available'}</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t space-y-3 font-black uppercase tracking-widest">
                            {!session ? (
                                <Button className="w-full" asChild>
                                    <Link href="/login">Login to Connect</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button className="w-full bg-slate-900" asChild>
                                        <Link href="/vendor/auth-requests">Become a Partner</Link>
                                    </Button>
                                    <StartChatButton
                                        otherUserId={oem.userId}
                                        targetName={oem.companyName}
                                        className="w-full border-2"
                                        variant="outline"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
