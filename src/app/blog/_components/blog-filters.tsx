"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";

interface BlogFiltersProps {
    categories: { id: string, name: string, slug: string }[];
}

export function BlogFilters({ categories }: BlogFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const currentCategory = searchParams.get("category") || "all";

    // Handle search with debounce in real app, but simple for now
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (searchParams.get("search") || "")) {
                updateFilters({ search });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const updateFilters = (newFilters: { search?: string; category?: string; page?: string }) => {
        const params = new URLSearchParams(searchParams.toString());

        if (newFilters.search !== undefined) {
            if (newFilters.search) params.set("search", newFilters.search);
            else params.delete("search");
        }

        if (newFilters.category !== undefined) {
            if (newFilters.category && newFilters.category !== "all") params.set("category", newFilters.category);
            else params.delete("category");
        }

        // Reset to page 1 on filter change
        params.delete("page");

        startTransition(() => {
            router.push(`/blog?${params.toString()}`);
        });
    };

    const clearFilters = () => {
        setSearch("");
        startTransition(() => {
            router.push("/blog");
        });
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
            <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1">Search Articles</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or content..."
                        className="pl-9 h-11 bg-card border-muted-foreground/20 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {isPending && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full md:w-[240px] space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1">Category</label>
                <Select
                    value={currentCategory}
                    onValueChange={(val) => updateFilters({ category: val })}
                >
                    <SelectTrigger className="h-11 bg-card border-muted-foreground/20 rounded-xl">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {(search || currentCategory !== "all") && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-11 px-4 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-xl"
                >
                    <X className="mr-2 h-4 w-4" /> Clear
                </Button>
            )}
        </div>
    );
}
