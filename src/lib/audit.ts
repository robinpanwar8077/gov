import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function createAuditLog({
    userId,
    action,
    details,
}: {
    userId?: string;
    action: string;
    details?: string;
}) {
    try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                details,
                ipAddress: ip,
            },
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
}
