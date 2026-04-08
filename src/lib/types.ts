import { Role, KYCStatus, AuthStatus, KYCDocStatus } from "@prisma/client";

export { Role, KYCStatus, AuthStatus, KYCDocStatus };


export interface User {
    id: string;
    email: string;
    mobile?: string | null;
    passwordHash: string;
    role?: Role | null;
    isVerified: boolean;
    mobileOtp?: string | null;
    emailOtp?: string | null;
    otpExpiry?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface VendorProfile {
    id: string;
    userId: string;
    companyName: string;
    slug?: string | null;
    pan?: string | null;
    gst?: string | null;
    onboardingStep: number;
    kycStatus: KYCStatus;
}

export interface OEMProfile {
    id: string;
    userId: string;
    companyName: string;
    slug?: string | null;
    kycStatus: KYCStatus;
}

export interface ConsultantProfile {
    id: string;
    userId: string;
    name: string;
    firmName?: string | null;
    slug?: string | null;
    bio?: string | null;
    experience?: number | null;
    keyServices?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    officeAddress?: string | null;
    kycStatus: KYCStatus;
    services?: ConsultantService[];
}

export interface ConsultantService {
    id: string;
    consultantId: string;
    title: string;
    description: string;
    pricingModel?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConsultingCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
}

export interface KYCDocument {
    id: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: Date;
    vendorId?: string | null;
    oemId?: string | null;
    consultantId?: string | null;
}

export interface Product {
    id: string;
    name: string;
    description?: string | null;
    sku?: string | null;
    oemId?: string | null;
    vendorId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
    media?: ProductMedia[];
}

export interface ProductMedia {
    id: string;
    url: string;
    type: string;
    fileName: string;
    productId: string;
    createdAt: Date;
}

export interface AuthorizationRequest {
    id: string;
    vendorId: string;
    oemId: string;
    productId: string;
    status: AuthStatus;
    notes?: string | null;
    oemComment?: string | null;
    adminComment?: string | null;
    isLocked: boolean;
    oem?: OEMProfile;
    product?: Product;
    documents: AuthRequestDocument[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthRequestDocument {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    requestId: string;
    createdAt: Date;
}


export interface MembershipPlan {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    durationDays: number;
    features: string[];
    type: string;
    isRecommended: boolean;
    tag: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Membership {
    id: string;
    userId: string;
    planId: string | null;
    plan?: MembershipPlan;
    planName: string;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    createdAt: Date;
}

export interface Payment {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    cashfreeOrderId?: string | null;
    cashfreePaymentId?: string | null;
    couponId?: string | null;
    discountAmount?: number | null;
    createdAt: Date;
}

export interface Coupon {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    minAmount?: number | null;
    maxDiscount?: number | null;
    validFrom: Date;
    validUntil: Date;
    usageLimit?: number | null;
    usedCount: number;
    isActive: boolean;
    applicablePlans: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Conversation {
    id: string;
    participants: Partial<User>[];
    messages: Message[];
    lastMessageAt: Date;
    createdAt: Date;
    otherParticipantName?: string;
    lastMessage?: Message;
    unreadCount?: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    sender?: Partial<User>;
    content: string;
    isRead: boolean;
    createdAt: Date;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export interface AuditLog {
    id: string;
    userId?: string | null;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    createdAt: Date;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type FormState = {
    error?: string;
    success?: boolean;
    redirect?: string;
    fields?: Record<string, string>;
}
