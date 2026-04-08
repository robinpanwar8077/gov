"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Role, KYCDocStatus, FormState } from "@/lib/types";
import { createAuditLog } from "@/lib/audit";
import { generateSlug } from "@/lib/slug";
import { uploadFile } from "@/lib/storage";

export async function updateConsultantProfile(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        return { error: "Unauthorized" };
    }

    const userId = session.id as string;

    const name = formData.get("name") as string;
    const firmName = formData.get("firmName") as string;
    const bio = formData.get("bio") as string;
    const experienceStr = formData.get("experience") as string;
    const experience = experienceStr ? parseInt(experienceStr) : null;
    const keyServices = formData.get("keyServices") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const officeAddress = formData.get("officeAddress") as string;
    const categoryIds = formData.getAll("categories") as string[];

    if (!name) return { error: "Name is required" };
    if (!contactEmail) return { error: "Contact Email is required" };
    if (!contactPhone) return { error: "Contact Phone is required" };
    if (categoryIds.length === 0) return { error: "Please select at least one consulting category." };

    try {
        const slug = generateSlug(name);

        await prisma.consultantProfile.update({
            where: { userId },
            data: {
                name,
                firmName,
                slug,
                bio,
                experience,
                keyServices,
                contactEmail,
                contactPhone,
                officeAddress,
                categories: {
                    set: categoryIds.map(id => ({ id }))
                }
            },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "UPDATE_CONSULTANT_PROFILE",
            details: `Updated consultant profile for ${name}.`,
        });

        revalidatePath("/consultant/profile");
        return { success: true };
    } catch (error) {
        console.error("Consultant Profile Update Error:", error);
        return { error: "Failed to update profile. Please try again." };
    }
}

export async function uploadConsultantKYC(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;

    if (!documentType) return { error: "Document type is required" };
    if (!file || file.size === 0) return { error: "No file provided" };

    // Validations
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
        return { error: "Invalid file type. Only PDF, JPG, and PNG are allowed." };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { error: "File size too large. Max limit is 5MB." };
    }

    try {
        const consultant = await prisma.consultantProfile.findUnique({ where: { userId: session.id as string } });
        if (!consultant) return { error: "Consultant profile not found" };

        const fileUrl = await uploadFile(file, "kyc");

        const existingDoc = await prisma.kYCDocument.findFirst({
            where: { consultantId: consultant.id, documentType }
        });

        if (existingDoc) {
            await prisma.kYCDocument.update({
                where: { id: existingDoc.id },
                data: {
                    fileUrl,
                    fileType: file.type,
                    status: KYCDocStatus.PENDING,
                    uploadedAt: new Date()
                }
            });
        } else {
            await prisma.kYCDocument.create({
                data: {
                    fileUrl,
                    fileType: file.type,
                    documentType,
                    status: KYCDocStatus.PENDING,
                    consultantId: consultant.id
                }
            });
        }

        await createAuditLog({
            userId: session.id as string,
            action: "UPLOAD_CONSULTANT_KYC",
            details: `Uploaded KYC document: ${documentType}`,
        });

        revalidatePath("/consultant/profile");
        return { success: true };
    } catch (error) {
        console.error("Consultant KYC Upload Error:", error);
        return { error: "Failed to upload document." };
    }
}

import { unstable_cache } from "next/cache";

export const getConsultingCategories = unstable_cache(
    async () => {
        return await prisma.consultingCategory.findMany({
            orderBy: { name: 'asc' }
        });
    },
    ["consulting-categories"],
    { revalidate: 3600, tags: ["consulting-categories"] }
);

export async function addConsultantService(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        return { error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const pricingModel = formData.get("pricingModel") as string;

    if (!title) return { error: "Title is required" };
    if (!description) return { error: "Description is required" };

    try {
        const consultant = await prisma.consultantProfile.findUnique({
            where: { userId: session.id as string }
        });

        if (!consultant) return { error: "Consultant profile not found" };

        await prisma.consultantService.create({
            data: {
                consultantId: consultant.id,
                title,
                description,
                pricingModel,
            }
        });

        await createAuditLog({
            userId: session.id as string,
            action: "ADD_CONSULTANT_SERVICE",
            details: `Added new service: ${title}`,
        });

        revalidatePath("/consultant/services");
        revalidatePath(`/directory/consultants/${consultant.slug}`);
        return { success: true };
    } catch (error) {
        console.error("Add Service Error:", error);
        return { error: "Failed to add service." };
    }
}

export async function updateConsultantService(serviceId: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        return { error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const pricingModel = formData.get("pricingModel") as string;
    const isActive = formData.get("isActive") === "true";

    if (!title) return { error: "Title is required" };
    if (!description) return { error: "Description is required" };

    try {
        const consultant = await prisma.consultantProfile.findUnique({
            where: { userId: session.id as string }
        });

        if (!consultant) return { error: "Consultant profile not found" };

        const service = await prisma.consultantService.findUnique({
            where: { id: serviceId }
        });

        if (!service || service.consultantId !== consultant.id) {
            return { error: "Service not found or unauthorized" };
        }

        await prisma.consultantService.update({
            where: { id: serviceId },
            data: {
                title,
                description,
                pricingModel,
                isActive
            }
        });

        await createAuditLog({
            userId: session.id as string,
            action: "UPDATE_CONSULTANT_SERVICE",
            details: `Updated service: ${title}`,
        });

        revalidatePath("/consultant/services");
        revalidatePath(`/directory/consultants/${consultant.slug}`);
        return { success: true };
    } catch (error) {
        console.error("Update Service Error:", error);
        return { error: "Failed to update service." };
    }
}

export async function deleteConsultantService(serviceId: string): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        return { error: "Unauthorized" };
    }

    try {
        const consultant = await prisma.consultantProfile.findUnique({
            where: { userId: session.id as string }
        });

        if (!consultant) return { error: "Consultant profile not found" };

        const service = await prisma.consultantService.findUnique({
            where: { id: serviceId }
        });

        if (!service || service.consultantId !== consultant.id) {
            return { error: "Service not found or unauthorized" };
        }

        await prisma.consultantService.delete({
            where: { id: serviceId }
        });

        await createAuditLog({
            userId: session.id as string,
            action: "DELETE_CONSULTANT_SERVICE",
            details: `Deleted service: ${service.title}`,
        });

        revalidatePath("/consultant/services");
        revalidatePath(`/directory/consultants/${consultant.slug}`);
        return { success: true };
    } catch (error) {
        console.error("Delete Service Error:", error);
        return { error: "Failed to delete service." };
    }
}

export async function getConsultantServices(consultantId: string) {
    return await prisma.consultantService.findMany({
        where: { consultantId, isActive: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getConsultantServicesForDashboard() {
    const session = await getSession();
    if (!session || session.role !== Role.CONSULTANT) {
        return [];
    }

    const consultant = await prisma.consultantProfile.findUnique({
        where: { userId: session.id as string }
    });

    if (!consultant) return [];

    return await prisma.consultantService.findMany({
        where: { consultantId: consultant.id },
        orderBy: { createdAt: 'desc' }
    });
}
