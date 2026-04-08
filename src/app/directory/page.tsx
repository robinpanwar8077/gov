
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Factory, Briefcase, Package } from "lucide-react"

export default function DirectoryHubPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-2">GovProNet Directory</h1>
            <p className="text-muted-foreground mb-10">Explore our network of trusted partners.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/directory/vendors">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <CardTitle>Vendors</CardTitle>
                            <CardDescription>
                                Find authorized distributors and resellers for government projects.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/directory/oems">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-t-4 border-t-green-500">
                        <CardHeader>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Factory className="h-5 w-5 text-green-600" />
                            </div>
                            <CardTitle>OEMs</CardTitle>
                            <CardDescription>
                                Connect with Original Equipment Manufacturers and product owners.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/directory/products">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-t-4 border-t-orange-500">
                        <CardHeader>
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <Package className="h-5 w-5 text-orange-600" />
                            </div>
                            <CardTitle>OEM Products</CardTitle>
                            <CardDescription>
                                Discover high-quality products from verified manufacturers.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/directory/consultants">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-t-4 border-t-purple-500">
                        <CardHeader>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <Briefcase className="h-5 w-5 text-purple-600" />
                            </div>
                            <CardTitle>Consultants</CardTitle>
                            <CardDescription>
                                Hire experts for legal, compliance, and technical consultation.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
