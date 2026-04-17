import { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "Compliance | GovProNet",
  description: "Compliance for GovProNet",
};

export default function CompliancePage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <SiteHeader />
            <main className="container mx-auto py-24 px-4 max-w-4xl flex-1">
            <h1 className="text-4xl font-bold mb-8 text-foreground">Compliance</h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>GovProNet is a private B2B platform built for GeM ecosystem participants.</p>
                <p>We are not affiliated with, endorsed by, or connected to any government authority, including GeM.</p>
                <p>All connections and verifications are conducted independently within our platform.</p>
            </div>
            </main>
            <SiteFooter />
        </div>
    );
}
