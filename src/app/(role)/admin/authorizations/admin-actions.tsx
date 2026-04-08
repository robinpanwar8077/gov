"use client";

import { useActionState, useState, useEffect } from "react";
import { FormState, AuthStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { overrideAuthRequest, toggleLockAuthRequest } from "@/lib/actions/admin";
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
import {
    ShieldAlert,
    Lock,
    Unlock,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    HelpCircle
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const initialState: FormState = { error: "", success: false };

export function AdminActionButtons({
    requestId,
    isLocked,
    currentStatus
}: {
    requestId: string,
    isLocked: boolean,
    currentStatus: AuthStatus
}) {
    const [isOverrideOpen, setIsOverrideOpen] = useState(false);
    const [status, setStatus] = useState<AuthStatus>(currentStatus);
    const [comment, setComment] = useState("");

    const [state, formAction, isPending] = useActionState(overrideAuthRequest, initialState);

    useEffect(() => {
        if (state.success) {
            setIsOverrideOpen(false);
            setComment("");
        }
    }, [state]);

    const handleToggleLock = async () => {
        const res = await toggleLockAuthRequest(requestId, !isLocked);
        if (res.error) alert(res.error);
    };

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                className={`h-9 text-[10px] font-black uppercase tracking-wider ${isLocked ? 'text-green-700 border-green-200' : 'text-destructive border-red-200'}`}
                onClick={handleToggleLock}
            >
                {isLocked ? <><Unlock className="w-3.5 h-3.5 mr-2" /> Unlock Request</> : <><Lock className="w-3.5 h-3.5 mr-2" /> Lock Request</>}
            </Button>

            <Button
                variant="default"
                size="sm"
                className="h-9 text-[10px] font-black uppercase tracking-wider bg-destructive hover:bg-destructive/90"
                onClick={() => setIsOverrideOpen(true)}
            >
                <ShieldAlert className="w-3.5 h-3.5 mr-2" /> Manual Override
            </Button>

            <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form action={formAction}>
                        <input type="hidden" name="requestId" value={requestId} />
                        <input type="hidden" name="status" value={status} />

                        <DialogHeader>
                            <DialogTitle className="flex items-center text-destructive">
                                <ShieldAlert className="w-5 h-5 mr-2" />
                                Admin Status Override
                            </DialogTitle>
                            <DialogDescription>
                                Forcing a status change bypasses OEM control. This action is permanent and will be logged in the system audit trail.
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
                                <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Force New Status</Label>
                                <Select value={status} onValueChange={(v) => setStatus(v as AuthStatus)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={AuthStatus.APPROVED}>Approved</SelectItem>
                                        <SelectItem value={AuthStatus.REJECTED}>Rejected</SelectItem>
                                        <SelectItem value={AuthStatus.MORE_INFO_NEEDED}>More Info Needed</SelectItem>
                                        <SelectItem value={AuthStatus.PENDING}>Pending (Reset)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adminComment" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Override Remarks (Required) *
                                </Label>
                                <Textarea
                                    id="adminComment"
                                    name="adminComment"
                                    placeholder="Explain why this override is necessary..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    className="min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOverrideOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={isPending || !comment.trim()}
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : <ShieldAlert className="w-4 h-4 mr-2" />}
                                Force Override
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
