
import { getSession } from "@/lib/auth";
import { getConversations } from "@/lib/actions/messages";
import { MessagesPageWrapper } from "@/components/messaging/messages-wrapper";
import { redirect } from "next/navigation";
import { Role } from "@/lib/types";

export default async function ConsultantMessagesPage() {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        redirect("/login");
    }

    const conversations = await getConversations();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Consultation Desk</h1>
                <p className="text-lg font-medium text-slate-600 italic">Manage vendor inquiries and provide expert guidance.</p>
            </div>

            <MessagesPageWrapper
                initialConversations={conversations as any}
                currentUserId={session.id as string}
            />
        </div>
    );
}
