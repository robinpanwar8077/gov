"use client";

import { useActionState } from "react";
import { FormState } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { approveVendor, rejectVendor } from "@/lib/actions/admin";

const initialState: FormState = { error: "", success: false };

export function ApprovalButtons({ vendorId }: { vendorId: string }) {
    const [stateApprove, formActionApprove] = useActionState(approveVendor, initialState);
    const [stateReject, formActionReject] = useActionState(rejectVendor, initialState);

    return (
        <div className="flex justify-end gap-2">
            <form action={formActionApprove}>
                <input type="hidden" name="vendorId" value={vendorId} />
                <Button size="sm" variant="default">Approve</Button>
            </form>
            <form action={formActionReject}>
                <input type="hidden" name="vendorId" value={vendorId} />
                <Button size="sm" variant="destructive">Reject</Button>
            </form>
        </div>
    )
}
