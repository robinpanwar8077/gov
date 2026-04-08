"use client";

import { useActionState, useEffect } from "react";
import { FormState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOEMProfile, uploadOEMKYCDocument } from "@/lib/actions/oem";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2, Building2, ShieldCheck } from "lucide-react";
import { useGracefulForm } from "@/hooks/use-graceful-form";

const initialState: FormState = { error: "", success: false };

export function OEMProfileForm({ oem }: { oem: any }) {
    const [state, formAction, isPending] = useActionState(updateOEMProfile, initialState);
    const { handleSafeSubmit } = useGracefulForm();

    useEffect(() => {
        if (state.success) {
            toast.success("OEM Profile updated successfully!");
        }
    }, [state.success]);

    return (
        <form 
            onSubmit={(e) => handleSafeSubmit(e, formAction)}
            className={`grid gap-6 bg-card p-6 border rounded-xl shadow-sm ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="companyName" className="font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" /> Company Name
                    </Label>
                    <Input id="companyName" name="companyName" defaultValue={oem?.companyName} placeholder="Registered Company Name" required />
                </div>
                
                {/* ... other fields remain same ... */}
                <div className="grid gap-2">
                    <Label htmlFor="oemType" className="font-semibold">OEM Category</Label>
                    <Select name="oemType" defaultValue={oem?.oemType || "MANUFACTURER"}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MANUFACTURER">Original Manufacturer</SelectItem>
                            <SelectItem value="ASSEMBLER">Assembler</SelectItem>
                            <SelectItem value="AUTHORIZED_DISTRIBUTOR">Authorized Distributor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="registrationNumber" className="font-semibold">Registration / CIN Number</Label>
                    <Input id="registrationNumber" name="registrationNumber" defaultValue={oem?.registrationNumber || ''} placeholder="U12345MH2023PTC123456" required className="uppercase font-mono" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="registeredAddress" className="font-semibold">Registered Office Address</Label>
                    <Input id="registeredAddress" name="registeredAddress" defaultValue={oem?.registeredAddress || ''} placeholder="Full address" required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="contactPerson" className="font-semibold">Contact Person Name</Label>
                    <Input id="contactPerson" name="contactPerson" defaultValue={oem?.contactPerson || ''} placeholder="Primary contact" required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="contactEmail" className="font-semibold">Contact Email</Label>
                    <Input id="contactEmail" name="contactEmail" type="email" defaultValue={oem?.contactEmail || ''} placeholder="email@company.com" required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="contactPhone" className="font-semibold">Contact Phone</Label>
                    <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={oem?.contactPhone || ''} placeholder="9876543210" required pattern="[6-9][0-9]{9}" />
                </div>
            </div>

            {state?.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    OEM profile updated successfully!
                </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full md:w-max px-8 font-bold">
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> SAVING...</> : "Update Details"}
            </Button>
        </form>
    )
}

export function OEMKYCForm() {
    const [state, formAction, isPending] = useActionState(uploadOEMKYCDocument, initialState);
    const { handleSafeSubmit } = useGracefulForm();

    useEffect(() => {
        if (state.success) {
            toast.success("KYC Document uploaded!");
        }
    }, [state.success]);

    return (
        <form 
            onSubmit={(e) => handleSafeSubmit(e, formAction)}
            className={`grid gap-5 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
        >
            <div className="grid gap-2">
                <Label htmlFor="documentType" className="font-semibold">Document Type</Label>
                <select
                    id="documentType"
                    name="documentType"
                    required
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">Select document type...</option>
                    <option value="INCORPORATION_CERT">Certificate of Incorporation</option>
                    <option value="GST_CERTIFICATE">GST Certificate</option>
                    <option value="PAN_CARD">PAN Card</option>
                    <option value="ISO_CERTIFICATE">ISO Certificate (Optional)</option>
                    <option value="TRADEMARK_CERT">Trademark Registration</option>
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="file" className="font-semibold">Select File</Label>
                <div className="flex flex-col gap-1">
                    <Input id="file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="h-11 cursor-pointer pt-2 border-dashed border-2" />
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> PDF, JPG, PNG (Max 5MB)
                    </p>
                </div>
            </div>

            {state?.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Document uploaded for verification.
                </div>
            )}

            <Button type="submit" disabled={isPending} variant="secondary" className="w-full font-bold shadow-sm">
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> UPLOADING...</> : "Start Upload"}
            </Button>
        </form>
    )
}
