
"use client";

import { useEffect, useState } from "react";
import { getUnreadCount } from "@/lib/actions/messages";
import { Badge } from "@/components/ui/badge";

export function MessagingBadge() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const c = await getUnreadCount();
                setCount(c);
            } catch (error) {
                console.error("Failed to fetch unread count:", error);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    if (count === 0) return null;

    return (
        <Badge className="ml-1 bg-red-600 text-white border-none h-5 w-5 flex items-center justify-center p-0 text-[10px] font-black animate-pulse">
            {count > 9 ? "9+" : count}
        </Badge>
    );
}
