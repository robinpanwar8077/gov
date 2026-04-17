import { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | GovProNet",
  description: "Privacy Policy for GovProNet",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <SiteHeader />
            <main className="container mx-auto py-24 px-4 max-w-4xl flex-1">
            <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>We respect your privacy. GovProNet collects basic user information such as name, contact details, and business information to provide better services.</p>
                <p>We do not sell or share your data with third parties without consent.</p>
                <p>All data is securely stored and used only for platform-related communication and services.</p>
            </div>
            </main>
            <SiteFooter />
        </div>
    );
}
