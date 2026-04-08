"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { FormState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { addConsultantService, updateConsultantService } from "@/lib/actions/consultant";
import { ConsultantService } from "@/lib/types";

interface ServiceFormProps {
    service?: ConsultantService;
    onSuccess?: () => void;
}

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {label}
        </Button>
    );
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
    const action = service
        ? updateConsultantService.bind(null, service.id)
        : addConsultantService;

    const [state, formAction] = useActionState(action, {} as FormState);

    if (state.success && onSuccess) {
        onSuccess();
    }

    return (
        <form action={formAction} className="space-y-4 py-4">
            {state?.error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {state.error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Tender Filing, Documentation Review"
                    defaultValue={service?.title}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Brief Description *</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Explain what this service covers..."
                    defaultValue={service?.description}
                    required
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="pricingModel">Pricing Model / Fee Structure (Optional)</Label>
                <Input
                    id="pricingModel"
                    name="pricingModel"
                    placeholder="e.g. ₹5000 per filing, Fixed Fee, etc."
                    defaultValue={service?.pricingModel || ""}
                />
                <p className="text-xs text-muted-foreground">
                    This helps visitors understand your pricing.
                </p>
            </div>

            {service && (
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        value="true"
                        defaultChecked={service.isActive}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="isActive">This service is active</Label>
                </div>
            )}

            <SubmitButton label={service ? "Update Service" : "Add Service"} />
        </form>
    );
}
