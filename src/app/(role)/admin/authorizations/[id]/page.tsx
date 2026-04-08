
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role, AuthStatus, AuthRequestDocument } from "@/lib/types";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    ArrowLeft,
    Building,
    Building2,
    Package,
    Calendar,
    FileText,
    Download,
    ExternalLink,
    ShieldCheck,
    ShieldAlert,
    History,
    Lock,
    Unlock,
    User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminActionButtons } from "../admin-actions";

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
        redirect("/login");
    }

    const { id } = await params;

    const request = await prisma.authorizationRequest.findUnique({
        where: { id },
        include: {
            vendor: true,
            oem: true,
            product: {
                include: { category: true }
            },
            documents: true
        }
    });

    if (!request) {
        notFound();
    }

    return (
        <div className="grid gap-8 max-w-5xl mx-auto w-full px-4 pb-20">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="pl-0">
                    <Link href="/admin/authorizations"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Oversight</Link>
                </Button>
                <AdminActionButtons
                    requestId={request.id}
                    isLocked={request.isLocked}
                    currentStatus={request.status}
                />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tight">Investigation Case</h1>
                        {request.isLocked && <Badge variant="destructive" className="uppercase tracking-widest text-[10px]"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        Case ID: <span className="font-mono text-xs uppercase">{request.id}</span>
                        <span className="text-xs">•</span>
                        <Calendar className="w-3 h-3" /> Submitted {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Authority Status</p>
                    <Badge className={`text-lg px-4 py-1.5 uppercase tracking-widest ${request.status === AuthStatus.APPROVED ? 'bg-green-100 text-green-700' :
                        request.status === AuthStatus.REJECTED ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                        {request.status.replace(/_/g, ' ')}
                    </Badge>
                </div>
            </div>

            {/* Admin Override Alert */}
            {request.adminComment && (
                <div className="bg-destructive/5 border border-destructive/20 p-8 rounded-2xl flex gap-6 items-start">
                    <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-black text-destructive uppercase tracking-widest text-xs">Admin Override Recorded</h3>
                        <p className="font-medium text-foreground italic leading-relaxed">
                            "{request.adminComment}"
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold">
                            This decision was enforced by a platform administrator.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Correspondence & Details */}
                    <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" /> Case Correspondence
                        </h3>

                        <div className="space-y-4">
                            <div className="p-5 bg-muted/20 rounded-xl border border-dashed">
                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <User className="w-3 h-3" /> Vendor Statement (Proposal)
                                </p>
                                <p className="text-sm italic text-muted-foreground leading-relaxed">
                                    {request.notes ? `"${request.notes}"` : "No proposal notes provided."}
                                </p>
                            </div>

                            <div className="p-5 bg-primary/5 rounded-xl border border-primary/10">
                                <p className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-1.5">
                                    <Building2 className="w-3 h-3" /> OEM Decision Comments
                                </p>
                                <p className="text-sm font-semibold text-primary leading-relaxed">
                                    {request.oemComment ? request.oemComment : "No OEM comments recorded yet."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Evidence / Documents */}
                    <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Attached Evidence
                        </h3>
                        {request.documents.length === 0 ? (
                            <div className="p-10 text-center border-2 border-dashed rounded-2xl bg-muted/10">
                                <p className="text-sm text-muted-foreground font-medium">No supporting documents attached to this case.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {request.documents.map((doc: AuthRequestDocument) => (
                                    <a
                                        key={doc.id}
                                        href={doc.fileUrl}
                                        target="_blank"
                                        className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors group bg-muted/5"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
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
                </div>

                {/* Stakeholders Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-3">Stakeholders</h3>

                        <div className="space-y-6">
                            {/* Vendor */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Building className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendor Entity</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-tight">{request.vendor.companyName}</p>
                                    <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">ID: {request.vendor.id}</p>
                                </div>
                            </div>

                            {/* OEM */}
                            <div className="space-y-3 pt-4 border-t border-dashed">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authority (OEM)</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-tight">{request.oem.companyName}</p>
                                    <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">ID: {request.oem.id}</p>
                                </div>
                            </div>

                            {/* Product */}
                            <div className="space-y-3 pt-4 border-t border-dashed">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Target</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-tight">{request.product.name}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-tighter">SKU: {request.product.sku || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-2xl border border-dashed">
                        <h4 className="text-xs font-bold text-muted-foreground mb-2">Policy Enforcement</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Admins should only override decisions if platform terms are violated or in the event of a verified legal dispute.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
