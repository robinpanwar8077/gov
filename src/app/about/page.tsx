import { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "About Us | GovProNet",
  description: "About GovProNet",
};

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <SiteHeader />
            <main className="container mx-auto py-24 px-4 max-w-4xl flex-1">
            <h1 className="text-4xl font-bold mb-8 text-foreground">About Us</h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>GovProNet is India’s trusted GovB2B network connecting GeM vendors, OEMs, and consultants on one transparent and secure platform.</p>
                <p>We help vendors access genuine OEM authorizations, build trusted relationships, and win consistent government business without confusion or risk.</p>
                <p>Our mission is to simplify government procurement by creating a verified, compliance-driven ecosystem where every connection is real and every opportunity is meaningful.</p>
                <p>GovProNet is built for serious business growth — not just networking.</p>
            </div>
            </main>
            <SiteFooter />
        </div>
    );
}
