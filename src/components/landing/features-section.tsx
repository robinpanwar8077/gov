import {
    ShieldCheck,
    Search,
    Users,
    FileText,
    Award,
    Zap
} from "lucide-react";

const features = [
    {
        icon: Search,
        title: "Smart Discovery",
        description: "Find the right partners instantly with our AI-powered search across thousands of categorized capabilities."
    },
    {
        icon: ShieldCheck,
        title: "Verified Compliance",
        description: "Every entity is vetted. KYC and compliance checks ensure you only deal with legitimate businesses."
    },
    {
        icon: Users,
        title: "Direct Connection",
        description: "Message Vendors, OEMs, and Consultants directly. No middlemen, just transparent communication."
    },
    {
        icon: FileText,
        title: "Tender Management",
        description: "Organize and track tender responses efficiently. Never miss a deadline with automated alerts."
    },
    {
        icon: Award,
        title: "Reputation Scoring",
        description: "Build trust through transparent reviews and ratings from previous government contracts."
    },
    {
        icon: Zap,
        title: "Instant Authorization",
        description: "Streamline the Manufacturer Authorization Form (MAF) process digital workflows."
    }
];

export function FeaturesSection() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Capabilities</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Everything you need to navigate the government procurement landscape.</p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-2xl border bg-background p-8 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
