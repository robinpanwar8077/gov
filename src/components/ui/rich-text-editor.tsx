"use client";

import { cn } from "@/lib/utils";
import { Bold, Italic, Link, List, ListOrdered } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const handleFormat = (format: string) => {
        const textarea = document.getElementById("rich-text-area") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        let newText = text;
        let insertionLength = 0;

        switch (format) {
            case "bold":
                newText = text.substring(0, start) + "**" + text.substring(start, end) + "**" + text.substring(end);
                insertionLength = 2; // Move cursor by 2
                break;
            case "italic":
                newText = text.substring(0, start) + "*" + text.substring(start, end) + "*" + text.substring(end);
                insertionLength = 1;
                break;
            case "list":
                newText = text.substring(0, start) + "- " + text.substring(start, end) + text.substring(end);
                insertionLength = 2;
                break;
            case "ordered-list":
                newText = text.substring(0, start) + "1. " + text.substring(start, end) + text.substring(end);
                insertionLength = 3;
                break;
            case "link":
                newText = text.substring(0, start) + "[" + text.substring(start, end) + "](url)" + text.substring(end);
                insertionLength = 1;
                break;
        }

        onChange(newText);

        // Restore cursor and focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + insertionLength, end + insertionLength);
        }, 0);
    };

    return (
        <div className={cn("border rounded-md", className)}>
            <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormat("bold")}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormat("italic")}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormat("list")}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormat("ordered-list")}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleFormat("link")}
                >
                    <Link className="h-4 w-4" />
                </Button>
            </div>
            <Textarea
                id="rich-text-area"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[300px] border-0 focus-visible:ring-0 rounded-none resize-y p-4 font-mono text-sm leading-relaxed"
            />
            <div className="p-2 text-xs text-muted-foreground bg-muted/20 border-t flex justify-between">
                <span>Markdown supported</span>
                <span>{value.length} characters</span>
            </div>
        </div>
    );
}
