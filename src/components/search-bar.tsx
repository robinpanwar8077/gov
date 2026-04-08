"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from "@/components/ui/input";

export function SearchBar({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <Input
            placeholder={placeholder}
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('q')?.toString()}
            className="max-w-md"
        />
    );
}
