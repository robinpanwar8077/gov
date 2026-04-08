
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role, AuthStatus } from "@/lib/types";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Building2, Package, Calendar, FileText, Download, ExternalLink, ShieldCheck, Mail, Phone, Clock, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StartChatButton } from "@/components/messaging/start-chat-button";

export default async function VendorRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== Role.VENDOR) {
        redirect("/login");
    }

    const { id } = await params;
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.id as string } });

    if (!vendor) redirect("/vendor/profile");

    const request = await prisma.authorizationRequest.findUnique({
        where: { id, vendorId: vendor.id },
        include: {
            oem: {
                include: { user: { select: { email: true, mobile: true } } }
            },
            product: {
                include: { category: true, subCategory: true }
            },
            documents: true
        }
    });

    if (!request) {
        notFound();
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case AuthStatus.APPROVED: return <CheckCircle2 className="w-4 h-4 mr-2" />;
            case AuthStatus.REJECTED: return <XCircle className="w-4 h-4 mr-2" />;
            case AuthStatus.MORE_INFO_NEEDED: return <HelpCircle className="w-4 h-4 mr-2" />;
            default: return <Clock className="w-4 h-4 mr-2" />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case AuthStatus.APPROVED: return 'bg-green-100 text-green-700 hover:bg-green-100';
            case AuthStatus.REJECTED: return 'bg-red-100 text-red-700 hover:bg-red-100';
            case AuthStatus.MORE_INFO_NEEDED: return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
            default: return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
        }
    };

    return (
        <div className="grid gap-8 max-w-5xl mx-auto w-full pb-20">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="pl-0">
                    <Link href="/vendor/auth-requests"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests</Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Request Details</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        Ref: <span className="font-mono text-xs uppercase">{request.id}</span>
                        <span className="text-xs">•</span>
                        <Calendar className="w-3 h-3" /> {new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                </div>
                <Badge className={`text-lg px-4 py-1.5 uppercase tracking-widest flex items-center ${getStatusVariant(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status === 'PENDING' ? 'Pending OEM Review' : request.status.replace(/_/g, ' ')}
                </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* OEM Comment / Feedback */}
                    {request.oemComment && (
                        <div className={`p-8 rounded-2xl border shadow-sm space-y-4 ${request.status === AuthStatus.REJECTED ? 'bg-red-50 border-red-200' :
                            request.status === AuthStatus.MORE_INFO_NEEDED ? 'bg-amber-50 border-amber-200' :
                                'bg-green-50 border-green-200'
                            }`}>
                            <h3 className={`text-lg font-bold flex items-center gap-2 ${request.status === AuthStatus.REJECTED ? 'text-red-900' :
                                request.status === AuthStatus.MORE_INFO_NEEDED ? 'text-amber-900' :
                                    'text-green-900'
                                }`}>
                                <FileText className="w-5 h-5" /> OEM Remarks
                            </h3>
                            <div className="p-5 bg-white rounded-xl text-foreground font-medium leading-relaxed border shadow-sm">
                                {request.oemComment}
                            </div>
                        </div>
                    )}

                    {/* Vendor's Proposal */}
                    {request.notes && (
                        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" /> Your Proposal / Notes
                            </h3>
                            <div className="p-5 bg-muted/30 rounded-xl text-muted-foreground leading-relaxed italic">
                                "{request.notes}"
                            </div>
                        </div>
                    )}

                    {/* Product Details Card */}
                    <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                                <Package className="w-5 h-5" /> Product Information
                            </h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6 p-6 bg-muted/20 rounded-2xl border">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Product Name</p>
                                <p className="font-bold">{request.product.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">SKU / Model</p>
                                <p className="font-medium font-mono text-sm">{request.product.sku || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Category</p>
                                <Badge variant="outline">{request.product.category?.name || 'General'}</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Description</p>
                                <p className="text-xs text-muted-foreground line-clamp-3">{request.product.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: OEM Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 sticky top-24">
                        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Building2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black leading-tight">{request.oem.companyName}</h2>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Manufacturer / OEM</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">OEM Contact</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="font-medium truncate">{request.oem.contactEmail || request.oem.user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="font-medium">{request.oem.contactPhone || request.oem.user.mobile || 'No phone provided'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button variant="outline" className="w-full border-2 font-black uppercase tracking-widest text-xs h-10" asChild>
                                <Link href={`/directory/oems/${request.oem.slug}`}>View Profile</Link>
                            </Button>
                            <StartChatButton
                                otherUserId={request.oem.userId}
                                targetName={request.oem.companyName}
                                buttonText="Message OEM"
                                className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-xs h-10"
                            />
                        </div>
                    </div>

                    {request.status === AuthStatus.PENDING && (
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl space-y-3">
                            <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Under Review
                            </h3>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                The OEM is currently reviewing your request. You will be notified once a decision is made or if more information is needed.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
