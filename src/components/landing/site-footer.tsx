import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="bg-background border-t pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <span className="text-xl font-bold tracking-tight">GovProNet</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            The premier B2B platform connecting Government bodies, OEMs, and Vendors for compliant, efficient procurement.
                        </p>
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
