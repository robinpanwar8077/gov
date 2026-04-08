"use client";

import { useActionState, useState, useEffect } from "react";
import { FormState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { processAuthRequest } from "@/lib/actions/oem";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, HelpCircle, Loader2, AlertCircle } from "lucide-react";

const initialState: FormState = { error: "", success: false };

export function ActionButtons({ requestId }: { requestId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [action, setAction] = useState<"APPROVE" | "REJECT" | "CLARIFY" | null>(null);
    const [comment, setComment] = useState("");

    const [state, formAction, isPending] = useActionState(processAuthRequest, initialState);

    useEffect(() => {
        if (state.success) {
            setIsOpen(false);
            setAction(null);
            setComment("");
        }
    }, [state]);

    const getActionColor = () => {
        if (action === "APPROVE") return "bg-green-600 hover:bg-green-700";
        if (action === "REJECT") return "bg-destructive hover:bg-destructive/90";
        return "bg-amber-600 hover:bg-amber-700";
    };

    const getActionIcon = () => {
        if (action === "APPROVE") return <CheckCircle2 className="w-5 h-5 mr-2" />;
        if (action === "REJECT") return <XCircle className="w-5 h-5 mr-2" />;
        return <HelpCircle className="w-5 h-5 mr-2" />;
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    className="h-8 text-[10px] font-black uppercase text-green-700 border-green-200 hover:bg-green-50"
                    onClick={() => { setAction("APPROVE"); setIsOpen(true); }}
                >
                    Approve
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    className="h-8 text-[10px] font-black uppercase text-amber-700 border-amber-200 hover:bg-amber-50"
                    onClick={() => { setAction("CLARIFY"); setIsOpen(true); }}
                >
                    Clarify
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    className="h-8 text-[10px] font-black uppercase text-red-700 border-red-200 hover:bg-red-50"
                    onClick={() => { setAction("REJECT"); setIsOpen(true); }}
                >
                    Reject
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => { if (!isPending) setIsOpen(open); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <form action={formAction}>
                        <input type="hidden" name="requestId" value={requestId} />
                        <input type="hidden" name="action" value={action || ""} />

                        <DialogHeader>
                            <DialogTitle className="flex items-center">
                                {getActionIcon()}
                                {action === "APPROVE" && "Approve Request"}
                                {action === "REJECT" && "Reject Request"}
                                {action === "CLARIFY" && "Request Clarification"}
                            </DialogTitle>
                            <DialogDescription>
                                {action === "APPROVE" && "The vendor will be authorized to represent this product."}
                                {action === "REJECT" && "The vendor will not be able to represent this product. Please provide a reason."}
                                {action === "CLARIFY" && "Ask the vendor for more details or documents."}
                            </DialogDescription>
                        </DialogHeader>

                        {state.error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                {state.error}
                            </div>
                        )}

                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="comment" className="font-bold text-xs uppercase tracking-wider">
                                    {action === "REJECT" ? "Reason for Rejection *" : "Comments (Optional)"}
                                </Label>
                                <Textarea
                                    id="comment"
                                    name="comment"
                                    placeholder={action === "REJECT" ? "Please state why this request is being rejected..." : "Add any specific conditions or notes..."}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required={action === "REJECT"}
                                    className="min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className={getActionColor()}
                                disabled={isPending || (action === "REJECT" && !comment.trim())}
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : getActionIcon()}
                                Confirm {action ? action.charAt(0) + action.slice(1).toLowerCase() : "Action"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
