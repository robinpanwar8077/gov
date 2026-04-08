import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getAdminDashboardMetrics } from "@/lib/actions/admin";
import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts";
import { ReportExporter } from "@/components/admin/report-exporter";
import { DashboardDateFilters } from "@/components/dashboard-date-filters";
import { AlertCircle } from "lucide-react";

export default async function Dashboard({
    searchParams
}: {
    searchParams: Promise<{ range?: string }>
}) {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
        redirect("/login");
    }

    const params = await searchParams;
    const range = params.range || "ALL";
    const stats = await getAdminDashboardMetrics(range);

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-red-50 rounded-lg">
                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                <h3 className="text-lg font-bold text-red-700">Unable to load dashboard</h3>
                <p className="text-red-600">Please try again later or contact support.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">System Command Center</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Platform-wide metrics and administrative controls.
                    </p>
                </div>
            </div>

            <DashboardDateFilters defaultRange={range} basePath="/admin/dashboard" />

            <AdminDashboardCharts stats={stats} />
            <ReportExporter />
        </div>
    )
}
