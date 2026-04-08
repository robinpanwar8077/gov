"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export function DashboardDateFilters({ 
    defaultRange = "30",
    basePath = ""
}: { 
    defaultRange?: string,
    basePath?: string
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [range, setRange] = useState(defaultRange);

    const updateFilters = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (value && value !== "ALL") {
            params.set("range", value);
        } else {
            params.delete("range");
        }

        router.push(`${basePath}?${params.toString()}`);
    };

    const handleRangeChange = (value: string) => {
        setRange(value);
        updateFilters(value);
    };

    const clearFilters = () => {
        setRange("ALL");
        router.push("/admin/dashboard");
    };

    const getRangeLabel = () => {
        switch(range) {
            case "7": return "Last 7 Days";
            case "30": return "Last 30 Days";
            case "90": return "Last 90 Days";
            case "365": return "Last Year";
            default: return "All Time";
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <CalendarIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Time Period</p>
                    <Select value={range} onValueChange={handleRangeChange}>
                        <SelectTrigger className="w-[180px] h-8 border-none p-0 focus:ring-0 shadow-none font-bold text-slate-900">
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                            <SelectItem value="ALL" className="font-bold text-xs cursor-pointer">All Time</SelectItem>
                            <SelectItem value="7" className="font-bold text-xs cursor-pointer">Last 7 Days</SelectItem>
                            <SelectItem value="30" className="font-bold text-xs cursor-pointer">Last 30 Days</SelectItem>
                            <SelectItem value="90" className="font-bold text-xs cursor-pointer">Last 90 Days</SelectItem>
                            <SelectItem value="365" className="font-bold text-xs cursor-pointer">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="h-8 w-[2px] bg-slate-100 hidden sm:block" />

            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Active Range:</span>
                    <span className="text-xs font-bold text-slate-900">{getRangeLabel()}</span>
                </div>
                
                {range !== "ALL" && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-8 px-3 text-[10px] font-black uppercase text-destructive hover:bg-destructive/5 rounded-lg"
                    >
                        <X className="h-3 w-3 mr-1.5" />
                        Reset
                    </Button>
                )}
            </div>

            <div className="text-[10px] text-muted-foreground font-medium italic">
                {range === "ALL" ? "Showing platform lifetime data" : `Data filtered for the ${getRangeLabel().toLowerCase()}`}
            </div>
        </div>
    );
}
