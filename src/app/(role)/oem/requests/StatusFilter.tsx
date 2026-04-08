"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function StatusFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilter = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "ALL") {
            params.set('status', value);
        } else {
            params.delete('status');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <Select
            defaultValue={searchParams.get('status')?.toString() || "ALL"}
            onValueChange={handleFilter}
        >
            <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">All Requests</SelectItem>
                <SelectItem value="PENDING">Pending Only</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
        </Select>
    );
}
