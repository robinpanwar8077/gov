"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createResource, updateResource } from "@/lib/actions/resource";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ResourceType } from "@prisma/client";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().optional(),
    description: z.string().optional(),
    type: z.nativeEnum(ResourceType),
    fileUrl: z.string().url("Valid URL is required").or(z.literal("")).optional(),
    content: z.string().optional(),
    topic: z.string().optional(),
    audience: z.string().optional(),
    published: z.boolean().optional(),
});

interface ResourceFormProps {
    initialData?: any;
}

export function ResourceForm({ initialData }: ResourceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            type: initialData?.type || ResourceType.GUIDE,
            fileUrl: initialData?.fileUrl || "",
            content: initialData?.content || "",
            topic: initialData?.topic || "",
            audience: initialData?.audience || "",
            published: initialData?.published || false,
        },
    });

    const isPublished = form.watch("published");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError("");

        try {
            if (initialData) {
                const res = await updateResource(initialData.id, values);
                if (res.error) {
                    setError(res.error);
                } else {
                    router.push("/admin/cms?tab=resources");
                    router.refresh();
                }
            } else {
                const res = await createResource(values);
                if (res.error) {
                    setError(res.error);
                } else {
                    router.push("/admin/cms?tab=resources");
                    router.refresh();
                }
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium border border-destructive/20">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex justify-between items-center text-base font-semibold">
                                            Resource Title <span className="text-destructive text-xs">* Mandatory</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., GeM Vendor Onboarding Guide" {...field} className="h-12 text-lg" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Resource Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={ResourceType.GUIDE}>Guide</SelectItem>
                                                    <SelectItem value={ResourceType.CASE_STUDY}>Case Study</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="topic"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Topic / Category</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Onboarding, Compliance" {...field} className="h-11" />
                                            </FormControl>
                                            <FormDescription>Categorize this resource for easy search.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Brief Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Summary of what this guide/case study covers..."
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Detailed Content (Optional)</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder="If this is a long-form text guide, write it here... (Markdown supported)"
                                            />
                                        </FormControl>
                                        <FormDescription>Can be left empty if you are only providing a file link.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-6">
                            <h3 className="font-bold text-lg border-b pb-2">Publishing & Metadata</h3>

                            <FormField
                                control={form.control}
                                name="published"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-semibold cursor-pointer">
                                                Publicly Visible
                                            </FormLabel>
                                            <p className="text-xs text-muted-foreground">
                                                Drafts are only seen by admins.
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fileUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Document URL (PDF/Doc)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://storage.com/file.pdf" {...field} className="h-10" />
                                        </FormControl>
                                        <FormDescription>Link to the downloadable resource.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="audience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Target Audience</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., All, Vendors, OEMs" {...field} className="h-10" />
                                        </FormControl>
                                        <FormDescription>Who is this resource for?</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-muted-foreground">Custom Slug (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="auto-generated-if-empty" {...field} className="h-10 text-sm" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-3 pt-4 border-t">
                                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        initialData ? "Update Resource" : (isPublished ? "Publish Resource" : "Save as Draft")
                                    )}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" onClick={() => router.back()} disabled={loading}>
                                    Cancel
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-sm text-blue-900 shadow-sm">
                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">i</span> Admin Note
                            </h4>
                            <p className="leading-relaxed opacity-90 italic">
                                Resources published here will trigger a notification to the target audience. Ensure all links are accessible before publishing.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
