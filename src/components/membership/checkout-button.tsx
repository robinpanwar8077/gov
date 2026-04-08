
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPaymentOrder, verifyPayment, activateFreePlan, recordPaymentFailure } from "@/lib/actions/membership";
import { useRouter } from "next/navigation";
import { Loader2, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import Script from "next/script";
import { toast } from "sonner";

interface CheckoutButtonProps {
    planId: string;
    isFree?: boolean;
    couponCode?: string;
}

declare global {
    interface Window {
        Cashfree: any;
    }
}

export function CheckoutButton({ planId, isFree, couponCode }: CheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [sdkReady, setSdkReady] = useState(false);
    const router = useRouter();

    const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox";

    const handleCheckout = async () => {
        setIsLoading(true);
        setStatus({ type: 'info', message: isFree ? "Activating plan..." : "Initializing payment..." });

        let currentPaymentId: string | null = null;

        try {
            if (isFree) {
                const res = await activateFreePlan(planId, couponCode);
                if (res.success) {
                    setStatus({ type: 'success', message: "Plan Activated! Redirecting..." });
                    toast.success("Free plan activated successfully.");
                    setTimeout(() => router.push(`/membership/success?id=${res.membershipId}`), 1500);
                } else {
                    setStatus({ type: 'error', message: "Activation failed." });
                    toast.error("Failed to activate free plan.");
                }
                return;
            }

            // 1. Create Order on Server – get paymentSessionId from Cashfree
            const orderRes = await createPaymentOrder(planId, couponCode);

            if (!orderRes.success) {
                throw new Error("Failed to create order");
            }

            currentPaymentId = orderRes.paymentId;

            // 2. Open Cashfree Checkout
            if (!window.Cashfree) {
                throw new Error("Cashfree SDK not loaded. Please refresh and try again.");
            }

            const cashfree = window.Cashfree({ mode: cashfreeEnv });

            const checkoutOptions = {
                paymentSessionId: orderRes.paymentSessionId,
                redirectTarget: "_modal", // Opens in a modal overlay
            };

            const result = await cashfree.checkout(checkoutOptions);

            // After the modal closes, verify the payment
            if (result.error) {
                // Payment was not completed (user closed or error)
                if (currentPaymentId) {
                    await recordPaymentFailure(currentPaymentId, { stage: 'checkout', error: result.error.message });
                }
                setStatus({
                    type: 'error',
                    message: result.error.message || "Payment was not completed. You can try again whenever you're ready."
                });
                setIsLoading(false);
                return;
            }

            if (result.redirect) {
                // Payment was redirected – the callback URL will handle this
                // This case should not happen with _modal target but handle gracefully
                setStatus({ type: 'info', message: "Verifying payment..." });
                return;
            }

            if (result.paymentDetails) {
                // Payment completed in modal – verify server-side
                setStatus({ type: 'info', message: "Verifying payment..." });
                toast.info("Payment confirmed by provider. Finalizing...");

                try {
                    const verifyRes = await verifyPayment(
                        orderRes.paymentId,
                        planId,
                        orderRes.orderId
                    );

                    if (verifyRes.success) {
                        setStatus({ type: 'success', message: "Membership Activated! Redirecting..." });
                        toast.success("Membership successfully activated!");
                        setTimeout(() => {
                            router.push(`/membership/success?id=${verifyRes.membershipId}`);
                        }, 1500);
                    }
                } catch (err: any) {
                    if (currentPaymentId) {
                        await recordPaymentFailure(currentPaymentId, { stage: 'verification', error: err.message });
                    }
                    setStatus({ type: 'error', message: err.message || "Verification failed" });
                    toast.error(err.message || "Verification failed");
                    setIsLoading(false);
                }
            }

        } catch (error: any) {
            console.error(error);
            if (currentPaymentId) {
                await recordPaymentFailure(currentPaymentId, { stage: 'initiation', error: error.message });
            }
            setStatus({
                type: 'error',
                message: error.message || "There was an error initializing your payment."
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <Script
                id="cashfree-checkout-js"
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                onReady={() => setSdkReady(true)}
            />

            {status && (
                <div className={`p-4 rounded-xl flex items-start gap-3 text-xs font-bold uppercase tracking-tight transition-all animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                    status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                        'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                    <div className="mt-0.5">
                        {status.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {status.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                        {status.type === 'info' && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
                    </div>
                    <span>{status.message}</span>
                </div>
            )}

            <Button
                className="w-full h-14 text-base font-black uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
                onClick={handleCheckout}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Proceed to Pay <Zap className="w-4 h-4 fill-white" />
                    </>
                )}
            </Button>
        </div>
    );
}
