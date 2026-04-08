
"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

import { sendPaymentConfirmationEmail } from "@/lib/email";

// Cashfree API Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "PRODUCTION";
const CASHFREE_API_URL =
    CASHFREE_ENV === "PRODUCTION"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

export async function activateFreePlan(planId: string, couponCode?: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId }
    });
    if (!plan) throw new Error("Invalid plan");

    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
        const validation = await validateCoupon(couponCode, planId);
        if (validation.valid && validation.coupon) {
            const coupon = validation.coupon;
            couponId = coupon.id;
            if (coupon.discountType === 'PERCENTAGE') {
                discountAmount = (plan.price * coupon.discountValue) / 100;
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            } else {
                discountAmount = coupon.discountValue;
            }
        }
    }

    const subtotal = Math.max(0, plan.price - discountAmount);
    if (subtotal > 0) throw new Error("Invalid operation for this plan; payment required.");

    // Check if user already has an active membership
    const existing = await prisma.membership.findFirst({
        where: {
            userId: session.id as string,
            isActive: true,
            validUntil: { gt: new Date() }
        }
    });

    if (existing) throw new Error("You already have an active membership");

    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (plan.durationDays || 3650));

    // Create a payment record for the free activation
    const payment = await prisma.payment.create({
        data: {
            userId: session.id as string,
            amount: 0,
            currency: "INR",
            status: "COMPLETED",
            couponId: couponId,
            discountAmount: discountAmount,
        }
    });

    const membership = await prisma.membership.create({
        data: {
            userId: session.id as string,
            planId: plan.id,
            planName: plan.name,
            validFrom,
            validUntil,
            isActive: true,
            paymentId: payment.id,
        }
    });

    if (couponId) {
        await prisma.coupon.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } }
        });
    }

    await prisma.auditLog.create({
        data: {
            userId: session.id as string,
            action: couponCode ? "COUPON_FREE_PLAN_ACTIVATED" : "FREE_PLAN_ACTIVATED",
            details: `Activated plan: ${plan.name} (${planId})${couponCode ? ` using coupon ${couponCode}` : ''}`,
        }
    });

    revalidatePath("/vendor/dashboard");
    revalidatePath("/membership");

    return {
        success: true,
        membershipId: membership.id,
        paymentId: payment.id
    };
}

export async function recordPaymentFailure(paymentId: string, errorDetails: any) {
    const session = await getSession();
    if (!session) return;

    await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: "FAILED",
        }
    });

    await prisma.auditLog.create({
        data: {
            userId: session.id as string,
            action: "PAYMENT_FAILED",
            details: `Payment failure for ID: ${paymentId}. Error: ${JSON.stringify(errorDetails)}`,
        }
    });
}

export async function validateCoupon(code: string, planId: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!coupon) {
        return { valid: false, message: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
        return { valid: false, message: "Coupon is no longer active" };
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
        return { valid: false, message: "Coupon has expired or is not yet valid" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, message: "Coupon usage limit reached" };
    }

    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan) return { valid: false, message: "Invalid plan" };

    if (coupon.applicablePlans.length > 0) {
        const isApplicable = coupon.applicablePlans.includes(plan.id) || coupon.applicablePlans.includes(plan.slug);
        if (!isApplicable) {
            return { valid: false, message: "Coupon is not applicable to this plan" };
        }
    }

    if (coupon.minAmount && plan.price < coupon.minAmount) {
        return { valid: false, message: `Minimum amount of ₹${coupon.minAmount} required` };
    }

    return { valid: true, coupon };
}

export async function createPaymentOrder(planId: string, couponCode?: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId }
    });
    if (!plan) throw new Error("Invalid plan");

    // Get user details for Cashfree
    const user = await prisma.user.findUnique({
        where: { id: session.id as string }
    });
    if (!user) throw new Error("User not found");

    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
        const validation = await validateCoupon(couponCode, planId);
        if (validation.valid && validation.coupon) {
            const coupon = validation.coupon;
            couponId = coupon.id;
            if (coupon.discountType === 'PERCENTAGE') {
                discountAmount = (plan.price * coupon.discountValue) / 100;
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            } else {
                discountAmount = coupon.discountValue;
            }
        }
    }

    const subtotal = Math.max(0, plan.price - discountAmount);
    const amountToCharge = Math.round(subtotal * 1.18 * 100) / 100; // Including 18% GST, rounded to 2 decimal places

    // Generate a unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
        // Cashfree Create Order API
        const response = await fetch(`${CASHFREE_API_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
            },
            body: JSON.stringify({
                order_id: orderId,
                order_amount: amountToCharge,
                order_currency: "INR",
                customer_details: {
                    customer_id: session.id as string,
                    customer_email: user.email,
                    customer_phone: user.mobile || "9999999999",
                    customer_name: user.email.split("@")[0],
                },
                order_meta: {
                    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://govpronet.com"}/api/cashfree/callback?order_id={order_id}`,
                },
                order_note: `Membership - ${plan.name}`,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree Order Creation Error:", data);
            throw new Error(data.message || "Failed to create payment order");
        }

        // Create a pending payment record
        const payment = await prisma.payment.create({
            data: {
                userId: session.id as string,
                amount: amountToCharge,
                currency: "INR",
                status: "PENDING",
                cashfreeOrderId: orderId,
                couponId: couponId,
                discountAmount: discountAmount,
            }
        });

        return {
            success: true,
            orderId: orderId,
            paymentSessionId: data.payment_session_id,
            amount: amountToCharge,
            currency: "INR",
            paymentId: payment.id,
            planId: planId,
        };
    } catch (error: any) {
        console.error("Cashfree Order Creation Error:", error);
        throw new Error(error.message || "Failed to create payment order");
    }
}

export async function verifyPayment(
    paymentId: string,
    planId: string,
    cashfreeOrderId: string
) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId }
    });
    if (!plan) throw new Error("Invalid plan");

    try {
        // Verify payment via Cashfree Get Order API
        const response = await fetch(`${CASHFREE_API_URL}/orders/${cashfreeOrderId}`, {
            method: "GET",
            headers: {
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
            },
        });

        const orderData = await response.json();

        if (!response.ok) {
            throw new Error("Failed to verify payment with Cashfree");
        }

        const isPaymentSuccessful = orderData.order_status === "PAID";

        if (!isPaymentSuccessful) {
            await prisma.payment.update({
                where: { id: paymentId },
                data: { status: "FAILED" }
            });
            throw new Error(`Payment not completed. Status: ${orderData.order_status}`);
        }

        // Get the Cashfree payment ID from the payments endpoint
        const paymentsResponse = await fetch(`${CASHFREE_API_URL}/orders/${cashfreeOrderId}/payments`, {
            method: "GET",
            headers: {
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
            },
        });

        const paymentsData = await paymentsResponse.json();
        const cfPaymentId = Array.isArray(paymentsData) && paymentsData.length > 0
            ? paymentsData[0].cf_payment_id?.toString()
            : cashfreeOrderId;

        // Update payment status
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: "COMPLETED",
                cashfreePaymentId: cfPaymentId,
            },
            include: { coupon: true, user: true }
        });

        // If coupon used, increment use count
        if (updatedPayment.couponId) {
            await prisma.coupon.update({
                where: { id: updatedPayment.couponId },
                data: { usedCount: { increment: 1 } }
            });
        }

        // Create or Update Membership
        const validFrom = new Date();
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + (plan.durationDays || 30));

        const membership = await prisma.membership.create({
            data: {
                userId: session.id as string,
                planId: plan.id,
                planName: plan.name,
                validFrom,
                validUntil,
                isActive: true,
                paymentId: updatedPayment.id,
            }
        });

        // Send Email Notification
        if (updatedPayment.user.email) {
            await sendPaymentConfirmationEmail(
                updatedPayment.user.email,
                "Valued Customer",
                updatedPayment.amount,
                plan.name,
                cfPaymentId
            );
        }

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.id as string,
                action: "MEMBERSHIP_PURCHASED",
                details: `Purchased plan: ${plan.name} (${planId}). Cashfree Order: ${cashfreeOrderId}, Payment: ${cfPaymentId}`,
            }
        });

        revalidatePath("/vendor/dashboard");
        revalidatePath("/membership");

        return {
            success: true,
            membershipId: membership.id,
            paymentId: updatedPayment.id
        };
    } catch (error: any) {
        console.error("Cashfree Payment Verification Error:", error);
        throw new Error(error.message || "Payment verification failed");
    }
}

// Keep the stub for developer testing if needed.
export async function verifyPaymentStub(paymentId: string, planId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const plan = await prisma.membershipPlan.findUnique({
        where: { id: planId }
    });
    if (!plan) throw new Error("Invalid plan");

    const cashfreePaymentId = `cf_stub_${Math.random().toString(36).substring(7)}`;

    const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: "COMPLETED",
            cashfreePaymentId: cashfreePaymentId,
        }
    });

    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (plan.durationDays || 30));

    const membership = await prisma.membership.create({
        data: {
            userId: session.id as string,
            planId: plan.id,
            planName: plan.name,
            validFrom,
            validUntil,
            isActive: true,
            paymentId: updatedPayment.id,
        }
    });

    await prisma.auditLog.create({
        data: {
            userId: session.id as string,
            action: "MEMBERSHIP_PURCHASED_STUB",
            details: `STUB: Purchased plan: ${plan.name} (${planId})`,
        }
    });

    revalidatePath("/vendor/dashboard");
    revalidatePath("/membership");

    return {
        success: true,
        membershipId: membership.id,
        paymentId: updatedPayment.id
    };
}
