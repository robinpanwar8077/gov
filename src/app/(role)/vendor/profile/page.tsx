
import { VendorProfileForm, VendorKYCForm } from "./profile-forms";
import { VendorCategoryForm } from "./category-form";
import { getAllCategories } from "@/lib/actions/vendor";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { KYCStatus, KYCDocStatus } from "@/lib/types";
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toProxyUrl } from "@/lib/storage-utils";


export default async function ProfilePage() {
    const session = await getSession();
    const userId = session?.id as string;

    const allCategories = await getAllCategories();

    const vendor = await prisma.vendorProfile.findUnique({
        where: { userId },
        include: {
            kycDocuments: true,
            categories: true,
            subCategories: true
        }
    });

    // Calculate Completion (Simple Logic)
    let kycCompleted = vendor?.kycStatus === 'APPROVED';
    let detailsCompleted = !!vendor?.companyName;
    let categoriesCompleted = (vendor?.categories?.length || 0) > 0;

    let completionScore = 0;
    if (detailsCompleted) completionScore += 30;
    if (categoriesCompleted) completionScore += 30;
    if (kycCompleted) completionScore += 40;


    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* 1. Header & Purpose Statement */}
            <div className="border-b pb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Company Profile</h1>
                        <p className="text-lg font-medium text-blue-700 bg-blue-50/80 px-4 py-2 rounded-lg border border-blue-100 inline-block">
                            This profile helps OEMs verify your business and enables faster authorization and higher GeM bid eligibility.
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border self-start ${vendor?.kycStatus === KYCStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' :
                        vendor?.kycStatus === KYCStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>

                        {vendor?.kycStatus === KYCStatus.APPROVED ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        KYC STATUS: {vendor?.kycStatus || 'NOT STARTED'}
                    </div>
                </div>

                {/* 2. Profile Strength Meter */}
                <div className="mt-6 p-4 bg-slate-50 border rounded-xl flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative h-24 w-24 shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm border-4 border-slate-100">
                        <span className={`text-2xl font-bold ${completionScore === 100 ? 'text-green-600' : 'text-blue-600'}`}>{completionScore}%</span>
                        <span className="absolute text-[10px] bottom-4 text-muted-foreground uppercase tracking-widest">Score</span>
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            {detailsCompleted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                            <span className={detailsCompleted ? "text-slate-800 font-medium" : "text-slate-500"}>Basic Details</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {kycCompleted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                            <span className={kycCompleted ? "text-slate-800 font-medium" : "text-slate-500"}>KYC Verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {categoriesCompleted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                            <span className={categoriesCompleted ? "text-slate-800 font-medium" : "text-slate-500"}>GeM Categories Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-slate-500">Product Mapping Pending</span>
                        </div>
                    </div>

                    <div className="md:border-l pl-0 md:pl-6 w-full md:w-auto">
                        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Next Step</p>
                        {detailsCompleted && kycCompleted && categoriesCompleted ? (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
                                <Link href="/vendor/auth-requests">
                                    Request Authorization <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                disabled
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="sm"
                            >
                                Request Authorization <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-3">
                {/* Profile Form (Left Column - Larger) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-2 border-b">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</div>
                            <h2 className="text-xl font-bold text-slate-800">Registration Data</h2>
                        </div>
                        <VendorProfileForm vendor={vendor} />
                    </div>

                    <div className="space-y-4 mt-8">
                        <div className="flex flex-col gap-1 pb-2 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">2</div>
                                <h2 className="text-xl font-bold text-slate-800">Business Categories</h2>
                            </div>
                            <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block self-start ml-11">
                                Correct category selection improves OEM visibility and authorization approval chances.
                            </p>
                        </div>

                        {/* 3. Business Categories (Wrapper needs no change, just context) */}
                        <VendorCategoryForm
                            allCategories={allCategories}
                            selectedCategoryIds={vendor?.categories.map((c: any) => c.id) || []}
                            selectedSubCategoryIds={vendor?.subCategories.map((s: any) => s.id) || []}
                        />
                    </div>
                </div>

                {/* KYC Upload (Right Column - Smaller) */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-2 border-b">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">3</div>
                            <h2 className="text-xl font-bold text-slate-800">Verification</h2>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-yellow-700 mt-0.5 shrink-0" />
                            <p className="text-xs font-medium text-yellow-800 leading-relaxed">
                                Only verified profiles are visible to OEMs and eligible for authorization requests.
                            </p>
                        </div>

                        <div className="bg-white border text-sm p-5 rounded-xl space-y-5 shadow-sm">
                            <div>
                                <h3 className="font-semibold mb-1 text-slate-900">Upload Documents</h3>
                                <p className="text-xs text-muted-foreground mb-4">Upload GST certificate, PAN card, or Incorporation papers.</p>
                                <VendorKYCForm />
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-3 text-slate-900">Uploaded Files</h3>
                                {(!vendor?.kycDocuments || vendor.kycDocuments.length === 0) ? (
                                    <div className="text-center py-6 border-2 border-dashed rounded-lg bg-slate-50">
                                        <p className="text-xs text-muted-foreground italic">No documents uploaded yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {vendor?.kycDocuments.map((doc: any) => {
                                            const typeNames: Record<string, string> = {
                                                'PAN_CARD': 'PAN Card',
                                                'GST_CERTIFICATE': 'GST Certificate',
                                                'CANCELLED_CHEQUE': 'Cancelled Cheque',
                                                'AUTH_LETTER': 'Auth Letter'
                                            };

                                            return (
                                                <div key={doc.id} className="flex flex-col gap-2 p-3 bg-white border rounded-lg hover:shadow-md transition-all group relative">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-700">
                                                                {typeNames[doc.documentType] || doc.documentType}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {new Date(doc.uploadedAt).toLocaleDateString()}
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
                                                            className="flex-1 text-center py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
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

            {/* 5. Next Recommended Action */}
            <div className="mt-12 border-t pt-8">
                <div className="bg-slate-900 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Next Recommended Actions</h3>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Request OEM Authorization</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Add Products for GeM Mapping</li>
                        </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-900/50" asChild>
                            <Link href="/vendor/auth-requests">Proceed to Authorization <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent border-slate-600 text-white hover:bg-slate-800" asChild>
                            <Link href="/vendor/products/new">Add First Product</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
