"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";
import { ResourceType } from "@prisma/client";

const ResourceSchema = z.object({
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

export type ResourceInput = z.infer<typeof ResourceSchema>;

export async function getResources(page: number = 1, limit: number = 10, search?: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        const query: any = {};
        if (search) {
            query.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { topic: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [resources, total] = await Promise.all([
            prisma.resource.findMany({
                where: query,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.resource.count({ where: query }),
        ]);

        return { success: true, resources, total, totalPages: Math.ceil(total / limit) };

    } catch (error) {
        console.error("Get Resources Error:", error);
        return { error: "Failed to fetch resources" };
    }
}

export async function getPublishedResources(page: number = 1, limit: number = 12, filter?: { type?: ResourceType, topic?: string, search?: string }) {
    try {
        const query: any = { published: true };

        if (filter?.type) query.type = filter.type;
        if (filter?.topic) query.topic = filter.topic;
        if (filter?.search) {
            query.OR = [
                { title: { contains: filter.search, mode: 'insensitive' } },
                { description: { contains: filter.search, mode: 'insensitive' } },
                { topic: { contains: filter.search, mode: 'insensitive' } },
            ];
        }

        const [resources, total] = await Promise.all([
            prisma.resource.findMany({
                where: query,
                orderBy: { publishedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.resource.count({ where: query }),
        ]);

        return { success: true, resources, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error("Get Published Resources Error:", error);
        return { error: "Failed to fetch resources" };
    }
}

export async function getResource(id: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource) return { error: "Resource not found" };

        return { success: true, resource };
    } catch (error) {
        console.error("Get Resource Error:", error);
        return { error: "Failed to fetch resource" };
    }
}

export async function getPublishedResourceBySlug(slug: string) {
    try {
        const resource = await prisma.resource.findUnique({
            where: { slug, published: true },
        });

        if (!resource) return { error: "Resource not found" };

        return { success: true, resource };
    } catch (error) {
        console.error("Get Published Resource Error:", error);
        return { error: "Failed to fetch resource" };
    }
}

export async function getResourceTopics() {
    try {
        const topics = await prisma.resource.findMany({
            where: { published: true },
            select: { topic: true },
            distinct: ['topic'],
        });

        return { success: true, topics: topics.map(t => t.topic).filter(Boolean) as string[] };
    } catch (error) {
        return { error: "Failed to fetch topics" };
    }
}

export async function createResource(data: ResourceInput) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    const validation = ResourceSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }

    const { title, description, type, fileUrl, content, topic, audience, published } = validation.data;
    let slug = validation.data.slug;

    if (!slug) {
        slug = slugify(title, { lower: true, strict: true });
    }

    // Ensure unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.resource.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    try {
        const resource = await prisma.resource.create({
            data: {
                title,
                slug: uniqueSlug,
                description,
                type,
                fileUrl,
                content,
                topic,
                audience,
                published: published || false,
                publishedAt: published ? new Date() : null,
                authorId: session.id as string,
            },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "CREATE_RESOURCE",
            details: `Created Resource: ${title} (${type})`,
        });

        if (published) {
            // Notify relevant users (e.g., all users or specific roles)
            // For now, let's notify all users but this should be optimized
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { role: 'VENDOR' },
                        { role: 'OEM' },
                        { role: 'CONSULTANT' }
                    ]
                },
                select: { id: true }
            });

            await prisma.notification.createMany({
                data: users.map(user => ({
                    userId: user.id,
                    title: `New Resource: ${title}`,
                    message: `A new ${type.toLowerCase().replace('_', ' ')} has been published: ${title}`,
                    link: `/resources/${uniqueSlug}`,
                }))
            });
        }

        revalidatePath("/admin/cms");
        revalidatePath("/resources");
        return { success: true, resource };

    } catch (error) {
        console.error("Create Resource Error:", error);
        return { error: "Failed to create resource" };
    }
}

export async function updateResource(id: string, data: ResourceInput) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    const validation = ResourceSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }

    const { title, description, type, fileUrl, content, topic, audience, published } = validation.data;
    const slug = validation.data.slug;

    try {
        const existingResource = await prisma.resource.findUnique({ where: { id } });
        if (!existingResource) return { error: "Resource not found" };

        let updateData: any = {
            title, description, type, fileUrl, content, topic, audience, published
        };

        if (slug && slug !== existingResource.slug) {
            const slugExists = await prisma.resource.findUnique({ where: { slug } });
            if (slugExists) return { error: "Slug already exists" };
            updateData.slug = slug;
        }

        const resource = await prisma.resource.update({
            where: { id },
            data: {
                ...updateData,
                publishedAt: published && !existingResource.published ? new Date() : existingResource.publishedAt,
            },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "UPDATE_RESOURCE",
            details: `Updated Resource: ${title}`,
        });

        revalidatePath("/admin/cms");
        revalidatePath(`/resources/${resource.slug}`);
        return { success: true, resource };

    } catch (error) {
        console.error("Update Resource Error:", error);
        return { error: "Failed to update resource" };
    }
}

export async function deleteResource(id: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        const resource = await prisma.resource.delete({
            where: { id },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "DELETE_RESOURCE",
            details: `Deleted Resource: ${resource.title}`,
        });

        revalidatePath("/admin/cms");
        revalidatePath("/resources");
        return { success: true };

    } catch (error) {
        console.error("Delete Resource Error:", error);
        return { error: "Failed to delete resource" };
    }
}

export async function toggleResourcePublish(id: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        const resource = await prisma.resource.findUnique({ where: { id } });
        if (!resource) return { error: "Resource not found" };

        const newPublished = !resource.published;
        const updatedResource = await prisma.resource.update({
            where: { id },
            data: {
                published: newPublished,
                publishedAt: newPublished ? (resource.publishedAt || new Date()) : resource.publishedAt
            }
        });

        await createAuditLog({
            userId: session.id as string,
            action: newPublished ? "PUBLISHED_RESOURCE" : "UNPUBLISHED_RESOURCE",
            details: `${newPublished ? 'Published' : 'Unpublished'}: ${resource.title}`,
        });

        revalidatePath("/admin/cms");
        revalidatePath("/resources");
        revalidatePath(`/resources/${resource.slug}`);

        return { success: true, published: newPublished };
    } catch (error) {
        console.error("Toggle Publish Error:", error);
        return { error: "Failed to update publish status" };
    }
}

export async function incrementResourceViews(id: string) {
    try {
        await prisma.resource.update({
            where: { id },
            data: { views: { increment: 1 } }
        });
        return { success: true };
    } catch (error) {
        return { error: "Failed to increment views" };
    }
}

export async function incrementResourceDownloads(id: string) {
    try {
        await prisma.resource.update({
            where: { id },
            data: { downloads: { increment: 1 } }
        });
        return { success: true };
    } catch (error) {
        return { error: "Failed to increment downloads" };
    }
}
