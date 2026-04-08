"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNotifications(limit: number = 20) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.id as string },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return { success: true, notifications };
    } catch (error) {
        console.error("Get Notifications Error:", error);
        return { error: "Failed to fetch notifications" };
    }
}

export async function getUnreadNotificationCount() {
    const session = await getSession();
    if (!session) return { count: 0 };

    try {
        const count = await prisma.notification.count({
            where: {
                userId: session.id as string,
                isRead: false
            }
        });
        return { count };
    } catch (error) {
        console.error("Get Unread Count Error:", error);
        return { count: 0 };
    }
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: session.id as string // Ensure ownership
            },
            data: { isRead: true }
        });

        revalidatePath("/(role)", "layout");
        return { success: true };
    } catch (error) {
        console.error("Mark Read Error:", error);
        return { error: "Failed to update notification" };
    }
}

export async function markAllNotificationsAsRead() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.id as string,
                isRead: false
            },
            data: { isRead: true }
        });

        revalidatePath("/(role)", "layout");
        return { success: true };
    } catch (error) {
        console.error("Mark All Read Error:", error);
        return { error: "Failed to update notifications" };
    }
}
