
import { getConsultantBySlug } from "@/lib/actions/search";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { StartChatButton } from "@/components/messaging/start-chat-button";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const awaitedParam = await params;
    const consultant = await getConsultantBySlug(awaitedParam.slug);

    if (!consultant) {
        return { title: "Consultant Not Found" };
    }

    return {
        title: `${consultant.name} - Consultant Profile | GovProNet`,
        description: consultant.bio ? consultant.bio.substring(0, 160) : `View ${consultant.name}'s profile and services on GovProNet.`,
    };
}

export default async function PublicConsultantProfile({ params }: { params: Promise<{ slug: string }> }) {
    const session = await getSession();
    const awaitedParam = await params;
    const consultant = await getConsultantBySlug(awaitedParam.slug);

    if (!consultant) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Button variant="ghost" asChild className="mb-6 pl-0">
                <Link href="/directory/consultants"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Link>
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Profile Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold">{consultant.name}</h1>
                            {consultant.kycStatus === 'APPROVED' && (
                                <Badge className="bg-green-600 hover:bg-green-700 flex gap-1 items-center">
                                    <CheckCircle className="h-3 w-3" /> Verified Consultant
                                </Badge>
                            )}
                        </div>
                        <div className="mt-2 space-y-1">
                            {consultant.firmName && <p className="text-lg font-medium">{consultant.firmName}</p>}
                            <div className="flex flex-wrap gap-2">
                                {consultant.categories.map((cat: any) => (
                                    <Badge key={cat.id} variant="secondary">{cat.name}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {consultant.bio && (
                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                            <h3 className="text-xl font-semibold mb-2">About</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{consultant.bio}</p>
                            {consultant.experience && (
                                <p className="mt-4 font-medium italic">Experience: {consultant.experience} years</p>
                            )}
                        </div>
                    )}

                    {consultant.keyServices && (
                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">Key Services</h3>
                            <div className="text-muted-foreground whitespace-pre-wrap">
                                {consultant.keyServices}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Services & Packages</h3>
                        {consultant.services && consultant.services.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {consultant.services.map((service: any) => (
                                    <div key={service.id} className="p-4 rounded-lg border bg-muted/30">
                                        <h4 className="font-bold text-lg mb-1">{service.title}</h4>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                            {service.description}
                                        </p>
                                        {service.pricingModel && (
                                            <div className="mt-auto pt-2 border-t flex justify-between items-center">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing</span>
                                                <span className="font-medium text-primary">{service.pricingModel}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">
                                No specific services listed yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="font-semibold mb-4">Contact Information</h3>
                        <div className="space-y-3 text-sm">
                            {consultant.contactEmail && (
                                <div>
                                    <p className="font-medium">Direct Email</p>
                                    <p className="text-muted-foreground">{consultant.contactEmail}</p>
                                </div>
                            )}
                            <div>
                                <p className="font-medium">Account Email</p>
                                <p className="text-muted-foreground">{consultant.user.email}</p>
                            </div>
                            {consultant.contactPhone && (
                                <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-muted-foreground">{consultant.contactPhone}</p>
                                </div>
                            )}
                            {consultant.officeAddress && (
                                <div>
                                    <p className="font-medium">Office Address</p>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{consultant.officeAddress}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 pt-6 border-t space-y-3 font-black uppercase tracking-widest">
                            {!session ? (
                                <Button className="w-full" asChild>
                                    <Link href="/login">Login to Connect</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button className="w-full bg-slate-900 h-12">Book Consultation</Button>
                                    {session.role === Role.VENDOR && (
                                        <StartChatButton
                                            otherUserId={consultant.userId}
                                            targetName={consultant.name}
                                            buttonText="Message Consultant"
                                            className="w-full border-2 h-12"
                                            variant="outline"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
