"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Role, AuthStatus, FormState } from "@/lib/types";
import { createAuditLog } from "@/lib/audit";



import { generateSlug } from "@/lib/slug";

import { uploadFile } from "@/lib/storage";
import { KYCDocStatus } from "@/lib/types";
import { sendAuthRequestUpdateEmail } from "@/lib/email";

export async function getOEMDashboardMetrics() {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        return null;
    }

    const userId = session.id as string;
    const oem = await prisma.oEMProfile.findUnique({
        where: { userId },
        include: {
            receivedRequests: true,
            catalog: true
        }
    });

    if (!oem) return null;

    // 1. Authorization Request Stats
    const authStats = {
        approved: oem.receivedRequests.filter(r => r.status === 'APPROVED').length,
        pending: oem.receivedRequests.filter(r => r.status === 'PENDING').length,
        rejected: oem.receivedRequests.filter(r => r.status === 'REJECTED').length,
        total: oem.receivedRequests.length
    };

    // 2. Product Views & GMV (Mocked with dynamic dates)
    const productViewsData = [];
    const gmvData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });

        // Mock randomized growth data
        productViewsData.push({
            name: monthName,
            views: 100 + (i * 50) + Math.floor(Math.random() * 30),
            unique: 80 + (i * 30) + Math.floor(Math.random() * 20)
        });

        gmvData.push({
            name: monthName,
            amount: 400000 + (i * 50000) + Math.floor(Math.random() * 50000)
        });
    }

    // 4. Recent Activities/Notifications (Mocked mostly, could be real too)
    const recentActivities = oem.receivedRequests
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map(req => ({
            id: req.id,
            type: 'REQUEST',
            message: `Authorization request from vendor for ${req.productId} is ${req.status}`,
            date: req.updatedAt
        }));

    return {
        authStats,
        productViewsData,
        gmvData,
        recentActivities,
        activeCatalogCount: oem.catalog.filter(p => !p.isArchived).length,
        totalCatalogCount: oem.catalog.length
    };
}

export async function updateOEMProfile(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        return { error: "Unauthorized" };
    }

    const userId = session.id as string;

    const companyName = formData.get("companyName") as string;
    const oemType = formData.get("oemType") as string;
    const registrationNumber = formData.get("registrationNumber") as string;
    const registeredAddress = formData.get("registeredAddress") as string;
    const contactPerson = formData.get("contactPerson") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;

    if (!companyName) return { error: "Company Name is required" };
    if (!registrationNumber) return { error: "Registration Number is required" };
    if (!registeredAddress) return { error: "Registered Address is required" };
    if (!contactPerson) return { error: "Contact Person name is required" };
    if (!contactEmail) return { error: "Contact Email is required" };
    if (!contactPhone) return { error: "Contact Phone number is required" };

    try {
        // Duplicate Checks
        const existingReg = await prisma.oEMProfile.findFirst({
            where: {
                registrationNumber,
                NOT: { userId }
            }
        });
        if (existingReg) return { error: "Registration number already used by another account." };

        const existingName = await prisma.oEMProfile.findFirst({
            where: {
                companyName: { equals: companyName, mode: 'insensitive' },
                NOT: { userId }
            }
        });
        if (existingName) return { error: "Company name already exists." };

        const slug = generateSlug(companyName);

        await prisma.oEMProfile.update({
            where: { userId },
            data: {
                companyName,
                slug,
                oemType,
                registrationNumber,
                registeredAddress,
                contactPerson,
                contactEmail,
                contactPhone
            },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "UPDATE_OEM_PROFILE",
            details: `Updated profile for ${companyName}`,
        });

        revalidatePath("/oem/profile");

        return { success: true };
    } catch (error) {
        console.error("OEM Update Error:", error);
        return { error: "Failed to update profile" };
    }
}

export async function uploadOEMKYCDocument(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;

    if (!documentType) return { error: "Document type is required" };
    if (!file || file.size === 0) return { error: "No file provided" };

    if (file.size > 5 * 1024 * 1024) {
        return { error: "File size must be less than 5MB" };
    }

    try {
        const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });
        if (!oem) return { error: "OEM profile not found" };

        const fileUrl = await uploadFile(file, "kyc/oem");

        // Check for existing doc of same type
        const existingDoc = await prisma.kYCDocument.findFirst({
            where: { oemId: oem.id, documentType }
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
                    oemId: oem.id
                }
            });
        }

        await createAuditLog({
            userId: session.id as string,
            action: "UPLOAD_OEM_KYC",
            details: `Uploaded KYC doc: ${documentType}`,
        });

        revalidatePath("/oem/profile");
        return { success: true };

    } catch (error) {
        console.error(error);
        return { error: "Failed to upload document" };
    }
}

export async function createCatalogProduct(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const sku = formData.get("sku") as string;
    const categoryId = formData.get("categoryId") as string;
    const subCategoryId = formData.get("subCategoryId") as string;
    const specifications = formData.get("specifications") as string;
    const features = formData.get("features") as string;
    const priceRange = formData.get("priceRange") as string;
    const warrantyInfo = formData.get("warrantyInfo") as string;

    const imageFile = formData.get("image") as File;
    const datasheetFile = formData.get("datasheet") as File;

    if (!name || !sku || !categoryId) {
        return { error: "Name, SKU and Category are required" };
    }

    try {
        const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });
        if (!oem) return { error: "OEM profile not found" };

        const product = await prisma.product.create({
            data: {
                name,
                description,
                sku,
                categoryId,
                subCategoryId: subCategoryId || null,
                specifications,
                features,
                priceRange,
                warrantyInfo,
                oemId: oem.id,
            },
        });

        // Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            const imageUrl = await uploadFile(imageFile, "products/images");
            await prisma.productMedia.create({
                data: {
                    productId: product.id,
                    url: imageUrl,
                    type: "IMAGE",
                    fileName: imageFile.name
                }
            });
        }

        // Handle Datasheet Upload
        if (datasheetFile && datasheetFile.size > 0) {
            const docUrl = await uploadFile(datasheetFile, "products/docs");
            await prisma.productMedia.create({
                data: {
                    productId: product.id,
                    url: docUrl,
                    type: "DOCUMENT",
                    fileName: datasheetFile.name
                }
            });
        }

        await createAuditLog({
            userId: session.id as string,
            action: "CREATE_CATALOG_PRODUCT",
            details: `Created catalog product: ${name}`,
        });

        revalidatePath("/oem/catalog");

        return { success: true };
    } catch (error) {
        console.error("Create Product Error:", error);
        return { error: "Failed to create product" };
    }
}

export async function processAuthRequest(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        return { error: "Unauthorized" };
    }

    const requestId = formData.get("requestId") as string;
    const action = formData.get("action") as string; // APPROVE, REJECT, CLARIFY
    const comment = formData.get("comment") as string;

    if (!['APPROVE', 'REJECT', 'CLARIFY'].includes(action)) return { error: "Invalid action" };

    try {
        const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });
        if (!oem) return { error: "OEM profile not found" };

        // Verify request belongs to OEM
        const req = await prisma.authorizationRequest.findFirst({
            where: { id: requestId, oemId: oem.id },
            include: {
                vendor: { include: { user: true } },
                product: true
            }
        });
        if (!req) return { error: "Request not found" };

        if (req.isLocked) {
            return { error: "This request has been locked by a system administrator and cannot be modified." };
        }

        let status: AuthStatus;
        if (action === 'APPROVE') status = AuthStatus.APPROVED;
        else if (action === 'REJECT') status = AuthStatus.REJECTED;
        else status = AuthStatus.MORE_INFO_NEEDED;

        await prisma.authorizationRequest.update({
            where: { id: requestId },
            data: {
                status,
                oemComment: comment || null
            }
        });

        await createAuditLog({
            userId: session.id as string,
            action: `PROCESS_AUTH_REQUEST_${action}`,
            details: `${action} request ${requestId}. Comment: ${comment || 'None'}`,
        });

        // Email Notification
        const vendorEmail = req.vendor.contactEmail || req.vendor.user.email;
        await sendAuthRequestUpdateEmail(
            vendorEmail,
            req.vendor.companyName,
            req.product.name,
            status,
            oem.companyName,
            comment
        );

        // Create Notification for Vendor
        await prisma.notification.create({
            data: {
                userId: req.vendor.userId,
                title: `Authorization Request Update`,
                message: `Your authorization request for "${req.product.name}" has been ${status.toLowerCase().replace('_', ' ')} by ${oem.companyName}.`
            }
        });

        revalidatePath("/oem/requests");
        revalidatePath(`/oem/requests/${requestId}`);

        return { success: true };
    } catch (error) {
        console.error("Process Request Error:", error);
        return { error: "Failed to process request" };
    }
}


export async function updateCatalogProduct(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        return { error: "Unauthorized" };
    }

    const productId = formData.get("productId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const sku = formData.get("sku") as string;
    const categoryId = formData.get("categoryId") as string;
    const subCategoryId = formData.get("subCategoryId") as string;
    const specifications = formData.get("specifications") as string;
    const features = formData.get("features") as string;
    const priceRange = formData.get("priceRange") as string;
    const warrantyInfo = formData.get("warrantyInfo") as string;

    const imageFile = formData.get("image") as File;
    const datasheetFile = formData.get("datasheet") as File;

    if (!productId || !name || !sku || !categoryId) {
        return { error: "Product ID, Name, SKU and Category are required" };
    }

    try {
        const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });
        if (!oem) return { error: "OEM profile not found" };

        // Verify product belongs to OEM
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existingProduct || existingProduct.oemId !== oem.id) {
            return { error: "Product not found or unauthorized" };
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                name,
                description,
                sku,
                categoryId,
                subCategoryId: subCategoryId || null,
                specifications,
                features,
                priceRange,
                warrantyInfo,
            },
        });

        // Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            const imageUrl = await uploadFile(imageFile, "products/images");
            await prisma.productMedia.create({
                data: {
                    productId: product.id,
                    url: imageUrl,
                    type: "IMAGE",
                    fileName: imageFile.name
                }
            });
        }

        // Handle Datasheet Upload
        if (datasheetFile && datasheetFile.size > 0) {
            const docUrl = await uploadFile(datasheetFile, "products/docs");
            await prisma.productMedia.create({
                data: {
                    productId: product.id,
                    url: docUrl,
                    type: "DOCUMENT",
                    fileName: datasheetFile.name
                }
            });
        }

        await createAuditLog({
            userId: session.id as string,
            action: "UPDATE_CATALOG_PRODUCT",
            details: `Updated catalog product: ${name} (${productId})`,
        });

        revalidatePath("/oem/catalog");

        return { success: true };
    } catch (error) {
        console.error("Update Product Error:", error);
        return { error: "Failed to update product" };
    }
}

export async function archiveProduct(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        return { error: "Unauthorized" };
    }

    const productId = formData.get("productId") as string;

    if (!productId) {
        return { error: "Product ID is required" };
    }

    try {
        const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });
        if (!oem) return { error: "OEM profile not found" };

        // Verify product belongs to OEM
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existingProduct || existingProduct.oemId !== oem.id) {
            return { error: "Product not found or unauthorized" };
        }

        await prisma.product.update({
            where: { id: productId },
            data: { isArchived: true },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "ARCHIVE_CATALOG_PRODUCT",
            details: `Archived catalog product: ${existingProduct.name} (${productId})`,
        });

        revalidatePath("/oem/catalog");

        return { success: true };
    } catch (error) {
        console.error("Archive Product Error:", error);
        return { error: "Failed to archive product" };
    }
}

export async function unarchiveProduct(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.OEM) {
        return { error: "Unauthorized" };
    }

    const productId = formData.get("productId") as string;

    if (!productId) {
        return { error: "Product ID is required" };
    }

    try {
        const oem = await prisma.oEMProfile.findUnique({ where: { userId: session.id as string } });
        if (!oem) return { error: "OEM profile not found" };

        // Verify product belongs to OEM
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existingProduct || existingProduct.oemId !== oem.id) {
            return { error: "Product not found or unauthorized" };
        }

        await prisma.product.update({
            where: { id: productId },
            data: { isArchived: false },
        });

        await createAuditLog({
            userId: session.id as string,
            action: "UNARCHIVE_CATALOG_PRODUCT",
            details: `Unarchived catalog product: ${existingProduct.name} (${productId})`,
        });

        revalidatePath("/oem/catalog");

        return { success: true };
    } catch (error) {
        console.error("Unarchive Product Error:", error);
        return { error: "Failed to unarchive product" };
    }
}
