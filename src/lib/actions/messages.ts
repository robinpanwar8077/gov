
"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getConversations() {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    id: session.id as string
                }
            }
        },
        include: {
            participants: {
                select: {
                    id: true,
                    email: true,
                    oemProfile: { select: { companyName: true } },
                    vendorProfile: { select: { companyName: true } },
                    consultantProfile: { select: { name: true } }
                }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: {
            lastMessageAt: 'desc'
        }
    });

    return await Promise.all(conversations.map(async c => {
        const otherParticipant = c.participants.find(p => p.id !== session.id);
        const name = otherParticipant?.oemProfile?.companyName ||
            otherParticipant?.vendorProfile?.companyName ||
            otherParticipant?.consultantProfile?.name ||
            otherParticipant?.email || "Unknown User";

        const unreadCount = await prisma.message.count({
            where: {
                conversationId: c.id,
                senderId: { not: session.id as string },
                isRead: false
            }
        });

        return {
            ...c,
            otherParticipantName: name,
            lastMessage: c.messages[0],
            unreadCount
        };
    }));
}

export async function getMessages(conversationId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Check if user is participant
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: {
                some: { id: session.id as string }
            }
        }
    });

    if (!conversation) throw new Error("Conversation not found");

    return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: {
            sender: {
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            }
        }
    });
}

export async function sendMessage(conversationId: string, content: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    if (!content.trim()) throw new Error("Message cannot be empty");

    const message = await prisma.message.create({
        data: {
            conversationId,
            senderId: session.id as string,
            content: content.trim()
        }
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
    });

    // Audit Log
    await prisma.auditLog.create({
        data: {
            userId: session.id as string,
            action: "MESSAGE_SENT",
            details: `Sent message in conversation ${conversationId}`,
        }
    });

    revalidatePath("/vendor/messages");
    revalidatePath("/oem/messages");
    revalidatePath("/consultant/messages");
    return message;
}

export async function startConversation(otherUserId: string, initialMessage?: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    if (otherUserId === session.id) throw new Error("You cannot message yourself");

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { id: session.id as string } } },
                { participants: { some: { id: otherUserId } } }
            ]
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [
                        { id: session.id as string },
                        { id: otherUserId }
                    ]
                }
            }
        });

        // Audit Log for new conversation
        await prisma.auditLog.create({
            data: {
                userId: session.id as string,
                action: "CONVERSATION_STARTED",
                details: `Started conversation with user ${otherUserId}`,
            }
        });
    }

    if (initialMessage?.trim()) {
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: session.id as string,
                content: initialMessage.trim()
            }
        });

        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
        });
    }

    revalidatePath("/vendor/messages");
    revalidatePath("/oem/messages");
    revalidatePath("/consultant/messages");
    return conversation;
}

export async function markMessagesAsRead(conversationId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    await prisma.message.updateMany({
        where: {
            conversationId,
            senderId: { not: session.id as string },
            isRead: false
        },
        data: { isRead: true }
    });

    revalidatePath("/vendor/messages");
    revalidatePath("/oem/messages");
    revalidatePath("/consultant/messages");
    return { success: true };
}

export async function getUnreadCount() {
    const session = await getSession();
    if (!session) return 0;

    const count = await prisma.message.count({
        where: {
            conversation: {
                participants: {
                    some: { id: session.id as string }
                }
            },
            senderId: { not: session.id as string },
            isRead: false
        }
    });

    return count;
}
