import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("order_id");

    if (!orderId) {
        return NextResponse.redirect(new URL("/membership?error=missing_order_id", request.url));
    }

    try {
        // Find payment by cashfreeOrderId
        const payment = await prisma.payment.findFirst({
            where: { cashfreeOrderId: orderId },
            include: { membership: true }
        });

        if (!payment) {
            return NextResponse.redirect(new URL("/membership?error=payment_not_found", request.url));
        }

        // If payment already completed and membership exists, redirect to success
        if (payment.status === "COMPLETED" && payment.membership) {
            return NextResponse.redirect(
                new URL(`/membership/success?id=${payment.membership.id}`, request.url)
            );
        }

        // If payment is still pending, redirect to a page that will trigger verification
        // The checkout page will handle the verification when the user returns
        return NextResponse.redirect(
            new URL(`/membership/verify?paymentId=${payment.id}&orderId=${orderId}&planId=${payment.membership?.planId || ""}`, request.url)
        );
    } catch (error) {
        console.error("Cashfree callback error:", error);
        return NextResponse.redirect(new URL("/membership?error=callback_failed", request.url));
    }
}
