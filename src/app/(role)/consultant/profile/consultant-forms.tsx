"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { FormState, ConsultantProfile, ConsultingCategory } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { updateConsultantProfile, uploadConsultantKYC } from "@/lib/actions/consultant";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Briefcase, Mail, Phone, MapPin, Upload, FileText, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { toProxyUrl } from "@/lib/storage-utils";
import { toast } from "sonner";
import { useGracefulForm } from "@/hooks/use-graceful-form";

const initialState: FormState = { error: "", success: false };

export function ConsultantProfileForm({
    consultant,
    categories
}: {
    consultant: any, // Using any for prisma include result
    categories: ConsultingCategory[]
}) {
    const [state, formAction, isPending] = useActionState(updateConsultantProfile, initialState);
    const { handleSafeSubmit } = useGracefulForm();

    // Track selected categories
    const initialSelected = consultant?.categories?.map((c: any) => c.id) || [];
    const [selectedCats, setSelectedCats] = useState<string[]>(initialSelected);

    useEffect(() => {
        if (state.success) {
            toast.success("Consultant profile updated successfully!");
        }
    }, [state.success]);

    const toggleCategory = (id: string) => {
        setSelectedCats(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <form onSubmit={(e) => handleSafeSubmit(e, formAction)} className="space-y-6">
            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Professional Identity
                    </CardTitle>
                    <CardDescription>This information will be visible to potential clients on their discovery portal.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" name="name" defaultValue={consultant?.name} required placeholder="e.g. Adv. Rajesh Kumar" className="bg-muted/50 focus:bg-background transition-colors" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="firmName">Firm Name (Optional)</Label>
                        <Input id="firmName" name="firmName" defaultValue={consultant?.firmName || ''} placeholder="e.g. RK Legal Associates" className="bg-muted/50 focus:bg-background transition-colors" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="bio">Professional Bio & Experience Summary *</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={consultant?.bio || ''}
                            placeholder="Detail your background, notable projects, and how you help businesses with government procurement..."
                            rows={5}
                            required
                            className="bg-muted/50 focus:bg-background transition-colors resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground italic">Minimum 50 characters recommended for better visibility.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-t-4 border-t-indigo-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-500" />
                        Specializations & Services
                    </CardTitle>
                    <CardDescription>Select the consulting fields you operate in and highlight your key offerings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid gap-3">
                        <Label className="text-base font-semibold">Consulting Categories *</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`relative flex items-start space-x-3 border-2 p-4 rounded-xl transition-all duration-200 cursor-pointer group ${selectedCats.includes(cat.id)
                                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                        : 'border-transparent bg-muted/30 hover:bg-muted/60'
                                        }`}
                                // onClick={() => toggleCategory(cat.id)}
                                >
                                    <div className="pt-0.5">
                                        <Checkbox
                                            id={`cat-${cat.id}`}
                                            checked={selectedCats.includes(cat.id)}
                                            onCheckedChange={() => toggleCategory(cat.id)}
                                            className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                        />
                                    </div>
                                    <div className="grid gap-1.5 leading-none">
                                        <label htmlFor={`cat-${cat.id}`} className="text-sm font-bold leading-none cursor-pointer group-hover:text-indigo-600 transition-colors">
                                            {cat.name}
                                        </label>
                                        {cat.description && (
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {cat.description}
                                            </p>
                                        )}
                                    </div>
                                    <input type="hidden" name="categories" value={cat.id} disabled={!selectedCats.includes(cat.id)} />
                                </div>
                            ))}
                        </div>
                        {selectedCats.length === 0 && <p className="text-[10px] text-red-500 font-medium">Please select at least one category.</p>}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <div className="relative">
                                <Input
                                    id="experience"
                                    name="experience"
                                    type="number"
                                    defaultValue={consultant?.experience || ''}
                                    placeholder="e.g. 10"
                                    className="bg-muted/50 focus:bg-background pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">Years</span>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="keyServices">Top Services *</Label>
                            <Input
                                id="keyServices"
                                name="keyServices"
                                defaultValue={consultant?.keyServices || ''}
                                placeholder="e.g. Audit, GeM Onboarding, Legal Drafting"
                                required
                                className="bg-muted/50 focus:bg-background"
                            />
                            <p className="text-[10px] text-muted-foreground">Comma separated values.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-t-4 border-t-teal-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-teal-500" />
                        Communication Channels
                    </CardTitle>
                    <CardDescription>Verified contact info for lead generation and platform inquiries.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="contactEmail" className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> Contact Email *
                        </Label>
                        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={consultant?.contactEmail || ''} required className="bg-muted/50 focus:bg-background" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="contactPhone" className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> Contact Phone *
                        </Label>
                        <Input id="contactPhone" name="contactPhone" defaultValue={consultant?.contactPhone || ''} required className="bg-muted/50 focus:bg-background" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="officeAddress" className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Physical Office Address
                        </Label>
                        <Textarea
                            id="officeAddress"
                            name="officeAddress"
                            defaultValue={consultant?.officeAddress || ''}
                            placeholder="Complete address for on-site meetings or legal correspondence."
                            rows={3}
                            className="bg-muted/50 focus:bg-background resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            {state?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{state.error}</p>
                </div>
            )}

            {state?.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-sm text-green-700 font-medium">Profile saved successfully. Welcome to the discovery portal!</p>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} size="lg" className="min-w-[240px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold">
                    {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> SYNCING...</> : "Finalize & Sync Profile"}
                </Button>
            </div>
        </form>
    );
}

export function ConsultantKYCForm({ existingDocs }: { existingDocs: any[] }) {
    const [state, formAction, isPending] = useActionState(uploadConsultantKYC, initialState);
    const { handleSafeSubmit } = useGracefulForm();

    useEffect(() => {
        if (state.success) {
            toast.success("KYC Document uploaded for review.");
        }
    }, [state.success]);

    const docTypes = [
        { id: 'ID_PROOF', label: 'Identity Proof', sub: 'Aadhar Card, PAN, or Passport', icon: <User className="w-4 h-4" /> },
        { id: 'PROFESSIONAL_CERT', label: 'Professional Credential', sub: 'Certificate of Practice, Degree, or License', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'GST_CERT', label: 'Business Registration', sub: 'GST Certificate or Firm Registration Deed', icon: <FileText className="w-4 h-4" /> },
    ];

    return (
        <Card className="border-t-4 border-t-amber-500 overflow-hidden">
            <CardHeader className="bg-amber-50/30">
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    Verification Assets (KYC)
                </CardTitle>
                <CardDescription>Upload high-resolution documents for admin verification. Verification increases your profile reach.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid gap-4">
                    {docTypes.map((dt) => {
                        const existing = existingDocs.find(d => d.documentType === dt.id);
                        return (
                            <div key={dt.id} className="group relative flex flex-col p-5 border-2 border-dashed rounded-2xl hover:border-amber-400 hover:bg-amber-50/20 transition-all gap-5">
                                <div className="flex gap-4 items-start">
                                    <div className={`p-3 rounded-xl shrink-0 ${existing ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'} transition-colors`}>
                                        {dt.icon}
                                    </div>
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <p className="font-bold text-sm truncate">{dt.label}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{dt.sub}</p>

                                        {existing && (
                                            <div className="flex flex-wrap items-center gap-2 pt-1.5">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${existing.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    existing.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {existing.status === 'PENDING' && <AlertCircle className="w-2.5 h-2.5" />}
                                                    {existing.status === 'APPROVED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                    {existing.status === 'REJECTED' && <XCircle className="w-2.5 h-2.5" />}
                                                    {existing.status}
                                                </span>
                                                <a href={toProxyUrl(existing.fileUrl)} target="_blank" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 shrink-0">
                                                    Preview Document →
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <form 
                                    onSubmit={(e) => handleSafeSubmit(e, formAction)}
                                    className="grid grid-cols-1 gap-3 w-full"
                                >
                                    <input type="hidden" name="documentType" value={dt.id} />
                                    <div className="relative w-full">
                                        <Input
                                            type="file"
                                            name="file"
                                            className="h-10 text-xs pl-3 pr-1 bg-background cursor-pointer border-dashed focus-visible:ring-amber-500 w-full"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            required
                                            disabled={isPending}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isPending} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white w-full h-10 px-6 gap-2 font-bold shadow-md shadow-amber-200 transition-all active:scale-[0.98]">
                                        {isPending ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> UPLOADING...</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> {existing ? 'Update Document' : 'Upload Document'}</>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        );
                    })}
                </div>

                {state?.error && (
                    <div className="mt-6 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100 flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5" /> {state.error}
                    </div>
                )}
                {state?.success && (
                    <div className="mt-6 p-3 bg-green-50 text-green-600 rounded-lg text-xs font-semibold border border-green-100 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> File transmitted to server. Verification pending.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
