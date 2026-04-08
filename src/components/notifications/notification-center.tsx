"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/lib/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: Date;
}

interface NotificationCenterProps {
    initialUnreadCount?: number;
}

export function NotificationCenter({ initialUnreadCount = 0 }: NotificationCenterProps) {
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Sync prop with state if it changes from parent revalidation
    useEffect(() => {
        setUnreadCount(initialUnreadCount);
    }, [initialUnreadCount]);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        const res = await getNotifications();
        if (res.success && res.notifications) {
            setNotifications(res.notifications as Notification[]);
        }
        setIsLoading(false);
    };

    const handleMarkAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await markNotificationAsRead(id);
        router.refresh();
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        if (notification.link) {
            setIsOpen(false);
            router.push(notification.link);
        }
    };

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.preventDefault();

        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        await markAllNotificationsAsRead();
        router.refresh();
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-2 text-muted-foreground"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all read
                    </Button>
                </div>
                <DropdownMenuSeparator />

                <div className="max-h-[300px] overflow-y-auto">
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-accent",
                                        !notification.isRead && "bg-muted/50"
                                    )}
                                    onSelect={(e) => {
                                        // If there is a link, let it close and navigate.
                                        // If no link, prevent default close to keep list open so user can read more?
                                        // Actually, usually clicking = done. But user said "not opening".
                                        // Let's assume clicking = mark as read + maybe navigate.

                                        e.preventDefault(); // Take control
                                        handleNotificationClick(notification);
                                    }}
                                >
                                    <div className="flex w-full justify-between gap-2 overflow-hidden">
                                        <span className={cn("font-medium text-sm", !notification.isRead && "text-foreground")}>
                                            {notification.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground w-full line-clamp-2">
                                        {notification.message}
                                    </p>
                                    {!notification.isRead && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    )}
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="w-full text-center block text-xs cursor-pointer p-2">
                    View all notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
