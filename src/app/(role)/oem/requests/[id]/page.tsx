
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role, AuthStatus } from "@/lib/types";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Building2, Package, Calendar, FileText, Download, ExternalLink, ShieldCheck, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActionButtons } from "../action-buttons";
import { toProxyUrl } from "@/lib/storage-utils";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        redirect("/login");
    }

    const { id } = await params;
    const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });

    if (!oem) redirect("/oem/profile");

    const request = await prisma.authorizationRequest.findUnique({
        where: { id, oemId: oem.id },
        include: {
            vendor: {
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

    return (
        <div className="grid gap-8 max-w-5xl mx-auto w-full pb-20">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="pl-0">
                    <Link href="/oem/requests"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests</Link>
                </Button>
                {request.status === AuthStatus.PENDING && (
                    <ActionButtons requestId={request.id} />
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Authorization Request</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        Ref: <span className="font-mono text-xs uppercase">{request.id}</span>
                        <span className="text-xs">•</span>
                        <Calendar className="w-3 h-3" /> {new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                </div>
                <Badge className={`text-lg px-4 py-1.5 uppercase tracking-widest ${request.status === AuthStatus.APPROVED ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                    request.status === AuthStatus.REJECTED ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                        'bg-amber-100 text-amber-700 hover:bg-amber-100'
                    }`}>
                    {request.status}
                </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Side: Vendor & Product Details */}
                <div className="md:col-span-2 space-y-8">
                    {/* Notes Section */}
                    {request.notes && (
                        <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" /> Vendor Proposal / Notes
                            </h3>
                            <div className="p-5 bg-muted/30 rounded-xl text-muted-foreground leading-relaxed italic">
                                "{request.notes}"
                            </div>
                        </div>
                    )}

                    {/* OEM Comment Section */}
                    {request.oemComment && (
                        <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                                <FileText className="w-5 h-5" /> OEM Feedback / Conditions
                            </h3>
                            <div className="p-5 bg-white rounded-xl text-primary font-medium leading-relaxed">
                                {request.oemComment}
                            </div>
                        </div>
                    )}


                    {/* Supporting Documents */}
                    <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                            <Download className="w-5 h-5" /> Supporting Documents
                        </h3>
                        {request.documents.length === 0 ? (
                            <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg text-center font-medium outline-dashed outline-1 outline-muted">
                                No additional documents were attached to this request.
                            </p>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {request.documents.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={toProxyUrl(doc.fileUrl)}
                                        target="_blank"
                                        className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold truncate">{doc.fileName}</p>
                                                <p className="text-[10px] uppercase text-muted-foreground font-black">{doc.fileType.split('/')[1] || 'FILE'}</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details Card */}
                    <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" /> Requested Product Information
                            </h3>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/oem/catalog#${request.product.id}`}>Edit in Catalog</Link>
                            </Button>
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
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Price Range (OEM)</p>
                                <p className="font-semibold text-sm">{request.product.priceRange || 'Contact for pricing'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Vendor Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 sticky top-24">
                        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Building2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black leading-tight">{request.vendor.companyName}</h2>
                                <p className="text-xs font-bold text-muted-foreground mt-1">GST: {request.vendor.gst}</p>
                            </div>
                            <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified Vendor
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendor Contact</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="font-medium truncate">{request.vendor.user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="font-medium">{request.vendor.user.mobile || 'No phone provided'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button variant="outline" className="w-full text-xs font-bold" asChild>
                                <Link href={`/directory/vendors/${request.vendor.slug || request.vendor.id}`} target="_blank">
                                    View Platform Profile <ExternalLink className="w-3 h-3 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-3">
                        <h3 className="font-bold text-amber-900 text-sm">Review Policy</h3>
                        <p className="text-xs text-amber-800 leading-relaxed">
                            Approving this request grants the vendor legal authorization to list your products on government portals. Ensure all background checks are completed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
