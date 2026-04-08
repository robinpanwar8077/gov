"use client";

import { useActionState, useEffect, useState } from "react";
import { FormState } from "@/lib/types";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, X, FileText, Plus } from "lucide-react";
import { useGracefulForm } from "@/hooks/use-graceful-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { requestAuthorization } from "@/lib/actions/vendor";
import Link from "next/link";

// import { toast } from "sonner"; // If we had toast

const initialState: FormState = {
    error: "",
    success: false,
};

export function RequestForm({ products, defaultProductId }: { products: any[], defaultProductId?: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productIdFromUrl = searchParams.get("productId");
    const { handleSafeSubmit } = useGracefulForm();

    const [state, formAction] = useActionState(requestAuthorization, initialState);
    const [selectedId, setSelectedId] = useState(defaultProductId || productIdFromUrl || "");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
        if (state?.success) {
            const timer = setTimeout(() => {
                router.push("/vendor/auth-requests");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            // Clear the input value so the same file can be selected again if needed
            e.target.value = "";
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    if (state?.success) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center space-y-4 animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-green-900">Request Submitted!</h2>
                <p className="text-muted-foreground">
                    Your authorization request has been sent to the OEM. You will be redirected to your requests dashboard shortly.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/vendor/auth-requests">Go to Dashboard Now</Link>
                </Button>
            </div>
        );
    }

    return (
        <form 
            onSubmit={(e) => handleSafeSubmit(e, (fd) => {
                // Ensure all files in our state are appended correctly
                // We clear the original 'supportingDocs' if any, though handleFileChange clears the input
                fd.delete("supportingDocs");
                selectedFiles.forEach(file => fd.append("supportingDocs", file));
                return formAction(fd);
            })}
            className="grid gap-6"
        >
            <div className="grid gap-2">
                <Label htmlFor="productId" className="font-bold">Select Product (OEM) *</Label>
                <Select name="productId" value={selectedId} onValueChange={setSelectedId} required>
                    <SelectTrigger className="h-12 bg-muted/30">
                        <SelectValue placeholder="Search and select a product" />
                    </SelectTrigger>
                    <SelectContent>
                        {products.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                                <div className="flex flex-col">
                                    <span className="font-semibold">{p.name}</span>
                                    <span className="text-[10px] text-muted-foreground">OEM: {p.oem?.companyName}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {productIdFromUrl && (
                    <p className="text-[10px] text-primary font-medium italic">
                        Product pre-selected from catalog.
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes" className="font-bold">Notes / Proposal (Recommended)</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Provide details about your project, expected volume, or why you're a good fit for this OEM product..."
                    rows={6}
                    className="bg-muted/30 resize-none transition-all focus:bg-background"
                />
            </div>

            <div className="grid gap-3">
                <Label htmlFor="supportingDocs" className="font-bold">Supporting Documents (Optional)</Label>
                
                {/* File List */}
                {selectedFiles.length > 0 && (
                    <div className="grid gap-2 mb-2">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 border rounded-lg group animate-in fade-in slide-in-from-left-2">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate">{file.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeFile(idx)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative group/file">
                    <Input
                        id="supportingDocs"
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                    />
                    <Label
                        htmlFor="supportingDocs"
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-all"
                    >
                        <div className="p-3 bg-primary/10 text-primary rounded-full mb-3 group-hover/file:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm">Add Supporting Files</span>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1 italic">
                            PDF, JPG, PNG, DOC (Max 5MB per file)
                        </span>
                    </Label>
                </div>
            </div>

            {state?.error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {state.error}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button variant="ghost" asChild className="order-2 sm:order-1">
                    <Link href="/vendor/auth-requests">Back to List</Link>
                </Button>
                <Button type="submit" className="order-1 sm:order-2 shadow-lg hover:-translate-y-px transition-transform">
                    Submit Authorization Request
                </Button>
            </div>
        </form>
    );
}
