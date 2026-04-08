import { ServiceList } from "./components/ServiceList";
import { getConsultantServicesForDashboard } from "@/lib/actions/consultant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ServicesPage() {
    const services = await getConsultantServicesForDashboard();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Services & Pricing</h1>
                <p className="text-muted-foreground">
                    Define the services you offer and their pricing models. These will be visible in your public profile.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Service Definition</CardTitle>
                    <CardDescription>
                        Adding clear service descriptions and pricing models helps potential clients understand how you can help them.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
                        <ul className="list-disc list-inside text-sm space-y-1 text-primary/80">
                            <li>List specific services like "Tender Drafting", "Compliance Audit", etc.</li>
                            <li>Provide a clear, concise description of what's included.</li>
                            <li>Add optional pricing structure to set clear expectations.</li>
                        </ul>
                    </div>

                    <ServiceList initialServices={services} />
                </CardContent>
            </Card>
        </div>
    );
}
