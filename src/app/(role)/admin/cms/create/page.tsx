import { BlogForm } from "../_components/blog-form";
import { ResourceForm } from "../_components/resource-form";
import { getBlogCategories } from "@/lib/actions/blog";

export default async function CreateCMSPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const { type } = await searchParams;
    const isResource = type === 'resource';
    const { categories } = await getBlogCategories();

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">
                    {isResource ? "Create GeM Resource" : "Create New Blog Post"}
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    {isResource
                        ? "Upload guides, case studies, and reference documents for GeM users."
                        : "Create a new article to educate and attract users."
                    }
                </p>
            </div>

            {isResource ? (
                <ResourceForm />
            ) : (
                <BlogForm categories={categories} />
            )}
        </div>
    );
}
