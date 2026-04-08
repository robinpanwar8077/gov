import { BlogForm } from "../_components/blog-form";
import { ResourceForm } from "../_components/resource-form";
import { getBlogPost, getBlogCategories } from "@/lib/actions/blog";
import { getResource } from "@/lib/actions/resource";
import { notFound } from "next/navigation";

export default async function EditCMSPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ type?: string }>
}) {
    const { id } = await params;
    const { type } = await searchParams;
    const isResource = type === 'resource';

    if (isResource) {
        const { resource, error } = await getResource(id);
        if (!resource || error) notFound();

        return (
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">Edit GeM Resource</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Update the guide or case study information.</p>
                </div>
                <ResourceForm initialData={resource} />
            </div>
        );
    }

    const [{ post }, { categories }] = await Promise.all([
        getBlogPost(id),
        getBlogCategories()
    ]);

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Edit Blog Post</h1>
                <p className="text-muted-foreground mt-2 text-lg">Update content and settings for this article.</p>
            </div>
            <BlogForm initialData={post} categories={categories} />
        </div>
    );
}
