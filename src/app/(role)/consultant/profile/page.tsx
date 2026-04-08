
import { ConsultantProfileForm, ConsultantKYCForm } from "./consultant-forms";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getConsultingCategories } from "@/lib/actions/consultant";
import { Role } from "@/lib/types";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";

export default async function ConsultantProfilePage() {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        redirect("/login");
    }

    const userId = session.id as string;

    const consultant = await prisma.consultantProfile.findUnique({
        where: { userId },
        include: {
            categories: true,
            kycDocuments: true,
        }
    });

    const categories = await getConsultingCategories();

    if (!consultant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <h2 className="text-2xl font-bold">Profile Not Found</h2>
                <p className="text-muted-foreground">Please contact support if you believe this is an error.</p>
            </div>
        );
    }

    const isVerified = consultant.kycStatus === 'APPROVED';

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-extrabold tracking-tight">Professional Profile</h1>
                        {isVerified ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 flex items-center gap-1.5 font-bold">
                                <ShieldCheck className="w-4 h-4" /> Verified Consultant
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1.5 font-bold">
                                <UserCheck className="w-4 h-4" /> Verification In Progress
                            </Badge>
                        )}
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Optimize your presence on GovProNet. Complete your profile and upload verification documents to start receiving consulting inquiries.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Account Status</span>
                    <span className={`text-xl font-black ${isVerified ? 'text-green-600' : 'text-amber-500'}`}>
                        {consultant.kycStatus}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left side: Main Form */}
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                            <h2 className="text-2xl font-bold">Profile Details</h2>
                        </div>
                        <ConsultantProfileForm consultant={consultant} categories={categories} />
                    </section>
                </div>

                {/* Right side: KYC and sidebar info */}
                <div className="lg:col-span-1 space-y-10">
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">2</div>
                            <h2 className="text-2xl font-bold">Verification</h2>
                        </div>
                        <ConsultantKYCForm existingDocs={consultant.kycDocuments} />
                    </section>

                    {/* <aside className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            💡 Tips for Consultants
                        </h3>
                        <ul className="space-y-3 text-sm text-indigo-800">
                            <li className="flex gap-2">
                                <span className="text-indigo-400 font-bold">•</span>
                                Be specific about your <b>GeM experience</b> if you have it.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-400 font-bold">•</span>
                                Uploading a <b>CA Certificate</b> or <b>Bar License</b> significantly improves approval speed.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-400 font-bold">•</span>
                                Highlight sectors like <b>Defence</b>, <b>Railway</b>, or <b>Public Health</b> in your bio.
                            </li>
                        </ul>
                    </aside> */}
                </div>
            </div>
        </div>
    )
}
