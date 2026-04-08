
import { getSession } from "@/lib/auth";
import { getConversations } from "@/lib/actions/messages";
import { MessagesPageWrapper } from "@/components/messaging/messages-wrapper";
import { redirect } from "next/navigation";
import { Role } from "@/lib/types";

export default async function OEMMessagesPage() {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        redirect("/login");
    }

    const conversations = await getConversations();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Vendor Communications</h1>
                <p className="text-lg font-medium text-slate-600 italic">Manage inquiries and support your dealer network.</p>
            </div>

            <MessagesPageWrapper
                initialConversations={conversations as any}
                currentUserId={session.id as string}
            />
        </div>
    );
}
