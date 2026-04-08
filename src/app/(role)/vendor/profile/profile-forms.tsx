"use client";

import { getSession } from "@/lib/auth";
import { updateVendorProfile, uploadKYCDocument } from "@/lib/actions/vendor";
import { FormState } from "@/lib/types";
import { useActionState, useEffect, useState } from "react";
import { useGracefulForm } from "@/hooks/use-graceful-form";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2, Upload, Building2, FileCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: FormState = { error: "", success: false };
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function VendorProfileForm({ vendor }: { vendor: any }) {
  const [state, formAction, isPending] = useActionState(updateVendorProfile, initialState);
  const { checkNetwork, handleSafeSubmit } = useGracefulForm();

  useEffect(() => {
    if (state.success) {
      toast.success("Profile details updated successfully!");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form
      onSubmit={(e) => handleSafeSubmit(e, formAction)}
      className={`grid gap-6 bg-card p-6 border rounded-xl shadow-sm transition-opacity ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label htmlFor="companyName" className="font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Legal Company Name
          </Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue={vendor?.companyName}
            placeholder="As per GST/PAN"
            required
            className="focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        {/* ... Rest of fields ... */}
        <div className="grid gap-2">
          <Label htmlFor="pan" className="font-semibold">PAN Number</Label>
          <Input id="pan" name="pan" defaultValue={vendor?.pan || ""} placeholder="ABCDE1234F" required maxLength={10} className="uppercase font-mono" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gst" className="font-semibold">GST Number</Label>
          <Input id="gst" name="gst" defaultValue={vendor?.gst || ""} placeholder="22AAAAA0000A1Z5" required maxLength={15} className="uppercase font-mono" />
          <p className="text-[10px] text-muted-foreground">Format: 2 digits + 10 chars PAN + 3 chars</p>
        </div>

        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label htmlFor="registeredAddress" className="font-semibold text-sm">Registered Office Address</Label>
          <Input id="registeredAddress" name="registeredAddress" defaultValue={vendor?.registeredAddress || ""} placeholder="Full address" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contactPerson" className="font-semibold">Contact Person Name</Label>
          <Input id="contactPerson" name="contactPerson" defaultValue={vendor?.contactPerson || ""} placeholder="Primary contact" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contactEmail" className="font-semibold">Contact Email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={vendor?.contactEmail || ""} placeholder="email@company.com" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contactPhone" className="font-semibold">Contact Phone</Label>
          <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={vendor?.contactPhone || ""} placeholder="9876543210" required pattern="[6-9][0-9]{9}" />
        </div>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Company profile updated successfully!
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full md:w-max px-8 font-bold">
        {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> SAVING...</> : "UPDATE PROFILE"}
      </Button>
    </form>
  );
}

export function VendorKYCForm() {
  const [state, formAction, isPending] = useActionState(uploadKYCDocument, initialState);
  const [clientError, setClientError] = useState<string>("");
  const { checkNetwork, handleSafeSubmit } = useGracefulForm();

  useEffect(() => {
    if (state.success) {
      toast.success("Document uploaded successfully!");
    }
  }, [state.success]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!checkNetwork(e)) return;
    setClientError("");
    const form = e.currentTarget;
    const fileInput = form.file as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file && file.size > MAX_FILE_SIZE) {
      e.preventDefault();
      setClientError("File size exceeds 5MB limit.");
      return;
    }
  };

  return (
    <form onSubmit={(e) => handleSafeSubmit(e, (fd) => {
      // Wrapper for KYC form to include client validations
      setClientError("");
      const fileInput = e.currentTarget.file as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (file && file.size > MAX_FILE_SIZE) {
        setClientError("File size exceeds 5MB limit.");
        return;
      }
      return formAction(fd);
    })} className={`grid gap-5 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className="grid gap-2">
        <Label htmlFor="documentType" className="font-semibold text-sm">Document Type *</Label>
        <select
          id="documentType"
          name="documentType"
          required
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select document type...</option>
          <option value="PAN_CARD">PAN Card</option>
          <option value="GST_CERTIFICATE">GST Certificate</option>
          <option value="CANCELLED_CHEQUE">Cancelled Cheque</option>
          <option value="AUTH_LETTER">Authorization Letter</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="file" className="font-semibold text-sm">Select File *</Label>
        <div className="relative group">
          <Input id="file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="h-14 cursor-pointer pt-4 border-dashed border-2 hover:border-primary/50 transition-colors" />
          <Upload className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors pr-1" />
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" /> Supported: PDF, JPG, PNG (Max 5MB)
        </p>
      </div>

      {(clientError || state?.error) && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {clientError || state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
          <FileCheck className="w-4 h-4 shrink-0" />
          Verification pending for uploaded document.
        </div>
      )}

      <Button type="submit" disabled={isPending} variant="secondary" className="w-full font-bold h-11 shadow-sm">
        {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> UPLOADING...</> : "UPLOAD & SUBMIT"}
      </Button>
    </form>
  );
}
