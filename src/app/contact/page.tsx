import { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "Contact Us | GovProNet",
  description: "Contact GovProNet",
};

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <SiteHeader />
            <main className="container mx-auto py-24 px-4 max-w-4xl flex-1">
            <h1 className="text-4xl font-bold mb-8 text-foreground">Contact Us</h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg border bg-card p-8 rounded-xl shadow-sm">
                <div className="flex flex-col space-y-6">
                    <p className="flex items-center gap-3">
                        <span className="text-2xl">📞</span> 
                        <span className="font-medium text-foreground">Phone:</span> 
                        <a href="tel:+918432518911" className="hover:text-primary transition-colors">+91 8432518911</a>
                    </p>
                    <p className="flex items-center gap-3">
                        <span className="text-2xl">💬</span> 
                        <span className="font-medium text-foreground">WhatsApp:</span> 
                        <a href="https://wa.me/918432518911" target="_blank" className="hover:text-primary transition-colors">+91 8432518911</a>
                    </p>
                    <p className="flex items-center gap-3">
                        <span className="text-2xl">📧</span> 
                        <span className="font-medium text-foreground">Email:</span> 
                        <a href="mailto:info@govpronet.com" className="hover:text-primary transition-colors">info@govpronet.com</a>
                    </p>
                    <p className="flex items-center gap-3">
                        <span className="text-2xl">📍</span> 
                        <span className="font-medium text-foreground">Location:</span> 
                        <span>Pune, India</span>
                    </p>
                </div>
                <div className="mt-8 pt-6 border-t text-sm font-medium">
                    We usually respond within <span className="text-primary">24 hours</span>.
                </div>
            </div>
            </main>
            <SiteFooter />
        </div>
    );
}
