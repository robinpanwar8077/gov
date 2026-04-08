"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { subDays } from "date-fns";
import { Role, KYCStatus, KYCDocStatus, FormState } from "@/lib/types";
import { createAuditLog } from "@/lib/audit";




import { sendKYCStatusUpdateEmail } from "@/lib/email";



export async function updateDocumentStatus(docId: string, status: KYCDocStatus, notes?: string): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
        return { error: "Unauthorized" };
    }

    try {
        const doc = await prisma.kYCDocument.update({
            where: { id: docId },
            data: {
                status,
                notes: (status === KYCDocStatus.REJECTED || status === KYCDocStatus.NEEDS_MORE_INFO) ? notes : null
            }
        });

        revalidatePath("/admin/approvals");
        
        await createAuditLog({
            userId: session.id as string,
            action: `DOC_REVIEW_${status}`,
            details: `Document ${docId} status set to ${status}. Notes: ${notes || 'None'}`,
        });

        return { success: true };
    } catch (error) {
        console.error("Update Doc Status Error:", error);
        return { error: "Failed to update document status" };
    }
}

export async function finalizeVendorReview(vendorId: string, status: KYCStatus, remarks?: string): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
        return { error: "Unauthorized" };
    }

    try {
        const vendor = await prisma.vendorProfile.findUnique({
            where: { id: vendorId },
            include: { user: true } // Include user to get email
        });
        if (!vendor) return { error: "Vendor not found" };

        await prisma.vendorProfile.update({
            where: { id: vendorId },
            data: { kycStatus: status }
        });

        // If Approved, ensure User is verified
        if (status === KYCStatus.APPROVED) {
            await prisma.user.update({
                where: { id: vendor.userId },
                data: { isVerified: true }
            });
        }

        // Send Email Notification
        const email = vendor.contactEmail || vendor.user.email;
        await sendKYCStatusUpdateEmail(email, vendor.companyName, status, remarks);

        // Send Notification (Using Notification model)
        let message = `Your KYC status has been updated to ${status}.`;
        if (remarks) message += ` Remarks: ${remarks}`;

        await prisma.notification.create({
            data: {
                userId: vendor.userId,
                title: "KYC Status Update",
                message,
                isRead: false
            }
        });

        await createAuditLog({
            userId: session.id as string,
            action: `REVIEW_VENDOR_${status}`,
            details: `Vendor ${vendorId} status set to ${status}. Remarks: ${remarks || 'None'}`,
        });

        revalidatePath("/admin/approvals");
        return { success: true };
    } catch (error) {
        console.error("Finalize Vendor Review Error:", error);
        return { error: "Failed to submit review" };
    }
}

export async function finalizeOEMReview(oemId: string, status: KYCStatus, remarks?: string): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
        return { error: "Unauthorized" };
    }

    try {
        const oem = await prisma.oEMProfile.findUnique({
            where: { id: oemId },
            include: { user: true }
        });
        if (!oem) return { error: "OEM not found" };

        await prisma.oEMProfile.update({
            where: { id: oemId },
            data: { kycStatus: status }
        });

        // If Approved, ensure User is verified
        if (status === KYCStatus.APPROVED) {
            await prisma.user.update({
                where: { id: oem.userId },
                data: { isVerified: true }
            });
        }

        // Send Email Notification
        const email = oem.contactEmail || oem.user.email;
        await sendKYCStatusUpdateEmail(email, oem.companyName, status, remarks);

        // Send Notification
        let message = `Your OEM profile status has been updated to ${status}.`;
        if (remarks) message += ` Remarks: ${remarks}`;

        await prisma.notification.create({
            data: {
                userId: oem.userId,
                title: "OEM Account Status Update",
                message,
                isRead: false
            }
        });

        await createAuditLog({
            userId: session.id as string,
            action: `REVIEW_OEM_${status}`,
            details: `OEM ${oemId} status set to ${status}. Remarks: ${remarks || 'None'}`,
        });

        revalidatePath("/admin/approvals");
        return { success: true };
    } catch (error) {
        console.error("Finalize OEM Review Error:", error);
        return { error: "Failed to submit review" };
    }
}


export async function finalizeConsultantReview(consultantId: string, status: KYCStatus, remarks?: string): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
        return { error: "Unauthorized" };
    }

    try {
        const consultant = await prisma.consultantProfile.findUnique({
            where: { id: consultantId },
            include: { user: true }
        });
        if (!consultant) return { error: "Consultant not found" };

        await prisma.consultantProfile.update({
            where: { id: consultantId },
            data: { kycStatus: status }
        });

        // If Approved, ensure User is verified
        if (status === KYCStatus.APPROVED) {
            await prisma.user.update({
                where: { id: consultant.userId },
                data: { isVerified: true }
            });
        }

        // Send Email Notification
        const email = consultant.contactEmail || consultant.user.email;
        await sendKYCStatusUpdateEmail(email, consultant.name, status, remarks);

        // Send Notification
        let message = `Your consultant profile status has been updated to ${status}.`;
        if (remarks) message += ` Remarks: ${remarks}`;

        await prisma.notification.create({
            data: {
                userId: consultant.userId,
                title: "Consultant Account Status Update",
                message,
                isRead: false
            }
        });

        await createAuditLog({
            userId: session.id as string,
            action: `REVIEW_CONSULTANT_${status}`,
            details: `Consultant ${consultantId} status set to ${status}. Remarks: ${remarks || 'None'}`,
        });

        revalidatePath("/admin/approvals");
        return { success: true };
    } catch (error) {
        console.error("Finalize Consultant Review Error:", error);
        return { error: "Failed to submit review" };
    }
}

export async function approveVendor(prevState: FormState, formData: FormData): Promise<FormState> {
    const vendorId = formData.get("vendorId") as string;
    if (!vendorId) return { error: "Vendor ID is missing" };
    return finalizeVendorReview(vendorId, KYCStatus.APPROVED);
}

export async function rejectVendor(prevState: FormState, formData: FormData): Promise<FormState> {
    const vendorId = formData.get("vendorId") as string;
    if (!vendorId) return { error: "Vendor ID is missing" };
    return finalizeVendorReview(vendorId, KYCStatus.REJECTED);
}

export async function overrideAuthRequest(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) return { error: "Unauthorized" };

    const requestId = formData.get("requestId") as string;
    const status = formData.get("status") as any;
    const adminComment = formData.get("adminComment") as string;

    if (!requestId || !status || !adminComment) {
        return { error: "Request ID, Status and Remarks are required for overrides" };
    }

    try {
        const req = await prisma.authorizationRequest.update({
            where: { id: requestId },
            data: { status, adminComment },
            include: { vendor: true, product: true }
        });

        await createAuditLog({
            userId: session.id as string,
            action: "ADMIN_OVERRIDE_AUTH_REQUEST",
            details: `Admin ${session.email} overrode request ${requestId} to ${status}. Remarks: ${adminComment}`,
        });

        // Notify Vendor
        await prisma.notification.create({
            data: {
                userId: req.vendor.userId,
                title: "Authorization Request Override",
                message: `An administrator has updated your authorization request for "${req.product.name}" to ${status}. Remarks: ${adminComment}`
            }
        });

        revalidatePath("/admin/authorizations");
        revalidatePath(`/admin/authorizations/${requestId}`);
        return { success: true };
    } catch (error) {
        console.error("Override Auth Request Error:", error);
        return { error: "Failed to override request" };
    }
}

export async function toggleLockAuthRequest(requestId: string, lock: boolean): Promise<FormState> {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) return { error: "Unauthorized" };

    try {
        await prisma.authorizationRequest.update({
            where: { id: requestId },
            data: { isLocked: lock }
        });

        await createAuditLog({
            userId: session.id as string,
            action: lock ? "ADMIN_LOCK_AUTH_REQUEST" : "ADMIN_UNLOCK_AUTH_REQUEST",
            details: `Admin ${session.email} ${lock ? 'locked' : 'unlocked'} request ${requestId}`,
        });

        revalidatePath("/admin/authorizations");
        revalidatePath(`/admin/authorizations/${requestId}`);
        return { success: true };
    } catch (error) {
        return { error: `Failed to ${lock ? 'lock' : 'unlock'} request` };
    }
}

export async function getAdminDashboardMetrics(range?: string) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) return null;

    const rangeFilter: any = {};
    if (range && range !== "ALL") {
        const fromDate = subDays(new Date(), parseInt(range));
        rangeFilter.createdAt = { gte: fromDate };
    }

    try {
        // 1. User & Entity Counts (filtered)
        const totalUsers = await prisma.user.count({ where: rangeFilter });
        const totalVendors = await prisma.vendorProfile.count({ where: rangeFilter });
        const activeVendors = await prisma.vendorProfile.count({ 
            where: { ...rangeFilter, kycStatus: KYCStatus.APPROVED } 
        });
        const totalOEMs = await prisma.oEMProfile.count({ where: rangeFilter });
        const activeOEMs = await prisma.oEMProfile.count({ 
            where: { ...rangeFilter, kycStatus: KYCStatus.APPROVED } 
        });

        // 2. Authorization Request Stats (filtered)
        const authStats = {
            total: await prisma.authorizationRequest.count({ where: rangeFilter }),
            approved: await prisma.authorizationRequest.count({ 
                where: { ...rangeFilter, status: 'APPROVED' } 
            }),
            pending: await prisma.authorizationRequest.count({ 
                where: { ...rangeFilter, status: 'PENDING' } 
            }),
            rejected: await prisma.authorizationRequest.count({ 
                where: { ...rangeFilter, status: 'REJECTED' } 
            })
        };

        // 3. Product Inventory Stats (filtered)
        const productStats = {
            total: await prisma.product.count({ where: rangeFilter }),
            oemProducts: await prisma.product.count({ 
                where: { ...rangeFilter, oemId: { not: null } } 
            }),
            vendorProducts: await prisma.product.count({ 
                where: { ...rangeFilter, vendorId: { not: null } } 
            }),
        };

        // 4. Mocked Revenue/Growth Data (Real implementation would query payments table)
        const revenueData = [
            { name: 'Jan', amount: 120000 },
            { name: 'Feb', amount: 154000 },
            { name: 'Mar', amount: 189000 },
            { name: 'Apr', amount: 210000 },
            { name: 'May', amount: 245000 },
            { name: 'Jun', amount: 289000 },
        ];

        const userGrowthData = [
            { name: 'Jan', vendors: 45, oems: 12 },
            { name: 'Feb', vendors: 58, oems: 15 },
            { name: 'Mar', vendors: 72, oems: 18 },
            { name: 'Apr', vendors: 95, oems: 25 },
            { name: 'May', vendors: 124, oems: 32 },
            { name: 'Jun', vendors: 156, oems: 40 },
        ];

        return {
            counts: {
                totalUsers,
                totalVendors,
                activeVendors,
                totalOEMs,
                activeOEMs
            },
            authStats,
            productStats,
            revenueData,
            userGrowthData
        };
    } catch (error) {
        console.error("Error fetching admin metrics:", error);
        return null;
    }
}

export async function getAdminUsers({
    page = 1,
    pageSize = 15,
    search = "",
    role = "",
    verified = "",
}: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    verified?: string;
}) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) return null;

    const skip = (page - 1) * pageSize;

    const whereClause: any = {};

    if (search) {
        whereClause.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
            { vendorProfile: { companyName: { contains: search, mode: "insensitive" } } },
            { oemProfile: { companyName: { contains: search, mode: "insensitive" } } },
            { consultantProfile: { name: { contains: search, mode: "insensitive" } } },
        ];
    }

    if (role) {
        whereClause.role = role;
    }

    if (verified === "true") {
        whereClause.isVerified = true;
    } else if (verified === "false") {
        whereClause.isVerified = false;
    }

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: pageSize,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    mobile: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    vendorProfile: {
                        select: {
                            id: true,
                            companyName: true,
                            kycStatus: true,
                            onboardingStep: true,
                        },
                    },
                    oemProfile: {
                        select: {
                            id: true,
                            companyName: true,
                            kycStatus: true,
                        },
                    },
                    consultantProfile: {
                        select: {
                            id: true,
                            name: true,
                            firmName: true,
                            kycStatus: true,
                        },
                    },
                    memberships: {
                        where: { isActive: true },
                        select: { planName: true, validUntil: true },
                        take: 1,
                    },
                },
            }),
            prisma.user.count({ where: whereClause }),
        ]);

        return {
            users,
            total,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page,
        };
    } catch (error) {
        console.error("getAdminUsers Error:", error);
        return null;
    }
}

export async function getAdminUserById(userId: string) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                mobile: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                vendorProfile: {
                    include: {
                        kycDocuments: { orderBy: { uploadedAt: "desc" } },
                        categories: true,
                    },
                },
                oemProfile: {
                    include: {
                        kycDocuments: { orderBy: { uploadedAt: "desc" } },
                    },
                },
                consultantProfile: {
                    include: {
                        kycDocuments: { orderBy: { uploadedAt: "desc" } },
                        services: { where: { isActive: true } },
                        categories: true,
                    },
                },
                memberships: {
                    orderBy: { createdAt: "desc" },
                    include: { plan: true },
                },
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                auditLogs: {
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
                notifications: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
            },
        });
        return user;
    } catch (error) {
        console.error("getAdminUserById Error:", error);
        return null;
    }
}
export async function getAdminApprovals({
    page = 1,
    pageSize = 15,
    search = "",
    role = "",
    status = "",
}: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    status?: string;
}) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) return null;

    const skip = (page - 1) * pageSize;

    const whereClause: any = {
        role: { not: Role.ADMIN }
    };

    // Filter by role if specified (this will override the default if specified, but since we already filtered out ADMIN it's fine)
    if (role) {
        whereClause.role = role;
    }

    // Filter by search (email or mobile)
    if (search) {
        whereClause.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
        ];
    }

    // Filter by KYC Status across different profiles
    // This is tricky because KYC Status is on the profile, not the user.
    // If status is provided, we filter users who have a profile with that status.
    if (status) {
        whereClause.OR = [
            { vendorProfile: { kycStatus: status } },
            { oemProfile: { kycStatus: status } },
            { consultantProfile: { kycStatus: status } },
        ];
    } else {
        // By default, if no status is selected, maybe show everything that isn't approved?
        // Or just show all. Let's show all for now since the user asked for filters.
    }

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: pageSize,
                orderBy: { updatedAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    vendorProfile: {
                        select: {
                            id: true,
                            companyName: true,
                            kycStatus: true,
                        },
                    },
                    oemProfile: {
                        select: {
                            id: true,
                            companyName: true,
                            kycStatus: true,
                        },
                    },
                    consultantProfile: {
                        select: {
                            id: true,
                            name: true,
                            kycStatus: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where: whereClause }),
        ]);

        return {
            approvals: users.filter(u => u.role !== Role.ADMIN), // Exclude admins from approvals list
            total,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page,
        };
    } catch (error) {
        console.error("getAdminApprovals Error:", error);
        return null;
    }
}
