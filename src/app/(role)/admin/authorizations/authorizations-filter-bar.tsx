"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function AuthorizationsFilterBar({ 
    defaultSearch = "", 
    defaultStatus = "" 
}: { 
    defaultSearch?: string;
    defaultStatus?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(defaultSearch);
    const [status, setStatus] = useState(defaultStatus || "ALL");

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== defaultSearch) {
                updateFilters(search, status);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const updateFilters = useCallback((q: string, s: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (q) params.set("q", q);
        else params.delete("q");

        if (s && s !== "ALL") params.set("status", s);
        else params.delete("status");

        // Reset page if filters change
        params.delete("page");

        router.push(`?${params.toString()}`);
    }, [router, searchParams]);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        updateFilters(search, value);
    };

    const clearFilters = () => {
        setSearch("");
        setStatus("ALL");
        router.push("?");
    };

    const hasFilters = search !== "" || (status !== "" && status !== "ALL");

    return (
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col lg:flex-row gap-4 items-center animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Vendor, OEM, or Product..."
                    className="pl-10 h-11 bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl border border-muted-foreground/10 h-11">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground hidden sm:block">Status</span>
                    <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[140px] border-none bg-transparent shadow-none focus:ring-0 h-8 font-bold text-xs">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                            <SelectItem value="ALL" className="font-bold text-xs cursor-pointer">All Requests</SelectItem>
                            <SelectItem value="PENDING" className="font-bold text-xs cursor-pointer">Pending</SelectItem>
                            <SelectItem value="APPROVED" className="font-bold text-xs cursor-pointer">Approved</SelectItem>
                            <SelectItem value="REJECTED" className="font-bold text-xs cursor-pointer">Rejected</SelectItem>
                            <SelectItem value="MORE_INFO_NEEDED" className="font-bold text-xs cursor-pointer">More Info Needed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {hasFilters && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-11 px-4 text-[10px] font-black uppercase text-destructive hover:bg-destructive/5 hover:text-destructive rounded-xl transition-all"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
