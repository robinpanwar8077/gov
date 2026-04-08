
"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Loader2, X, Check } from "lucide-react";
import { validateCoupon } from "@/lib/actions/membership";
import { CheckoutButton } from "./checkout-button";
import { MembershipPlan, Coupon } from "@/lib/types";
import { toast } from "sonner";

interface CheckoutWrapperProps {
    plan: MembershipPlan;
}

export function CheckoutWrapper({ plan }: CheckoutWrapperProps) {
    const [couponCode, setCouponCode] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplying(true);
        setCouponError(null);
        try {
            const res = await validateCoupon(couponCode, plan.id);
            if (res.valid && res.coupon) {
                setAppliedCoupon(res.coupon as unknown as Coupon);
                setCouponCode("");
                toast.success(`Coupon "${res.coupon.code}" applied!`);
            } else {
                setCouponError(res.message || "Invalid coupon");
                toast.error(res.message || "Invaid coupon code.");
            }
        } catch (err) {
            setCouponError("Failed to validate coupon");
            toast.error("Failed to validate coupon");
        } finally {
            setIsApplying(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponError(null);
    };

    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'PERCENTAGE') {
            discountAmount = (plan.price * appliedCoupon.discountValue) / 100;
            if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
                discountAmount = appliedCoupon.maxDiscount;
            }
        } else {
            discountAmount = appliedCoupon.discountValue;
        }
    }

    const subtotal = Math.max(0, plan.price - discountAmount);
    const gstAmount = Math.round(subtotal * 0.18);
    const total = subtotal + gstAmount;

    return (
        <div className="space-y-6">
            {/* Coupon Section */}
            <Card className="border-2 border-dashed border-slate-200 shadow-none bg-slate-50/50">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-black uppercase tracking-widest text-slate-900">Have a coupon?</span>
                    </div>

                    {!appliedCoupon ? (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter code (e.g. WELCOME10)"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="uppercase font-bold tracking-widest placeholder:normal-case placeholder:font-medium"
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                />
                                <Button
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode || isApplying}
                                    className="bg-slate-900 hover:bg-slate-800 text-xs font-black uppercase tracking-widest"
                                >
                                    {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                </Button>
                            </div>
                            {couponError && (
                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{couponError}</p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200 shadow-sm animate-in zoom-in-95">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-1.5 rounded-full">
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-green-700">{appliedCoupon.code}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                                        {appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`}
                                    </p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" onClick={removeCoupon} className="h-8 w-8 text-slate-400 hover:text-red-600">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-2 border-slate-900 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-6">
                    <CardTitle className="text-lg font-black uppercase tracking-widest">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                        <span>Base Price</span>
                        <span>₹{plan.price.toLocaleString()}</span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="flex justify-between text-sm font-semibold text-green-600">
                            <span className="flex items-center gap-1.5">
                                Coupon Discount
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-green-200 bg-green-50 text-green-700 uppercase">{appliedCoupon?.code}</Badge>
                            </span>
                            <span>- ₹{discountAmount.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-sm font-semibold text-slate-600">
                        <span>GST (18%)</span>
                        <span>₹{gstAmount.toLocaleString()}</span>
                    </div>

                    <div className="h-px bg-slate-200 my-4" />
                    <div className="flex justify-between items-baseline">
                        <span className="text-base font-black text-slate-900">Total Amount</span>
                        <div className="text-right">
                            {discountAmount > 0 && (
                                <p className="text-xs font-bold text-slate-400 line-through">₹{(plan.price * 1.18).toLocaleString()}</p>
                            )}
                            <span className="text-2xl font-black text-slate-900">₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center font-medium">Inclusive of all applicable taxes</p>
                </CardContent>
                <CardFooter className="p-6 bg-slate-50 border-t">
                    <CheckoutButton
                        planId={plan.id}
                        isFree={total === 0}
                        couponCode={appliedCoupon?.code}
                    />
                </CardFooter>
            </Card>
        </div>
    );
}
