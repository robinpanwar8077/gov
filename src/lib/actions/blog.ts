"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";

const BlogPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    published: z.boolean().optional(),
    publishedAt: z.union([z.string(), z.date()]).optional().transform((val) => {
        if (!val) return null;
        return new Date(val);
    }),
    slug: z.string().optional(), // Can be auto-generated
    coverImage: z.string().optional(),
    excerpt: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
    newTags: z.array(z.string()).optional(), // Helper to create/link tags by name
});

export type BlogPostInput = z.infer<typeof BlogPostSchema>;

export async function getBlogPosts(page: number = 1, limit: number = 10, search?: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        const query: any = {};
        if (search) {
            query.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where: query,
                orderBy: { publishedAt: 'desc' }, // Order by publishedAt or createdAt
                skip: (page - 1) * limit,
                take: limit,
                include: { categories: true, tags: true }
            }),
            prisma.blogPost.count({ where: query }),
        ]);

        return { success: true, posts, total, totalPages: Math.ceil(total / limit) };

    } catch (error) {
        console.error("Get Blog Posts Error:", error);
        return { error: "Failed to fetch blog posts" };
    }
}

export async function getPublishedBlogPosts(page: number = 1, limit: number = 12, filter?: { category?: string, search?: string }) {
    try {
        const query: any = {
            published: true,
            AND: [
                {
                    OR: [
                        { publishedAt: { lte: new Date() } },
                        { publishedAt: null }
                    ]
                }
            ]
        };

        if (filter?.category) {
            query.AND.push({
                categories: {
                    some: {
                        slug: filter.category
                    }
                }
            });
        }

        if (filter?.search) {
            query.AND.push({
                OR: [
                    { title: { contains: filter.search, mode: 'insensitive' } },
                    { content: { contains: filter.search, mode: 'insensitive' } },
                    { excerpt: { contains: filter.search, mode: 'insensitive' } },
                ]
            });
        }

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where: query,
                orderBy: { publishedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { categories: true, tags: true }
            }),
            prisma.blogPost.count({ where: query }),
        ]);

        return { success: true, posts, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error("Get Published Blog Posts Error:", error);
        return { error: "Failed to fetch blog posts" };
    }
}

export async function getBlogPost(id: string) {
    const session = await getSession();
    // Allow public access? Ideally yes, but this function might be used in admin editing context.
    // Assuming this is for admin edit mainly, or public view if we remove session check.
    // For now, let's keep it open or check session for edit logic.
    // If it's for `edit`, we need ID. If public view, we use slug usually.

    try {
        const post = await prisma.blogPost.findUnique({
            where: { id },
            include: { categories: true, tags: true }
        });

        if (!post) return { error: "Post not found" };

        return { success: true, post };
    } catch (error) {
        console.error("Get Blog Post Error:", error);
        return { error: "Failed to fetch blog post" };
    }
}

export async function getBlogPostBySlug(slug: string) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug },
            include: { categories: true, tags: true }
        });

        if (!post) return { error: "Post not found" };

        // Even though we fetch by slug (public view mostly), check published status inside component or here?
        // Usually `getBlogPostBySlug` is for public view, so we should filter unpublished if not admin.
        // But for simplicity, we return the post and let the component decide (e.g. preview mode).
        // However, standard specifiction says: "only reviewed posts are visible".
        // Let's modify component to check, which it already does.

        return { success: true, post };
    } catch (error) {
        console.error("Get Blog Post By Slug Error:", error);
        return { error: "Failed to fetch blog post" };
    }
}


export async function createBlogPost(data: BlogPostInput) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    const validation = BlogPostSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }

    const { title, content, published, publishedAt, coverImage, excerpt, categoryIds, newTags } = validation.data;
    let slug = validation.data.slug;

    if (!slug) {
        slug = slugify(title, { lower: true, strict: true });
    }

    // Ensure unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    try {
        // Handle Tags: Find existing or create new
        let tagConnect: { id: string }[] = [];
        if (newTags && newTags.length > 0) {
            for (const tagName of newTags) {
                const tagSlug = slugify(tagName, { lower: true, strict: true });
                const tag = await prisma.blogTag.upsert({
                    where: { slug: tagSlug },
                    update: {},
                    create: { name: tagName, slug: tagSlug }
                });
                tagConnect.push({ id: tag.id });
            }
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                content,
                slug: uniqueSlug,
                published: published || false,
                publishedAt: publishedAt || (published ? new Date() : null), // Default to now if published is true
                coverImage,
                excerpt,
                authorId: session.id as string,
                categories: categoryIds ? {
                    connect: categoryIds.map(id => ({ id }))
                } : undefined,
                tags: {
                    connect: tagConnect
                }
            },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "CREATE_BLOG_POST",
            details: `Created: ${title}`,
        });

        revalidatePath("/admin/cms");
        revalidatePath("/blog");
        return { success: true, post };

    } catch (error) {
        console.error("Create Blog Post Error:", error);
        return { error: "Failed to create blog post" };
    }
}

export async function updateBlogPost(id: string, data: BlogPostInput) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    const validation = BlogPostSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }

    const { title, content, published, publishedAt, slug, coverImage, excerpt, categoryIds, newTags } = validation.data;

    try {
        let updateData: any = {
            title, content, published, publishedAt, coverImage, excerpt
        };

        if (slug) {
            const existingSlug = await prisma.blogPost.findFirst({
                where: {
                    slug,
                    NOT: { id }
                }
            });
            if (existingSlug) {
                return { error: "Slug is already taken" };
            }
            updateData.slug = slug;
        }

        // Handle Tags
        let tagConnect: { id: string }[] = [];
        if (newTags) {
            for (const tagName of newTags) {
                const tagSlug = slugify(tagName, { lower: true, strict: true });
                const tag = await prisma.blogTag.upsert({
                    where: { slug: tagSlug },
                    update: {},
                    create: { name: tagName, slug: tagSlug }
                });
                tagConnect.push({ id: tag.id });
            }
        }

        const existingPost = await prisma.blogPost.findUnique({ where: { id } });
        if (!existingPost) return { error: "Post not found" };

        const post = await prisma.blogPost.update({
            where: { id },
            data: {
                ...updateData,
                publishedAt: publishedAt || (published ? (existingPost.publishedAt || new Date()) : null),
                categories: categoryIds ? {
                    set: categoryIds.map(id => ({ id }))
                } : undefined,
                tags: newTags ? {
                    set: tagConnect
                } : undefined
            },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "UPDATE_BLOG_POST",
            details: `Updated: ${title}`,
        });

        revalidatePath("/admin/cms");
        revalidatePath(`/blog/${post.slug}`);
        return { success: true, post };

    } catch (error) {
        console.error("Update Blog Post Error:", error);
        return { error: "Failed to update blog post" };
    }
}
export async function deleteBlogPost(id: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        const post = await prisma.blogPost.delete({
            where: { id },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "DELETE_BLOG_POST",
            details: `Deleted: ${post.title}`,
        });

        revalidatePath("/admin/cms");
        return { success: true };

    } catch (error) {
        console.error("Delete Blog Post Error:", error);
        return { error: "Failed to delete blog post" };
    }
}

export async function toggleBlogPostPublish(id: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        const post = await prisma.blogPost.findUnique({ where: { id } });
        if (!post) return { error: "Post not found" };

        const newPublished = !post.published;
        const updatedPost = await prisma.blogPost.update({
            where: { id },
            data: {
                published: newPublished,
                publishedAt: newPublished ? (post.publishedAt || new Date()) : post.publishedAt
            }
        });

        await createAuditLog({
            userId: session.id as string,
            action: newPublished ? "PUBLISHED_BLOG_POST" : "UNPUBLISHED_BLOG_POST",
            details: `${newPublished ? 'Published' : 'Unpublished'}: ${post.title}`,
        });

        revalidatePath("/admin/cms");
        revalidatePath("/blog");
        revalidatePath(`/blog/${post.slug}`);

        return { success: true, published: newPublished };
    } catch (error) {
        console.error("Toggle Publish Error:", error);
        return { error: "Failed to update publish status" };
    }
}

// ----- Category Actions -----

export async function getBlogCategories() {
    try {
        const categories = await prisma.blogCategory.findMany({
            orderBy: { name: 'asc' }
        });
        return { success: true, categories };
    } catch (error) {
        return { error: "Failed to fetch categories" };
    }
}

export async function createBlogCategory(name: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    const slug = slugify(name, { lower: true, strict: true });

    try {
        const category = await prisma.blogCategory.create({
            data: { name, slug }
        });
        return { success: true, category };
    } catch (error) {
        return { error: "Failed to create category or already exists" };
    }
}

export async function incrementBlogPostViews(id: string) {
    try {
        await prisma.blogPost.update({
            where: { id },
            data: { views: { increment: 1 } }
        });
        return { success: true };
    } catch (error) {
        console.error("Increment Views Error:", error);
        return { error: "Failed to increment views" };
    }
}
