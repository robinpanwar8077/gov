"use client";

import { incrementResourceDownloads } from "@/lib/actions/resource";

interface DownloadTrackerProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export function DownloadTracker({ id, children, className }: DownloadTrackerProps) {
    const handleDownload = async () => {
        await incrementResourceDownloads(id);
    };

    return (
        <div onClick={handleDownload} className={className}>
            {children}
        </div>
    );
}
