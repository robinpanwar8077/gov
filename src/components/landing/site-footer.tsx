import Link from "next/link";
import { Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";
import Image from "next/image";

export function SiteFooter() {
    return (
        <footer className="bg-background border-t pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <Link href="/" className="flex items-center gap-3 mb-6 group">
                            <div className="relative h-16 w-16 transition-transform ">
                                <Image
                                    src="/Lo.png"
                                    alt="GovProNet Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#10b981] transition-colors">GovProNet</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
                            The premier B2B platform connecting Government bodies, OEMs, and Vendors for compliant, efficient procurement.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="https://www.facebook.com/profile.php?id=61587868521022" target="_blank" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-[#10b981] hover:text-white transition-all">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="https://www.instagram.com/govpronet/" target="_blank" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-[#E4405F] hover:text-white transition-all">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-[#0A66C2] hover:text-white transition-all">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-[#25D366] hover:text-white transition-all">
                                <MessageCircle className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-foreground">Platform</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/directory" className="hover:text-primary">Directory</Link></li>
                            <li><Link href="/tenders" className="hover:text-primary">Tenders</Link></li>
                            <li><Link href="/membership" className="hover:text-primary">Membership</Link></li>
                            <li><Link href="/resources" className="hover:text-primary">Resources</Link></li>
                            <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-foreground">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider text-foreground">Legal</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                            <li><Link href="/compliance" className="hover:text-primary">Compliance</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} GovProNet. All rights reserved.</p>
                    <p>Made for the Future of Governance.</p>
                </div>
            </div>
        </footer>
    );
}
