"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, FileText, Check, X, Info, HelpCircle } from "lucide-react";
import { KYCDocStatus, KYCStatus, Role } from "@/lib/types";
import { updateDocumentStatus, finalizeVendorReview, finalizeOEMReview, finalizeConsultantReview } from "@/lib/actions/admin";
import { Label } from "@/components/ui/label";
import { toProxyUrl } from "@/lib/storage-utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGracefulForm } from "@/hooks/use-graceful-form";

interface ReviewActionsProps {
    profileId: string;
    role: Role;
    docs: any[];
    currentStatus: KYCStatus;
}

export function DetailedReview({ profileId, role, docs, currentStatus }: ReviewActionsProps) {
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [docInReview, setDocInReview] = useState<any | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const { checkNetwork } = useGracefulForm();

    const handleDocStatus = async (docId: string, status: KYCDocStatus) => {
        if (!navigator.onLine) {
            toast.error("No internet connection. Please check your network and try again.");
            return;
        }
        setIsSubmitting(true);
        const toastId = toast.loading("Updating document status...");
        try {
            const result = await updateDocumentStatus(docId, status, status === KYCDocStatus.REJECTED ? rejectReason : undefined);
            if (result.success) {
                setDocInReview(null);
                setRejectReason("");
                toast.success("Document status updated successfully.");
            } else {
                toast.error(result.error || "Failed to update document status.");
            }
        } catch (err) {
            console.error("KYC Doc Status Update Error:", err);
            toast.error("Network or server failure. Please try again.");
        } finally {
            toast.dismiss(toastId);
            setIsSubmitting(false);
        }
    };

    const handleFinalize = async (status: KYCStatus) => {
        if (!navigator.onLine) {
            toast.error("No internet connection. Please check your network and try again.");
            return;
        }
        const label = role.toLowerCase();
        if (!confirm(`Are you sure you want to mark this ${label} as ${status}?`)) return;

        setIsSubmitting(true);
        const toastId = toast.loading("Finalizing review decision...");
        try {
            let result;
            if (role === Role.OEM) {
                result = await finalizeOEMReview(profileId, status, remarks);
            } else if (role === Role.CONSULTANT) {
                result = await finalizeConsultantReview(profileId, status, remarks);
            } else {
                result = await finalizeVendorReview(profileId, status, remarks);
            }

            if (result.success) {
                toast.success(`${label.toUpperCase()} review completed successfully. Redirecting...`);
                setTimeout(() => {
                    window.location.href = "/admin/approvals";
                }, 1000);
            } else {
                toast.error(result.error || "Failed to finalize review.");
            }
        } catch (err) {
            console.error("KYC Finalization Error:", err);
            toast.error("Network error. Your review decision was not saved—please try again.");
        } finally {
            toast.dismiss(toastId);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Documents Section */}
            <div className="bg-card border rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Submitted KYC Documents
                    </h3>
                </div>
                <div className="divide-y">
                    {docs.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No documents uploaded.</div>
                    ) : (
                        docs.map((doc) => (
                            <div key={doc.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex flex-col gap-1 flex-1">
                                    <span className="font-semibold capitalize text-sm">{doc.documentType.replace('_', ' ')}</span>
                                    <span className="text-xs text-muted-foreground">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>

                                    {doc.status !== KYCDocStatus.PENDING && (
                                        <div className={`mt-1 text-xs font-bold inline-flex items-center gap-1
                                            ${doc.status === KYCDocStatus.APPROVED ? 'text-green-600' :
                                              doc.status === KYCDocStatus.NEEDS_MORE_INFO ? 'text-blue-600' : 'text-red-600'}
                                        `}>
                                            {doc.status === KYCDocStatus.APPROVED ? <CheckCircle2 className="w-3 h-3" /> :
                                             doc.status === KYCDocStatus.NEEDS_MORE_INFO ? <Info className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {doc.status.replace(/_/g, ' ')}
                                            {doc.notes && <span className="text-muted-foreground font-normal ml-1">({doc.notes})</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <a
                                        href={toProxyUrl(doc.fileUrl)}
                                        target="_blank"
                                        className="text-sm bg-secondary px-3 py-2 rounded-md hover:bg-secondary/80 font-medium"
                                    >
                                        View File
                                    </a>

                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant={doc.status === KYCDocStatus.APPROVED ? "default" : "outline"}
                                            className={doc.status === KYCDocStatus.APPROVED ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-200 hover:bg-green-50"}
                                            onClick={() => handleDocStatus(doc.id, KYCDocStatus.APPROVED)}
                                            disabled={isSubmitting || doc.status === KYCDocStatus.APPROVED}
                                            title="Approve Document"
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>

                                        <Dialog 
                                            open={docInReview?.id === doc.id && docInReview?.reviewType === 'needs_info'} 
                                            onOpenChange={(o) => setDocInReview(o ? { ...doc, reviewType: 'needs_info' } : null)}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant={doc.status === KYCDocStatus.NEEDS_MORE_INFO ? "default" : "outline"}
                                                    className={doc.status === KYCDocStatus.NEEDS_MORE_INFO ? "bg-blue-600 hover:bg-blue-700" : "text-blue-600 border-blue-200 hover:bg-blue-50"}
                                                    title="Request More Info"
                                                >
                                                    <HelpCircle className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Request More Information</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Label>Clarification needed for user</Label>
                                                    <Textarea
                                                        placeholder="e.g. Please upload a clear image of the front of the ID card"
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setDocInReview(null)}>Cancel</Button>
                                                    <Button
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                        onClick={() => handleDocStatus(doc.id, KYCDocStatus.NEEDS_MORE_INFO)}
                                                        disabled={!rejectReason || isSubmitting}
                                                    >
                                                        Submit Request
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog 
                                            open={docInReview?.id === doc.id && docInReview?.reviewType === 'reject'} 
                                            onOpenChange={(o) => setDocInReview(o ? { ...doc, reviewType: 'reject' } : null)}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant={doc.status === KYCDocStatus.REJECTED ? "default" : "outline"}
                                                    className={doc.status === KYCDocStatus.REJECTED ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-200 hover:bg-red-50"}
                                                    title="Reject Document"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Reject Document</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Label>Reason for Rejection</Label>
                                                    <Textarea
                                                        placeholder="e.g. Blurred image, mismatched name"
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setDocInReview(null)}>Cancel</Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => handleDocStatus(doc.id, KYCDocStatus.REJECTED)}
                                                        disabled={!rejectReason || isSubmitting}
                                                    >
                                                        Confirm Rejection
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Final Decision Section */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">Final Review Decision</h3>

                <div className="space-y-2">
                    <Label htmlFor="remarks">Review Remarks (Sent to user)</Label>
                    <Textarea
                        id="remarks"
                        placeholder="Add overall comments or specific instructions..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[140px]"
                        onClick={() => handleFinalize(KYCStatus.APPROVED)}
                        disabled={isSubmitting}
                    >
                        Approve
                    </Button>

                    <Button
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-1 min-w-[140px]"
                        onClick={() => handleFinalize(KYCStatus.NEEDS_MORE_INFO)}
                        disabled={isSubmitting}
                    >
                        Needs More Info
                    </Button>

                    <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 flex-1 min-w-[140px]"
                        onClick={() => handleFinalize(KYCStatus.REJECTED)}
                        disabled={isSubmitting}
                    >
                        Reject {role === Role.OEM ? "OEM" : role === Role.CONSULTANT ? "Consultant" : "Vendor"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
