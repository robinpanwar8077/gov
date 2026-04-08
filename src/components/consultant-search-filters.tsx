
"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, MapPin, Star } from "lucide-react";

interface ConsultingCategory {
    id: string;
    name: string;
}

export function ConsultantSearchFilters({ categories }: { categories: ConsultingCategory[] }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilterChange = useDebouncedCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1'); // Reset to page 1 on filter change

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Search by name, firm or expertise..."
                    defaultValue={searchParams.get('q')?.toString()}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    className="pl-10 border-2 border-slate-200 focus:border-slate-900 focus:ring-0 transition-all font-medium py-6"
                />
            </div>

            <div className="flex-1 md:max-w-[350px]">
                <Select
                    defaultValue={searchParams.get('cat')?.toString() || "all"}
                    onValueChange={(val) => handleFilterChange('cat', val === "all" ? "" : val)}
                >
                    <SelectTrigger className="border-2 border-slate-200 focus:border-slate-900 ring-0 h-[52px] font-medium">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="All Consulting Areas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Consulting Areas</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 md:max-w-[200px]">
                <Select
                    defaultValue={searchParams.get('location')?.toString() || "all"}
                    onValueChange={(val) => handleFilterChange('location', val === "all" ? "" : val)}
                >
                    <SelectTrigger className="border-2 border-slate-200 focus:border-slate-900 ring-0 h-[52px] font-medium">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="delhi">Delhi NCR</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 md:max-w-[150px]">
                <Select
                    defaultValue={searchParams.get('rating')?.toString() || "all"}
                    onValueChange={(val) => handleFilterChange('rating', val === "all" ? "" : val)}
                >
                    <SelectTrigger className="border-2 border-slate-200 focus:border-slate-900 ring-0 h-[52px] font-medium">
                        <Star className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
