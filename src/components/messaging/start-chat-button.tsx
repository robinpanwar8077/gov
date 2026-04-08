
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { startConversation } from "@/lib/actions/messages";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface StartChatButtonProps {
    otherUserId: string;
    targetName: string;
    buttonText?: string;
    variant?: "default" | "outline" | "ghost";
    className?: string;
}

export function StartChatButton({ otherUserId, targetName, buttonText = "Message", variant = "default", className }: StartChatButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleStart() {
        setIsLoading(true);
        try {
            const conversation = await startConversation(otherUserId, message);
            setIsOpen(false);
            router.push("/vendor/messages");
        } catch (error) {
            console.error("Failed to start conversation:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} className={className}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-widest text-slate-900">Message {targetName}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="Write your initial message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px] border-2 focus-visible:ring-indigo-600 transition-all font-medium"
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest w-full"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                        Send Message
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
