
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";

interface ApprovalsFilterBarProps {
    defaultSearch: string;
    defaultRole: string;
    defaultStatus: string;
}

export function ApprovalsFilterBar({ defaultSearch, defaultRole, defaultStatus }: ApprovalsFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const createQueryString = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", "1"); // Reset to page 1 on filter change
            for (const [key, value] of Object.entries(updates)) {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get("search") as string;
        startTransition(() => {
            router.push(`${pathname}?${createQueryString({ search })}`);
        });
    };

    const handleRoleChange = (value: string) => {
        startTransition(() => {
            router.push(`${pathname}?${createQueryString({ role: value === "ALL" ? "" : value })}`);
        });
    };

    const handleStatusChange = (value: string) => {
        startTransition(() => {
            router.push(`${pathname}?${createQueryString({ status: value === "ALL" ? "" : value })}`);
        });
    };

    const handleReset = () => {
        startTransition(() => {
            router.push(pathname);
        });
    };

    const hasActiveFilters = defaultSearch || defaultRole || defaultStatus;

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 text-slate-500">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm font-semibold text-slate-600">Filters:</span>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-xs">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        name="search"
                        defaultValue={defaultSearch}
                        placeholder="Search email, mobile..."
                        className="pl-9 border-2 border-slate-200 focus:border-slate-900 transition-colors rounded-xl h-9"
                    />
                </div>
                <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="border-2 border-slate-900 bg-slate-900 text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,0.3)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all rounded-xl h-9"
                >
                    Go
                </Button>
            </form>

            {/* Role Filter */}
            <Select
                defaultValue={defaultRole || "ALL"}
                onValueChange={handleRoleChange}
                disabled={isPending}
            >
                <SelectTrigger className="w-[150px] border-2 border-slate-200 rounded-xl h-9 font-medium">
                    <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                    <SelectItem value="OEM">OEM</SelectItem>
                    <SelectItem value="CONSULTANT">Consultant</SelectItem>
                </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
                defaultValue={defaultStatus || "ALL"}
                onValueChange={handleStatusChange}
                disabled={isPending}
            >
                <SelectTrigger className="w-[180px] border-2 border-slate-200 rounded-xl h-9 font-medium">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending Review</SelectItem>
                    <SelectItem value="NEEDS_MORE_INFO">Needs Info</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                </SelectContent>
            </Select>

            {/* Reset */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isPending}
                    className="text-slate-500 hover:text-slate-800 gap-1.5 h-9"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                </Button>
            )}

            {isPending && (
                <span className="text-xs text-slate-400 animate-pulse">Loading...</span>
            )}
        </div>
    );
}
