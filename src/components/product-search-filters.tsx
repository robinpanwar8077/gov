
"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Tag, Layers } from "lucide-react";

interface SubCategory {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    subCategories: SubCategory[];
}

export function ProductSearchFilters({ categories }: { categories: Category[] }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentCategoryId = searchParams.get('cat');

    // Find selected category to show relevant subcategories
    const selectedCategory = categories.find(c => c.id === currentCategoryId);
    const subCategories = selectedCategory ? selectedCategory.subCategories : [];

    const handleFilterChange = useDebouncedCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1'); // Reset to page 1

        if (value) {
            params.set(key, value);
            // If category changes, clear subcategory
            if (key === 'cat') {
                params.delete('sub');
            }
        } else {
            params.delete(key);
            if (key === 'cat') {
                params.delete('sub');
            }
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Search products by name, OEM or description..."
                    defaultValue={searchParams.get('q')?.toString()}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    className="pl-10 border-2 border-slate-200 focus:border-slate-900 focus:ring-0 transition-all font-medium py-6"
                />
            </div>

            <div className="flex-1 md:max-w-[250px]">
                <Select
                    defaultValue={searchParams.get('cat')?.toString() || "all"}
                    onValueChange={(val) => handleFilterChange('cat', val === "all" ? "" : val)}
                >
                    <SelectTrigger className="border-2 border-slate-200 focus:border-slate-900 ring-0 h-[52px] font-medium">
                        <Tag className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 md:max-w-[250px]">
                <Select
                    defaultValue={searchParams.get('sub')?.toString() || "all"}
                    onValueChange={(val) => handleFilterChange('sub', val === "all" ? "" : val)}
                    disabled={!currentCategoryId || subCategories.length === 0}
                >
                    <SelectTrigger className={`border-2 ring-0 h-[52px] font-medium transition-all ${!currentCategoryId ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-slate-200 focus:border-slate-900'}`}>
                        <Layers className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="Sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sub-categories</SelectItem>
                        {subCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
