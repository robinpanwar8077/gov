
import { OEMProfileForm, OEMKYCForm } from "./oem-forms";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { KYCStatus, KYCDocStatus, Role } from "@/lib/types";
import { redirect } from "next/navigation";
import { toProxyUrl } from "@/lib/storage-utils";

export default async function OEMProfilePage() {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        redirect("/login");
    }

    const userId = session.id as string;

    const oem = await prisma.oEMProfile.findUnique({
        where: { userId },
        include: {
            kycDocuments: true
        }
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight">OEM Profile</h1>
                    <p className="text-muted-foreground text-lg">Manage your manufacturing identity and compliance.</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${oem?.kycStatus === KYCStatus.APPROVED ? 'bg-green-100 text-green-700' :
                    oem?.kycStatus === KYCStatus.REJECTED ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>

                    <div className={`w-2 h-2 rounded-full animate-pulse ${oem?.kycStatus === KYCStatus.APPROVED ? 'bg-green-600' :
                        oem?.kycStatus === KYCStatus.REJECTED ? 'bg-red-600' :
                            'bg-yellow-600'
                        }`} />
                    KYC STATUS: {oem?.kycStatus || 'NOT STARTED'}
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-3">
                {/* Profile Form (Left Column - Larger) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                            <h2 className="text-2xl font-bold">Organization Details</h2>
                        </div>
                        <OEMProfileForm oem={oem} />
                    </div>
                </div>

                {/* KYC Upload (Right Column - Smaller) */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
                            <h2 className="text-2xl font-bold">Verification</h2>
                        </div>

                        <div className="bg-muted/30 border border-border/50 p-6 rounded-xl space-y-6">
                            <div>
                                <h3 className="font-semibold mb-1">Upload Documents</h3>
                                <p className="text-sm text-muted-foreground mb-4">Upload Registration Certificate, GST, etc.</p>
                                <OEMKYCForm />
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <h3 className="font-semibold mb-3">Your Files</h3>
                                {(!oem?.kycDocuments || oem.kycDocuments.length === 0) ? (
                                    <div className="text-center py-6 border-2 border-dashed rounded-lg bg-background/50">
                                        <p className="text-xs text-muted-foreground italic">No documents uploaded yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {oem?.kycDocuments.map((doc: any) => {
                                            const typeNames: Record<string, string> = {
                                                'INCORPORATION_CERT': 'Incorp. Cert',
                                                'GST_CERTIFICATE': 'GST Certificate',
                                                'PAN_CARD': 'PAN Card',
                                                'ISO_CERTIFICATE': 'ISO Cert',
                                                'TRADEMARK_CERT': 'Trademark'
                                            };

                                            return (
                                                <div key={doc.id} className="flex flex-col gap-2 p-4 bg-white border rounded-lg hover:shadow-md transition-all group relative">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-800">
                                                                {typeNames[doc.documentType] || doc.documentType}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${doc.status === KYCDocStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' :
                                                            doc.status === KYCDocStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-blue-50 text-blue-700 border-blue-200'
                                                            }`}>
                                                            {doc.status}
                                                        </div>
                                                    </div>

                                                    {doc.status === KYCDocStatus.REJECTED && doc.notes && (
                                                        <div className="mt-1 p-2 bg-red-50/50 border border-red-100 rounded text-[11px] text-red-800 italic">
                                                            Reason: {doc.notes}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 mt-2">
                                                        <a
                                                            href={toProxyUrl(doc.fileUrl)}
                                                            target="_blank"
                                                            className="flex-1 text-center py-1.5 text-[11px] font-bold bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                                        >
                                                            PREVIEW
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
