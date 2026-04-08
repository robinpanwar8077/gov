
"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        replace(`${pathname}?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-10">
            <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="font-black uppercase tracking-widest text-sm px-4">
                Page {currentPage} of {totalPages}
            </span>

            <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
