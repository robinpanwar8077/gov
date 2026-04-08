"use client";

import { useEffect, useRef } from "react";
import { incrementBlogPostViews } from "@/lib/actions/blog";
import { incrementResourceViews } from "@/lib/actions/resource";

interface ViewTrackerProps {
    id: string;
    type: "blog" | "resource";
}

export function ViewTracker({ id, type }: ViewTrackerProps) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;

        tracked.current = true;

        const trackView = async () => {
            if (type === "blog") {
                await incrementBlogPostViews(id);
            } else {
                await incrementResourceViews(id);
            }
        };

        // Delay slightly to ensure it's a real view and not just a prefetch/quick bounce
        const timer = setTimeout(trackView, 2000);

        return () => clearTimeout(timer);
    }, [id, type]);

    return null; // This component doesn't render anything
}
