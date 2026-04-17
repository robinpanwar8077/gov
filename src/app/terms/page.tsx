import { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service | GovProNet",
  description: "Terms of Service for GovProNet",
};

export default function TermsOfServicePage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <SiteHeader />
            <main className="container mx-auto py-24 px-4 max-w-4xl flex-1">
            <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>By using GovProNet, you agree to use the platform for genuine business purposes only.</p>
                <p>Users must provide accurate information during registration.</p>
                <p>GovProNet is not responsible for any direct deals, payments, or disputes between vendors, OEMs, or consultants.</p>
                <p>We reserve the right to suspend or remove any user violating platform guidelines.</p>
            </div>
            </main>
            <SiteFooter />
        </div>
    );
}
