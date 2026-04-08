
export function StatsSection() {
    return (
        <section className="border-y bg-background">
            <div className="container mx-auto px-4 py-12 sm:py-16">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
                    <div className="space-y-2">
                        <h3 className="text-4xl font-extrabold tracking-tight text-blue-600">500+</h3>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Govt. Departments</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-extrabold tracking-tight text-blue-600">10k+</h3>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Verified Vendors</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-extrabold tracking-tight text-blue-600">₹2B+</h3>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Procurement Value</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-extrabold tracking-tight text-blue-600">99%</h3>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Satisfaction Rate</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
