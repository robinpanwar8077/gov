"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { sendEventRegistrationEmail } from "@/lib/email";
import { sendEventReminderSMS } from "@/lib/sms";
import { revalidatePath } from "next/cache";

export async function registerForEvent(eventId: string, eventName: string, eventDate: string) {
    const session = await getSession();
    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: session.id as string } });
        if (!user) return { error: "User not found" };

        // In a real app, we would save to an EventRegistration table.
        // For now, we'll just log it and send the notification as per the requirement.

        // Send Email
        if (user.email) {
            // Get user name from profile if possible, or fallback
            // We'll just use "Participant" or try to fetch profile if we really wanted to be precise, 
            // but for this MVP feature implementation, generic or email is fine.
            let name = "Participant";

            // Try to set a better name based on role
            if (session.role === 'VENDOR') {
                const profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
                if (profile) name = profile.contactPerson || profile.companyName;
            } else if (session.role === 'OEM') {
                const profile = await prisma.oEMProfile.findUnique({ where: { userId: user.id } });
                if (profile) name = profile.contactPerson || profile.companyName;
            } else if (session.role === 'CONSULTANT') {
                const profile = await prisma.consultantProfile.findUnique({ where: { userId: user.id } });
                if (profile) name = profile.name;
            }

            await sendEventRegistrationEmail(user.email, name, eventName, eventDate);
        }

        // Send SMS Reminder
        if (user.mobile) {
            await sendEventReminderSMS(user.mobile, eventName, eventDate);
        }

        // Create Notification
        await prisma.notification.create({
            data: {
                userId: user.id,
                title: "Event Registration Confirmed",
                message: `You have successfully registered for ${eventName} happening on ${eventDate}.`,
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "EVENT_REGISTRATION",
                details: `Registered for event: ${eventName} (${eventId})`,
            }
        });

        revalidatePath("/vendor/dashboard");
        revalidatePath("/oem/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Event Registration Error:", error);
        return { error: "Failed to register for event" };
    }
}
