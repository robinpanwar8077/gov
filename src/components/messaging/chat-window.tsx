
"use client";

import { useState, useEffect, useRef } from "react";
import { Message, User } from "@/lib/types";
import { sendMessage, getMessages, markMessagesAsRead } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Send, Loader2, Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";

interface ChatWindowProps {
// ... existing interface ...
// (Note: Skipping re-writing the whole interface as per replacement rules, assuming TargetContent matches carefully)
    conversationId: string;
    currentUserId: string;
    otherParticipantName: string;
}

export function ChatWindow({ conversationId, currentUserId, otherParticipantName }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        loadMessages();
        // Polling for new messages every 5 seconds
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        if (scrollRef.current && !searchQuery) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, searchQuery]);

    const matches = searchQuery.trim()
        ? messages.reduce((acc: number[], m, idx) => {
            if (m.content.toLowerCase().includes(searchQuery.toLowerCase())) {
                acc.push(idx);
            }
            return acc;
        }, [])
        : [];

    useEffect(() => {
        if (matches.length > 0) {
            setCurrentMatchIndex(matches.length - 1); // Start with most recent match
        } else {
            setCurrentMatchIndex(-1);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (currentMatchIndex !== -1 && matches[currentMatchIndex] !== undefined) {
            const messageIndex = matches[currentMatchIndex];
            const messageId = messages[messageIndex]?.id;
            const element = messageRefs.current[messageId];
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [currentMatchIndex]);

    async function loadMessages() {
        try {
            const data = await getMessages(conversationId);
            setMessages(data as any);

            // Check if there are unread messages from other user
            const hasUnread = data.some(m => !m.isRead && m.senderId !== currentUserId);
            if (hasUnread) {
                await markMessagesAsRead(conversationId);
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
            // toast.error("Could not load latest messages."); // Optional, maybe too noisy for polling
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const msg = await sendMessage(conversationId, newMessage);
            setMessages([...messages, msg as any]);
            setNewMessage("");
            setSearchQuery(""); // Clear search when sending new message
            setIsSearchOpen(false);
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Message could not be sent. Please try again.");
        } finally {
            setIsSending(false);
        }
    }

    const goToNextMatch = () => {
        if (matches.length === 0) return;
        setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
    };

    const goToPrevMatch = () => {
        if (matches.length === 0) return;
        setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex flex-col">
                    <h3 className="font-bold text-slate-900">{otherParticipantName}</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Direct Discussion</p>
                </div>
                <div className="flex items-center gap-2">
                    {isSearchOpen ? (
                        <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200 bg-slate-100 p-1 rounded-lg">
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Find..."
                                className="h-8 w-32 text-xs border-none bg-transparent focus-visible:ring-0"
                                autoFocus
                            />
                            {searchQuery && (
                                <div className="flex items-center gap-1 px-2 border-l border-slate-300">
                                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                        {matches.length > 0 ? `${currentMatchIndex + 1} of ${matches.length}` : "0 of 0"}
                                    </span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white" onClick={goToPrevMatch} disabled={matches.length === 0}>
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white" onClick={goToNextMatch} disabled={matches.length === 0}>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-red-600" onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50/50 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">No messages yet</p>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Start the conversation below.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = msg.senderId === currentUserId;
                        const isMatch = searchQuery && msg.content.toLowerCase().includes(searchQuery.toLowerCase());
                        const isActiveMatch = matches[currentMatchIndex] === idx;

                        return (
                            <div
                                key={msg.id}
                                ref={(el) => { messageRefs.current[msg.id] = el; }}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[80%] space-y-1`}>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm transition-all duration-300 ${isMine
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-white border text-slate-800 rounded-tl-none"
                                        } ${isActiveMatch ? "ring-4 ring-yellow-400 scale-105" : ""} ${isMatch && !isActiveMatch ? "ring-2 ring-yellow-200" : ""}`}>
                                        {msg.content}
                                    </div>
                                    <div className={`flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
                                        <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-tighter`}>
                                            {format(new Date(msg.createdAt), "HH:mm")}
                                        </p>
                                        {isMine && (
                                            <p className={`text-[8px] font-black uppercase ${msg.isRead ? "text-indigo-600" : "text-slate-300"}`}>
                                                {msg.isRead ? "Seen" : "Sent"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border-2 focus-visible:ring-indigo-600 font-medium"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest shadow-lg shadow-indigo-200"
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
