import { ArrowRight, BadgeCheck, Building2, CircleDashed, FileText, Layers, Package, Info } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KYCStatus } from "@/lib/types";

interface OnboardingProgressProps {
    vendor: {
        companyName: string;
        pan?: string | null;
        gst?: string | null;
        registeredAddress?: string | null;
        contactPerson?: string | null;
        contactEmail?: string | null;
        kycStatus: string;
        kycDocuments: any[];
        categories: any[];
        products: any[];
    } | null;
}

export function OnboardingProgress({ vendor }: OnboardingProgressProps) {
    if (!vendor) return null;

    // Step 1: Profile
    const isProfileComplete = !!(
        vendor.companyName &&
        vendor.pan &&
        vendor.gst &&
        vendor.registeredAddress &&
        vendor.contactPerson &&
        vendor.contactEmail
    );

    // Step 2: Categories
    const isCategoriesComplete = vendor.categories && vendor.categories.length > 0;

    // Step 3: KYC
    // In Progress if docs uploaded but not approved. Complete if Approved.
    const hasDocs = vendor.kycDocuments && vendor.kycDocuments.length > 0;
    const isKYCComplete = vendor.kycStatus === KYCStatus.APPROVED;
    const isKYCInProgress = hasDocs && !isKYCComplete;

    // Step 4: Products
    const isProductsComplete = vendor.products && vendor.products.length > 0;

    // Calculate total progress
    const steps = [isProfileComplete, isCategoriesComplete, isKYCComplete, isProductsComplete];
    const completedSteps = steps.filter(Boolean).length;
    const totalSteps = 4;
    const progressPercentage = (completedSteps / totalSteps) * 100;

    // Derived Status Logic
    let overallStatus: 'DRAFT' | 'SUBMITTED' | 'ACTIVE' | 'REJECTED' | 'NEEDS_MORE_INFO' = 'DRAFT';

    if (vendor.kycStatus === KYCStatus.APPROVED) {
        overallStatus = 'ACTIVE';
    } else if (vendor.kycStatus === KYCStatus.REJECTED) {
        overallStatus = 'REJECTED';
    } else if (vendor.kycStatus === KYCStatus.NEEDS_MORE_INFO) {
        overallStatus = 'NEEDS_MORE_INFO';
    } else if (hasDocs && isProfileComplete && isCategoriesComplete) {
        // Assuming if docs are uploaded and profile is done, it's submitted for review
        overallStatus = 'SUBMITTED';
    }

    // If all complete, we might want to hide this or show a "All Set" message.
    // However, the requirement is to show progress.
    const isFullyComplete = completedSteps === totalSteps;

    const stages = [
        {
            id: 1,
            label: "Company Profile",
            description: "Registration details & contact info",
            icon: Building2,
            isComplete: isProfileComplete,
            isInProgress: !isProfileComplete && !!vendor.companyName,
            href: "/vendor/profile",
            cta: "Update Profile"
        },
        {
            id: 2,
            label: "Business Categories",
            description: "Select your industry sectors",
            icon: Layers,
            isComplete: isCategoriesComplete,
            isInProgress: false,
            href: "/vendor/profile",
            cta: "Manage Categories"
        },
        {
            id: 3,
            label: "KYC Verification",
            description: "Upload GST & PAN documents",
            icon: FileText,
            isComplete: isKYCComplete,
            isInProgress: isKYCInProgress,
            href: "/vendor/profile",
            cta: "View KYC Status"
        },
        {
            id: 4,
            label: "Product Catalog",
            description: "Add your first product",
            icon: Package,
            isComplete: isProductsComplete,
            isInProgress: false,
            href: "/vendor/products",
            cta: "Add Products"
        }
    ];

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800">
                <div
                    className={`h-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(59,130,246,0.5)] ${overallStatus === 'ACTIVE' ? 'bg-green-500' :
                        overallStatus === 'REJECTED' ? 'bg-red-500' : 
                        overallStatus === 'NEEDS_MORE_INFO' ? 'bg-blue-500' : 'bg-primary'
                        }`}
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            <CardContent className="p-8">
                {/* Status Banners */}
                {overallStatus === 'NEEDS_MORE_INFO' && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-800">Action Required: Clarification Needed</h3>
                            <p className="text-sm text-blue-600 mt-1 mb-2">
                                Our verification team needs a little more information from you. Please review the specific feedback below.
                            </p>
                            {/* Show specific info needed if available in docs */}
                            {vendor.kycDocuments?.filter((d: any) => d.status === KYCStatus.NEEDS_MORE_INFO).map((doc: any) => (
                                <div key={doc.id} className="text-xs bg-white/50 p-2 rounded border border-blue-100 text-blue-700 mt-1">
                                    <span className="font-bold">{doc.documentType}:</span> {doc.notes || 'Information requested'}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {overallStatus === 'SUBMITTED' && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <CircleDashed className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-800">Application Submitted for Review</h3>
                            <p className="text-sm text-blue-600 mt-1">
                                You have completed all mandatory steps. Our team is currently reviewing your profile and documents.
                                Updates will be sent to your email.
                            </p>
                        </div>
                    </div>
                )}

                {overallStatus === 'REJECTED' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <BadgeCheck className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800">Action Required: Application Returned</h3>
                            <p className="text-sm text-red-600 mt-1 mb-2">
                                Some details or documents were rejected. Please check the specific sections below for feedback.
                            </p>
                            {/* Attempt to show specific rejection reasons if available in docs */}
                            {vendor.kycDocuments?.filter((d: any) => d.status === 'REJECTED').map((doc: any) => (
                                <div key={doc.id} className="text-xs bg-white/50 p-2 rounded border border-red-100 text-red-700 mt-1">
                                    <span className="font-bold">{doc.documentType}:</span> {doc.notes || 'Document rejected'}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {overallStatus === 'ACTIVE' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <BadgeCheck className="w-6 h-6 text-green-600" />
                        <div>
                            <h3 className="font-semibold text-green-800">You are Active!</h3>
                            <p className="text-sm text-green-600">
                                Your vendor profile is fully approved. You can now list limitless products and receive orders.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold tracking-tight">Onboarding Progress</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${overallStatus === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                                overallStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                overallStatus === 'NEEDS_MORE_INFO' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    'bg-primary/10 text-primary border-primary/20'
                                }`}>
                                {overallStatus === 'ACTIVE' ? 'Verified' : 
                                 overallStatus === 'NEEDS_MORE_INFO' ? 'Clarification' : 
                                 Math.round(progressPercentage) + '% Complete'}
                            </span>
                        </div>
                        <p className="text-muted-foreground w-full md:max-w-xl">
                            {overallStatus === 'ACTIVE'
                                ? 'Maintain your profile and product catalog to improve visibility.'
                                : 'Complete these steps to fully activate your vendor account and start receiving orders.'}
                        </p>
                    </div>


                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stages.map((stage) => {
                        const Icon = stage.icon;
                        const statusColor = stage.isComplete
                            ? "text-green-600 bg-green-100 dark:bg-green-900/20"
                            : stage.isInProgress
                                ? "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
                                : "text-gray-400 bg-gray-100 dark:bg-gray-800";

                        return (
                            <Link key={stage.id} href={stage.href} className="group block h-full">
                                <div className={`
                                    relative h-full p-5 rounded-xl border transition-all duration-300
                                    ${stage.isComplete
                                        ? 'border-green-200 bg-green-50/30 hover:bg-green-50 dark:border-green-900/30'
                                        : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50'}
                                `}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${statusColor}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        {stage.isComplete ? (
                                            <BadgeCheck className="w-6 h-6 text-green-500" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 text-xs font-bold group-hover:border-primary/50 group-hover:text-primary transition-colors">
                                                {stage.id}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className={`font-semibold mb-1 ${stage.isComplete ? 'text-green-900 dark:text-green-100' : 'text-foreground'}`}>
                                        {stage.label}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                                        {stage.description}
                                    </p>

                                    <div className={`
                                        flex items-center text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform
                                        ${stage.isComplete ? 'text-green-700' : 'text-primary'}
                                    `}>
                                        {stage.cta}
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
