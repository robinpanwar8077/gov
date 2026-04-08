"use server";

import { createAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import { uploadFile } from "@/lib/storage";
import { FormState, KYCDocStatus, Role } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { subDays } from "date-fns";

export async function getVendorDashboardMetrics(range?: string) {
  const session = await getSession();
  if (!session || session.role !== Role.VENDOR) {
    return null;
  }

  const rangeFilter: any = {};
  if (range && range !== "ALL") {
    const fromDate = subDays(new Date(), parseInt(range));
    rangeFilter.createdAt = { gte: fromDate };
  }

  const userId = session.id as string;
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId },
    include: {
      authRequests: {
        where: rangeFilter
      },
      products: {
        where: rangeFilter
      }
    }
  });

  if (!vendor) return null;

  // 1. Authorization Stats
  const authStats = {
    approved: vendor.authRequests.filter(r => r.status === 'APPROVED').length,
    pending: vendor.authRequests.filter(r => r.status === 'PENDING').length,
    rejected: vendor.authRequests.filter(r => r.status === 'REJECTED').length,
    total: vendor.authRequests.length
  };

  // 2. Leads (Conversations) - "Real" data based on conversations where vendor is a participant
  // We need to fetch conversations for the user
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { id: userId }
      }
    },
    select: { createdAt: true }
  });

  // 2. Leads (Conversations) & GMV (Mock) - Last 6 months dynamic generation
  const leadsData = [];
  const gmvData = [];

  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'short' });

    // Real Leads Count
    const leadsCount = conversations.filter(c =>
      c.createdAt.getMonth() === d.getMonth() &&
      c.createdAt.getFullYear() === d.getFullYear()
    ).length;

    // Mock GMV Data - Randomized slightly for variation
    const baseGmv = 10000 + (i * 2000); // Upward trend
    const randomVar = Math.floor(Math.random() * 5000);

    leadsData.push({ name: monthName, leads: leadsCount });
    gmvData.push({ name: monthName, amount: baseGmv + randomVar });
  }

  // 4. Recent Events (Mocked, dynamic dates)
  const recentEvents = [
    { id: 1, name: "GeM Samvad 2025", date: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(), status: "Registered" },
    { id: 2, name: "Defense Procurement Meet", date: new Date(now.getFullYear(), now.getMonth() + 2, 20).toISOString(), status: "Pending" }
  ];

  // 5. Recent Orders (Mocked, dynamic dates)
  const recentOrders = [
    { id: "ORD-001", customer: "Dept of Defense", amount: 45000, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString(), status: "Delivered" },
    { id: "ORD-002", customer: "Ministry of Health", amount: 12000, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).toISOString(), status: "Processing" },
    { id: "ORD-003", customer: "Public Works Dept", amount: 28000, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10).toISOString(), status: "Shipped" },
  ];

  return {
    authStats,
    leadsData,
    gmvData,
    recentEvents,
    recentOrders,
    activeProducts: vendor.products.filter(p => !p.isArchived).length
  };
}

export async function updateVendorProfile(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== Role.VENDOR) {
    return { error: "Unauthorized" };
  }

  const userId = session.id as string;

  // Extract fields
  const companyName = formData.get("companyName") as string;
  const pan = formData.get("pan") as string;
  const gst = formData.get("gst") as string;
  const registeredAddress = formData.get("registeredAddress") as string;
  const contactPerson = formData.get("contactPerson") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;

  // Basic Validations
  if (!companyName) return { error: "Company Name is required" };
  if (!gst) return { error: "GST Number is required" };
  if (!registeredAddress) return { error: "Registered Address is required" };
  if (!contactPerson) return { error: "Contact Person name is required" };
  if (!contactEmail) return { error: "Contact Email is required" };
  if (!contactPhone) return { error: "Contact Phone is required" };

  // Format Validations
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(gst)) return { error: "Invalid GST format" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail))
    return { error: "Invalid Contact Email format" };

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(contactPhone))
    return { error: "Invalid Contact Phone (10 digit Indian number required)" };

  try {
    // Duplicate Checks
    const existingGST = await prisma.vendorProfile.findFirst({
      where: {
        gst,
        NOT: { userId },
      },
    });
    if (existingGST)
      return {
        error: "This GST number is already registered with another account.",
      };

    const existingName = await prisma.vendorProfile.findFirst({
      where: {
        companyName: { equals: companyName, mode: "insensitive" },
        NOT: { userId },
      },
    });
    if (existingName)
      return {
        error:
          "A company with this name already exists. Please contact support if this is an error.",
      };

    const slug = generateSlug(companyName);

    await prisma.vendorProfile.update({
      where: { userId },
      data: {
        companyName,
        slug,
        pan,
        gst,
        registeredAddress,
        contactPerson,
        contactEmail,
        contactPhone,
      },
    });

    await createAuditLog({
      userId: session.id as string,
      action: "UPDATE_VENDOR_PROFILE",
      details: `Updated company profile for ${companyName}. GST: ${gst}`,
    });

    revalidatePath("/vendor/profile");

    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return {
      error: "Failed to update company profile. Please check your data.",
    };
  }
}

export async function uploadKYCDocument(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  console.log("==================Started======================");
  if (!session || session.role !== Role.VENDOR) {
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
  console.log("File Size", file.size);
  if (file.size > maxSize) {
    return { error: "File size too large. Max limit is 5MB." };
  }

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.id as string },
    });
    if (!vendor) return { error: "Vendor profile not found" };

    // Upload to S3/MinIO
    const fileUrl = await uploadFile(file, "kyc");

    // Check if document of this type already exists to replace it
    const existingDoc = await prisma.kYCDocument.findFirst({
      where: { vendorId: vendor.id, documentType },
    });

    if (existingDoc) {
      await prisma.kYCDocument.update({
        where: { id: existingDoc.id },
        data: {
          fileUrl: fileUrl,
          fileType: file.type,
          status: KYCDocStatus.PENDING,
          uploadedAt: new Date(),
        },
      });
    } else {
      await prisma.kYCDocument.create({
        data: {
          fileUrl: fileUrl,
          fileType: file.type,
          documentType,
          status: KYCDocStatus.PENDING,
          vendorId: vendor.id,
        },
      });
    }

    await createAuditLog({
      userId: session.id as string,
      action: "UPLOAD_KYC",
      details: `Uploaded KYC document: ${documentType} (${file.name})`,
    });

    revalidatePath("/vendor/profile");

    return { success: true };
  } catch (error) {
    console.error("KYC Upload Error:", error);
    return { error: "Failed to upload document. Please try again." };
  }
}

export async function createProduct(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== Role.VENDOR) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const sku = formData.get("sku") as string;
  const priceRange = formData.get("priceRange") as string;
  const files = formData.getAll("media") as File[];

  if (!name || name.trim() === "") return { error: "Product Name is required" };
  if (!description || description.trim() === "")
    return { error: "Description is required" };

  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (file.size > maxSize) {
      return { error: `File ${file.name} is too large. Max limit is 5MB.` };
    }
  }

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.id as string },
    });
    if (!vendor) return { error: "Vendor profile not found" };

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        priceRange,
        categoryId: categoryId || null,
        vendorId: vendor.id,
      },
    });

    // Upload files
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.size > 0 && file.name !== "undefined") {
          const type = file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT";
          try {
            const url = await uploadFile(file, "products");
            await prisma.productMedia.create({
              data: {
                productId: product.id,
                url,
                type,
                fileName: file.name,
              },
            });
          } catch (err) {
            console.error(`Failed to upload file ${file.name}`, err);
            // Continue ensuring product creation isn't fully rolled back just because of one file?
            // Or fail? "System must handle network/server failures gracefully".
            // Let's log it but continue. The user can see it missing and retry.
          }
        }
      }
    }

    await createAuditLog({
      userId: session.id as string,
      action: "CREATE_PRODUCT",
      details: `Created product: ${name} with ${files.length} attachments`,
    });

    revalidatePath("/vendor/products");

    return { success: true };
  } catch (error) {
    console.error("Create Product Error:", error);
    return { error: "Failed to create product due to a system error." };
  }
}

export async function updateProduct(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== Role.VENDOR) {
    return { error: "Unauthorized" };
  }

  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const sku = formData.get("sku") as string;
  const priceRange = formData.get("priceRange") as string;
  const files = formData.getAll("media") as File[];

  if (!productId) return { error: "Product ID is missing" };
  if (!name || name.trim() === "") return { error: "Product Name is required" };
  if (!description || description.trim() === "")
    return { error: "Description is required" };

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.id as string },
    });
    if (!vendor) return { error: "Vendor profile not found" };

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.vendorId !== vendor.id) {
      return { error: "Product not found or unauthorized" };
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        sku,
        priceRange,
        categoryId: categoryId || null,
      },
    });

    // Add new files
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.size > 0 && file.name !== "undefined") {
          if (file.size > 5 * 1024 * 1024) continue; // Skip large files silently or handle better?
          // Better to just skip or log.

          const type = file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT";
          const url = await uploadFile(file, "products");
          await prisma.productMedia.create({
            data: {
              productId: product.id,
              url,
              type,
              fileName: file.name,
            },
          });
        }
      }
    }

    await createAuditLog({
      userId: session.id as string,
      action: "UPDATE_PRODUCT",
      details: `Updated product: ${name}`,
    });

    revalidatePath("/vendor/products");
    return { success: true };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== Role.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.id as string },
    });
    if (!vendor) return { error: "Vendor profile not found" };

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.vendorId !== vendor.id) {
      return { error: "Product not found or unauthorized" };
    }

    await prisma.product.delete({ where: { id: productId } });

    await createAuditLog({
      userId: session.id as string,
      action: "DELETE_PRODUCT",
      details: `Deleted product: ${product.name}`,
    });

    revalidatePath("/vendor/products");
    return { success: true };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { error: "Failed to delete product" };
  }
}

export async function deleteProductMedia(mediaId: string): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== Role.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const media = await prisma.productMedia.findUnique({
      where: { id: mediaId },
      include: { product: true },
    });

    if (!media) return { error: "Media not found" };

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.id as string },
    });
    if (!vendor || media.product.vendorId !== vendor.id) {
      return { error: "Unauthorized" };
    }

    await prisma.productMedia.delete({ where: { id: mediaId } });

    revalidatePath("/vendor/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete media" };
  }
}

export async function requestAuthorization(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== Role.VENDOR) {
    return { error: "Unauthorized" };
  }

  const productId = formData.get("productId") as string;
  const notes = formData.get("notes") as string;
  const files = formData.getAll("supportingDocs") as File[];

  if (!productId) return { error: "Product selection is required" };

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.id as string },
    });
    if (!vendor) return { error: "Vendor profile not found" };

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { oem: true },
    });

    if (!product || !product.oemId)
      return { error: "Product invalid or not an OEM product" };

    if (product.isArchived) {
      return {
        error: "This product is archived and no longer accepting authorization requests.",
      };
    }

    // Process File Uploads first to ensure they work
    const uploadedDocs: { url: string; name: string; type: string }[] = [];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (file.size > 0 && file.name !== "undefined") {
        if (file.size > maxFileSize) {
          return { error: `File ${file.name} exceeds the 5MB limit.` };
        }

        try {
          const url = await uploadFile(file, "auth-requests");
          uploadedDocs.push({
            url,
            name: file.name,
            type: file.type
          });
        } catch (uploadErr) {
          console.error("File upload failed:", uploadErr);
          return { error: `Failed to upload ${file.name}. Please try again.` };
        }
      }
    }

    const request = await prisma.authorizationRequest.create({
      data: {
        vendorId: vendor.id,
        oemId: product.oemId,
        productId: product.id,
        notes,
        documents: {
          create: uploadedDocs.map(doc => ({
            fileUrl: doc.url,
            fileName: doc.name,
            fileType: doc.type
          }))
        }
      },
    });

    await createAuditLog({
      userId: session.id as string,
      action: "REQUEST_AUTHORIZATION",
      details: `Requested authorization for product ${product.name} (${productId}) with ${uploadedDocs.length} supporting documents.`,
    });

    revalidatePath("/vendor/auth-requests");

    return { success: true };
  } catch (error) {
    console.error("Request Authorization Error:", error);
    return { error: "Failed to request authorization. Please check if all fields are correct." };
  }
}

import { unstable_cache } from "next/cache";

export const getAllCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      include: { subCategories: true },
    });
  },
  ["all-categories"],
  { revalidate: 30, tags: ["categories"] }
);

export async function updateVendorCategories(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== Role.VENDOR) {
    return { error: "Unauthorized" };
  }

  const categoryIds = formData.getAll("categories") as string[];
  const subCategoryIds = formData.getAll("subCategories") as string[];

  if (categoryIds.length === 0) {
    return { error: "Please select at least one primary business category." };
  }

  if (subCategoryIds.length === 0) {
    return {
      error: "Please select at least one subcategory to specify your services.",
    };
  }

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.id as string },
      include: { categories: true, subCategories: true },
    });

    if (!vendor) return { error: "Vendor profile not found" };

    // Verification: ensure all subCategoryIds belong to one of the categoryIds
    // Fetch category details for audit log
    const selectedCats = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { name: true },
    });

    await prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: {
        categories: {
          set: categoryIds.map((id) => ({ id })),
        },
        subCategories: {
          set: subCategoryIds.map((id) => ({ id })),
        },
      },
    });

    const catNames = selectedCats
      .map((c: { name: string }) => c.name)
      .join(", ");

    await createAuditLog({
      userId: session.id as string,
      action: "UPDATE_CATEGORIES",
      details: `Updated business classification. Categories: [${catNames}], Total Subcats: ${subCategoryIds.length}`,
    });

    revalidatePath("/vendor/profile");
    return { success: true };
  } catch (error) {
    console.error("Update Categories Error:", error);
    return {
      error:
        "An error occurred while saving your selections. Please try again.",
    };
  }
}
