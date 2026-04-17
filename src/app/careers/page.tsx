import { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "Careers | GovProNet",
  description: "Careers at GovProNet",
};

export default function CareersPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <SiteHeader />
            <main className="container mx-auto py-24 px-4 max-w-4xl flex-1">
            <h1 className="text-4xl font-bold mb-8 text-foreground">Careers</h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>Join GovProNet and be part of building India’s most trusted government business network.</p>
                <p>We are always looking for passionate individuals in sales, operations, and technology.</p>
                <p>Send your resume at: <strong><a href="mailto:info@govpronet.com" className="text-primary hover:underline">info@govpronet.com</a></strong></p>
            </div>
            </main>
            <SiteFooter />
        </div>
    );
}
