
"use client";

import { useState } from "react";
import { Conversation } from "@/lib/types";
import { ChatWindow } from "./chat-window";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MessagesPageWrapperProps {
    initialConversations: Conversation[];
    currentUserId: string;
}

export function MessagesPageWrapper({ initialConversations, currentUserId }: MessagesPageWrapperProps) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedConversation = conversations.find(c => c.id === selectedId);

    const filteredConversations = conversations.filter(c =>
        c.otherParticipantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
            <div className="border-2 border-slate-900 rounded-2xl flex h-full overflow-hidden shadow-2xl bg-white">
                {/* Sidebar */}
                <div className="w-80 border-r-2 border-slate-900 bg-slate-50 flex flex-col">
                    <div className="p-4 border-b-2 border-slate-900 bg-white">
                        <h3 className="font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Conversations
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search namesake..."
                                className="pl-9 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {filteredConversations.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No chats found</p>
                            </div>
                        ) : (
                            filteredConversations.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => setSelectedId(c.id)}
                                    className={`p-4 cursor-pointer transition-all hover:bg-white group ${selectedId === c.id ? "bg-white border-l-4 border-l-indigo-600 shadow-inner" : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-black text-slate-900 truncate pr-2 group-hover:text-indigo-600 transition-colors">
                                            {c.otherParticipantName}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-400 whitespace-nowrap uppercase">
                                            {format(new Date(c.lastMessageAt), "MMM d")}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-slate-500 font-medium truncate flex-1">
                                            {c.lastMessage?.content || "No messages yet"}
                                        </p>
                                        {(c.unreadCount ?? 0) > 0 && (
                                            <Badge className="ml-2 bg-red-600 text-white border-none h-4 min-w-4 flex items-center justify-center p-1 text-[8px] font-black">
                                                {c.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50">
                    {selectedConversation ? (
                        <ChatWindow
                            conversationId={selectedConversation.id}
                            currentUserId={currentUserId}
                            otherParticipantName={selectedConversation.otherParticipantName || "Chat"}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 opacity-50">
                                <MessageSquare className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Select a Conversation</h3>
                            <p className="text-slate-500 font-medium mt-2 max-w-xs">
                                Pick a chat from the sidebar to continue your discussion with OEMs or Consultants.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
