import { getVendorBySlug } from "@/lib/actions/search";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { StartChatButton } from "@/components/messaging/start-chat-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const awaitedParam = await params;
    const vendor = await getVendorBySlug(awaitedParam.slug);

    if (!vendor) {
        return { title: "Vendor Not Found" };
    }

    return {
        title: `${vendor.companyName} - Verified Vendor | GovProNet`,
        description: `Connect with ${vendor.companyName}, a verified supplier on GovProNet. View authorizations, products, and contact details.`,
    };
}

export default async function PublicVendorProfile({ params }: { params: Promise<{ slug: string }> }) {
    const awaitedParam = await params;
    const vendor = await getVendorBySlug(awaitedParam.slug);
    const session = await getSession();

    if (!vendor) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Button variant="ghost" asChild className="mb-6 pl-0">
                <Link href="/directory/vendors"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Link>
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Profile Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold">{vendor.companyName}</h1>
                            {vendor.kycStatus === 'APPROVED' && (
                                <Badge className="bg-green-600 hover:bg-green-700 flex gap-1 items-center">
                                    <CheckCircle className="h-3 w-3" /> Verified
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground mt-2">Member since {new Date().getFullYear()}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {vendor.categories && vendor.categories.map((cat: any) => (
                                <Badge key={cat.id} variant="secondary" className="px-3 py-1 text-xs">
                                    {cat.name}
                                </Badge>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">About Us</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {vendor.companyName} is a verified vendor on GovProNet. We specialize in delivering high-quality services and products for government contracts.
                            </p>
                            {vendor.registeredAddress && (
                                <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">Registered Address:</span>
                                    <span>{vendor.registeredAddress}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Manufacturer Authorizations</h3>
                        {vendor.authRequests.length === 0 ? (
                            <p className="text-muted-foreground">No manufacturer authorizations listed.</p>
                        ) : (
                            <div className="grid gap-4">
                                {vendor.authRequests.map((req: any) => (
                                    <div key={req.id} className="border p-4 rounded-xl bg-primary/5 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-primary">{req.product.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Authorized by <span className="font-semibold">{req.oem.companyName}</span></p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 uppercase text-[10px] font-black border-green-200">
                                            Official Vendor
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Other Products & Services</h3>
                        {vendor.products.length === 0 ? (
                            <p className="text-muted-foreground">No other products listed.</p>
                        ) : (
                            <div className="grid gap-4">
                                {vendor.products.map((p: any) => (
                                    <div key={p.id} className="border p-4 rounded-md">
                                        <h4 className="font-semibold">{p.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{p.description}</p>
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
                                <p className="text-muted-foreground">{vendor.user.email}</p>
                            </div>
                            <div>
                                <p className="font-medium">Mobile</p>
                                <p className="text-muted-foreground">{vendor.user.mobile || 'Not available'}</p>
                            </div>
                            <div>
                                <p className="font-medium">GST Number</p>
                                <p className="text-muted-foreground">{vendor.gst || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t font-black uppercase tracking-widest">
                            {!session ? (
                                <Button className="w-full" asChild>
                                    <Link href="/login">Login to Connect</Link>
                                </Button>
                            ) : (
                                <StartChatButton
                                    otherUserId={vendor.userId}
                                    targetName={vendor.companyName}
                                    variant="default"
                                    className="w-full"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
