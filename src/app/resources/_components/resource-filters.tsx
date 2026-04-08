"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceFiltersProps {
    topics: string[];
}

export function ResourceFilters({ topics }: ResourceFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Internal state for immediate feedback
    const [search, setSearch] = useState(searchParams.get("search") || "");

    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1"); // Reset to page 1

        startTransition(() => {
            router.push(`/resources?${params.toString()}`);
        });
    };

    const clearFilters = () => {
        setSearch("");
        router.push("/resources");
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-muted-foreground/10">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search GeM guides, case studies..."
                    className="pl-10 h-11"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") updateFilters("search", search);
                    }}
                />
                {isPending && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            <Select
                value={searchParams.get("type") || "all"}
                onValueChange={(val) => updateFilters("type", val)}
            >
                <SelectTrigger className="w-full md:w-[180px] h-11">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="GUIDE">Guides</SelectItem>
                    <SelectItem value="CASE_STUDY">Case Studies</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={searchParams.get("topic") || "all"}
                onValueChange={(val) => updateFilters("topic", val)}
            >
                <SelectTrigger className="w-full md:w-[180px] h-11">
                    <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                            {topic}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {(searchParams.get("search") || searchParams.get("type") || searchParams.get("topic")) && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-11 px-3 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4 mr-2" /> Clear
                </Button>
            )}
        </div>
    );
}
