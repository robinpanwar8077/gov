"use client";

import { useActionState } from "react";
import { archiveProduct, unarchiveProduct } from "@/lib/actions/oem";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore } from "lucide-react";
import { FormState } from "@/lib/types";

const initialState: FormState = { error: "", success: false };

export function ProductArchiveToggle({ productId, isArchived }: { productId: string; isArchived: boolean }) {
    const action = isArchived ? unarchiveProduct : archiveProduct;
    const [state, formAction, isPending] = useActionState(action, initialState);

    return (
        <form action={formAction}>
            <input type="hidden" name="productId" value={productId} />
            {isArchived ? (
                <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    disabled={isPending}
                    title="Restore Product"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                    <ArchiveRestore className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    disabled={isPending}
                    title="Archive Product"
                    className="text-destructive hover:bg-destructive/10"
                >
                    <Archive className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
                </Button>
            )}
        </form>
    );
}
