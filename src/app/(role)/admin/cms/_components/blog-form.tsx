
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
import { createBlogPost, updateBlogPost } from "@/lib/actions/blog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().optional(),
    content: z.string().min(1, "Content is required"),
    published: z.boolean().optional(),
    publishedAt: z.string().optional(),
    coverImage: z.string().optional(),
    excerpt: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
    newTags: z.array(z.string()).optional(),
});

interface BlogFormProps {
    initialData?: any;
    categories?: { id: string; name: string }[];
}

export function BlogForm({ initialData, categories = [] }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tagInput, setTagInput] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            content: initialData?.content || "",
            published: initialData?.published || false,
            publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().slice(0, 16) : "",
            coverImage: initialData?.coverImage || "",
            excerpt: initialData?.excerpt || "",
            categoryIds: initialData?.categories?.map((c: any) => c.id) || [],
            newTags: initialData?.tags?.map((t: any) => t.name) || [],
        },
    });

    const currentTags = form.watch("newTags") || [];
    const isPublished = form.watch("published");

    const addTag = () => {
        if (!tagInput.trim()) return;
        if (currentTags.includes(tagInput.trim())) {
            setTagInput("");
            return;
        }
        form.setValue("newTags", [...currentTags, tagInput.trim()]);
        setTagInput("");
    };

    const removeTag = (tagToRemove: string) => {
        form.setValue("newTags", currentTags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError("");

        // Transform publishedAt string to Date or null effectively handled by action zod transformer if passed as string
        const submissionData = {
            ...values,
            publishedAt: values.publishedAt ? new Date(values.publishedAt) : null
        };

        try {
            if (initialData) {
                const res = await updateBlogPost(initialData.id, submissionData);
                if (res.error) {
                    setError(res.error);
                } else {
                    router.push("/admin/cms");
                    router.refresh();
                }
            } else {
                const res = await createBlogPost(submissionData);
                if (res.error) {
                    setError(res.error);
                } else {
                    router.push("/admin/cms");
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
                {error && <div className="text-destructive text-sm font-medium">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card p-6 rounded-lg border space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter blog post title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="custom-url-slug (optional)" {...field} />
                                        </FormControl>
                                        <FormDescription>Leave empty to auto-generate from title.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Write your post content here... (Markdown supported)"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="excerpt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Excerpt</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Short summary of the post..." {...field} />
                                        </FormControl>
                                        <FormDescription>Shown in blog lists and SEO meta descriptions.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        <div className="bg-card p-6 rounded-lg border space-y-6">
                            <h3 className="font-semibold text-lg">Publish</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="published"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Publish status
                                                </FormLabel>
                                                <FormDescription>
                                                    {field.value ? "Visible to the public (depending on date)" : "Draft - only visible to admins"}
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="publishedAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Publish Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Leave empty to publish immediately (if Published is checked).
                                                Set a future date to schedule.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {initialData ? "Update" : (isPublished ? "Publish" : "Save Draft")}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-lg border space-y-6">
                            <h3 className="font-semibold text-lg">Featured Image</h3>
                            <FormField
                                control={form.control}
                                name="coverImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Image URL (https://...)" {...field} />
                                        </FormControl>
                                        <FormDescription>Provide a URL for the cover image.</FormDescription>
                                        {field.value && (
                                            <div className="mt-2 relative w-full h-40 rounded-md overflow-hidden border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-card p-6 rounded-lg border space-y-6">
                            <h3 className="font-semibold text-lg">Categories</h3>
                            <FormField
                                control={form.control}
                                name="categoryIds"
                                render={() => (
                                    <FormItem>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {categories.map((category) => (
                                                <FormField
                                                    key={category.id}
                                                    control={form.control}
                                                    name="categoryIds"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={category.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(category.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), category.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== category.id
                                                                                    )
                                                                                );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {category.name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                            {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories found.</p>}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-card p-6 rounded-lg border space-y-6">
                            <h3 className="font-semibold text-lg">Tags</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add tag and press Enter"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <Button type="button" size="icon" onClick={addTag} variant="secondary">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentTags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </Form>
    );
}
