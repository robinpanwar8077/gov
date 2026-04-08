
import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DetailedReview } from "./review-actions";
import { getSession } from "@/lib/auth";
import { Role, KYCStatus } from "@/lib/types";
import { ArrowLeft, Building2, Mail, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ApprovalDetail({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ role?: string }>
}) {
    const awaitedParams = await params;
    const awaitedSearchParams = await searchParams;
    const session = await getSession();

    if (!session || session.role !== Role.ADMIN) {
        redirect("/login");
    }

    const { id } = awaitedParams;
    const role = awaitedSearchParams.role || Role.VENDOR;

    let profile: any = null;

    if (role === Role.OEM) {
        profile = await prisma.oEMProfile.findUnique({
            where: { id },
            include: {
                user: true,
                kycDocuments: true,
                catalog: true
            }
        });
    } else if (role === Role.CONSULTANT) {
        profile = await prisma.consultantProfile.findUnique({
            where: { id },
            include: {
                user: true,
                kycDocuments: true,
                categories: true
            }
        });
    } else {
        profile = await prisma.vendorProfile.findUnique({
            where: { id },
            include: {
                user: true,
                kycDocuments: true,
                categories: true
            }
        });
    }

    if (!profile) {
        notFound();
    }

    const isOEM = role === Role.OEM;
    const isConsultant = role === Role.CONSULTANT;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/approvals">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{profile.companyName || profile.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{role}</Badge>
                        <Badge variant="secondary">{profile.kycStatus}</Badge>
                        <span className="text-sm text-muted-foreground">Joined {new Date(profile.user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Col: Profile Data */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Contact Details</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Contact Person</p>
                                    <p className="text-muted-foreground">{profile.contactPerson}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-muted-foreground">{profile.contactEmail}</p>
                                    <p className="text-xs text-muted-foreground">{profile.user.email} (Login)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-muted-foreground">{profile.contactPhone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Address</p>
                                    <p className="text-muted-foreground">{profile.registeredAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Business & Registration</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">
                                    {isOEM ? 'Reg Number' : isConsultant ? 'Firm Name' : 'GST Number'}
                                </span>
                                <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                                    {isOEM ? profile.registrationNumber : isConsultant ? (profile.firmName || 'Individual') : profile.gst}
                                </span>
                            </div>
                            {isConsultant && (
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Experience</span>
                                    <span className="font-semibold text-primary">{profile.experience || 0} Years</span>
                                </div>
                            )}
                            {!isOEM && !isConsultant && (
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">PAN Number</span>
                                    <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{profile.pan}</span>
                                </div>
                            )}
                            {isOEM && profile.oemType && (
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">OEM Type</span>
                                    <Badge variant="outline" className="text-[10px]">{profile.oemType}</Badge>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <p className="font-medium mb-2 text-sm">
                                {isOEM ? 'Products in Catalog' : isConsultant ? 'Consulting Categories' : 'Selected Categories'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {isOEM ? (
                                    <span className="text-sm">{profile.catalog?.length || 0} Products Listed</span>
                                ) : (
                                    profile.categories?.map((c: any) => (
                                        <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Review Actions */}
                <div className="md:col-span-2">
                    <DetailedReview
                        profileId={profile.id}
                        role={role as Role}
                        docs={profile.kycDocuments}
                        currentStatus={profile.kycStatus as KYCStatus}
                    />
                </div>
            </div>
        </div>
    );
}
