"use server";

import prisma from "@/lib/db";
import { KYCStatus } from "@/lib/types";

export async function searchVendors(params: {
    query?: string,
    categoryId?: string,
    location?: string,
    page?: number,
    pageSize?: number
}) {
    const { query, categoryId, location, page = 1, pageSize = 12 } = params;

    const where: any = { kycStatus: KYCStatus.APPROVED };

    if (query) {
        where.OR = [
            { companyName: { contains: query, mode: 'insensitive' } },
            { contactPerson: { contains: query, mode: 'insensitive' } },
            { gst: { contains: query, mode: 'insensitive' } }
        ];
    }

    if (categoryId) {
        where.categories = {
            some: { id: categoryId }
        };
    }

    if (location) {
        where.registeredAddress = { contains: location, mode: 'insensitive' };
    }

    try {
        const skip = (page - 1) * pageSize;

        const [results, total] = await Promise.all([
            prisma.vendorProfile.findMany({
                where,
                include: {
                    user: { select: { email: true, mobile: true } },
                    categories: { select: { id: true, name: true } },
                    _count: {
                        select: { authRequests: { where: { status: 'APPROVED' } } }
                    }
                },
                skip,
                take: pageSize,
                orderBy: { companyName: 'asc' }
            }),
            prisma.vendorProfile.count({ where })
        ]);

        return {
            results,
            total,
            page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (e) {
        console.error("Search Vendors Error:", e);
        return { results: [], total: 0, page: 1, totalPages: 0 };
    }
}

export async function searchOEMs(params: {
    query?: string,
    categoryId?: string,
    page?: number,
    pageSize?: number
}) {
    const { query, categoryId, page = 1, pageSize = 12 } = params;

    const where: any = { kycStatus: KYCStatus.APPROVED };

    if (query) {
        where.OR = [
            { companyName: { contains: query, mode: 'insensitive' } },
            { contactPerson: { contains: query, mode: 'insensitive' } },
            { registrationNumber: { contains: query, mode: 'insensitive' } }
        ];
    }

    if (categoryId) {
        where.catalog = {
            some: { categoryId: categoryId }
        };
    }

    try {
        const skip = (page - 1) * pageSize;

        const [results, total] = await Promise.all([
            prisma.oEMProfile.findMany({
                where,
                include: {
                    user: { select: { email: true, mobile: true } },
                    _count: {
                        select: { catalog: true, receivedRequests: { where: { status: 'APPROVED' } } }
                    },
                    // Fetch top product categories for this OEM
                    catalog: {
                        take: 3,
                        select: { category: { select: { id: true, name: true } } },
                        distinct: ['categoryId']
                    }
                },
                skip,
                take: pageSize,
                orderBy: { companyName: 'asc' }
            }),
            prisma.oEMProfile.count({ where })
        ]);

        return {
            results: results.map(oem => ({
                ...oem,
                topCategories: oem.catalog.map(item => item.category).filter(Boolean)
            })),
            total,
            page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (e) {
        console.error("Search OEMs Error:", e);
        return { results: [], total: 0, page: 1, totalPages: 0 };
    }
}

export async function searchConsultants(params: {
    query?: string,
    categoryId?: string,
    page?: number,
    pageSize?: number
}) {
    const { query, categoryId, page = 1, pageSize = 12 } = params;

    const where: any = { kycStatus: KYCStatus.APPROVED };

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { firmName: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } }
        ];
    }

    if (categoryId) {
        where.categories = {
            some: { id: categoryId }
        };
    }

    try {
        const skip = (page - 1) * pageSize;

        const [results, total] = await Promise.all([
            prisma.consultantProfile.findMany({
                where,
                include: {
                    user: { select: { email: true, mobile: true } },
                    categories: true,
                    _count: {
                        select: { services: { where: { isActive: true } } }
                    },
                    services: {
                        where: { isActive: true },
                        take: 2,
                        select: { title: true }
                    }
                },
                skip,
                take: pageSize,
                orderBy: { name: 'asc' }
            }),
            prisma.consultantProfile.count({ where })
        ]);

        return {
            results,
            total,
            page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (e) {
        console.error("Search Consultants Error:", e);
        return { results: [], total: 0, page: 1, totalPages: 0 };
    }
}

export async function getVendorBySlug(slug: string, onlyApproved = true) {
    try {
        const where: any = {
            OR: [
                { slug: slug },
                { id: slug }
            ]
        };

        if (onlyApproved) {
            where.kycStatus = KYCStatus.APPROVED;
        }

        const vendor = await prisma.vendorProfile.findFirst({
            where,
            include: {
                user: { select: { email: true, mobile: true } },
                categories: true,
                products: true,
                authRequests: {
                    where: { status: 'APPROVED' },
                    include: { product: true, oem: true }
                }
            }
        });
        return vendor;
    } catch (e) {
        return null;
    }
}

export async function getOEMBySlug(slug: string, onlyApproved = true) {
    try {
        const where: any = {
            OR: [
                { slug: slug },
                { id: slug }
            ]
        };

        if (onlyApproved) {
            where.kycStatus = KYCStatus.APPROVED;
        }

        const oem = await prisma.oEMProfile.findFirst({
            where,
            include: {
                user: { select: { email: true, mobile: true } },
                catalog: true
            }
        });
        return oem;
    } catch (e) {
        return null;
    }
}

export async function getConsultantBySlug(slug: string, onlyApproved = true) {
    try {
        const where: any = {
            OR: [
                { slug: slug },
                { id: slug }
            ]
        };

        if (onlyApproved) {
            where.kycStatus = KYCStatus.APPROVED;
        }

        const consultant = await prisma.consultantProfile.findFirst({
            where,
            include: {
                user: { select: { email: true, mobile: true } },
                categories: true,
                services: {
                    where: { isActive: true }
                }
            }
        });
        return consultant;
    } catch (e) {
        return null;
    }
}

export async function getProductById(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                oem: {
                    include: { user: { select: { email: true, mobile: true } } }
                },
                media: true,
                category: true,
                subCategory: true
            }
        });
        return product;
    } catch (e) {
        return null;
    }
}

export async function searchProducts(params: {
    query?: string,
    categoryId?: string,
    subCategoryId?: string,
    page?: number,
    pageSize?: number
}) {
    const { query, categoryId, subCategoryId, page = 1, pageSize = 12 } = params;

    const where: any = {
        isArchived: false,
        NOT: { oemId: null }, // Only OEM products
        oem: {
            kycStatus: KYCStatus.APPROVED
        }
    };

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (subCategoryId) {
        where.subCategoryId = subCategoryId;
    }

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { oem: { companyName: { contains: query, mode: 'insensitive' } } }
        ];
    }

    try {
        const skip = (page - 1) * pageSize;

        const [results, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    oem: true,
                    category: true,
                    subCategory: true,
                    media: { take: 1 }
                },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({ where })
        ]);

        return {
            results,
            total,
            page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (e) {
        console.error("Search Products Error:", e);
        return { results: [], total: 0, page: 1, totalPages: 0 };
    }
}
