"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getReportData, ReportType } from "@/lib/actions/admin-reports";

type ExportFormat = "CSV" | "PDF";

export function ReportExporter() {
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const handleDownload = async (type: ReportType, format: ExportFormat) => {
        const loadingKey = `${type}-${format}`;
        setLoading(prev => ({ ...prev, [loadingKey]: true }));

        try {
            const data = await getReportData(type);

            if (!data || data.length === 0) {
                alert(`No data available for ${type} report.`);
                return;
            }

            if (format === "CSV") {
                downloadCSV(data, `${type}_Report_${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                downloadPDF(data, type);
            }
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const downloadCSV = (data: any[], filename: string) => {
        if (!data.length) return;
        const header = Object.keys(data[0]).join(",");

        // Escape quotes and handle commas in values
        const csvRows = data.map(obj => Object.values(obj).map(v => {
            const val = v === null ? '' : v;
            const stringVal = String(val);
            return stringVal.includes(',') || stringVal.includes('"')
                ? `"${stringVal.replace(/"/g, '""')}"`
                : stringVal;
        }).join(","));

        const csvContent = [header, ...csvRows].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const downloadPDF = (data: any[], type: ReportType) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`${type} Report`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const headers = Object.keys(data[0]);
        const rows = data.map(obj => Object.values(obj));

        autoTable(doc, {
            head: [headers],
            body: rows as any[],
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 66, 66] }
        });

        doc.save(`${type}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <Card className="col-span-4 mt-6">
            <CardHeader>
                <CardTitle>System Reports & Exports</CardTitle>
                <CardDescription>
                    Download key performance metrics and compliance reports.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* GMV Report */}
                    <div className="flex flex-col space-y-3 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">GMV / Revenue Report</h4>
                                <p className="text-xs text-muted-foreground">Monthly revenue breakdown</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload("GMV", "CSV")} disabled={loading["GMV-CSV"]}>
                                {loading["GMV-CSV"] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload("GMV", "PDF")} disabled={loading["GMV-PDF"]}>
                                {loading["GMV-PDF"] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                                PDF
                            </Button>
                        </div>
                    </div>

                    {/* Attendance Report */}
                    <div className="flex flex-col space-y-3 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-500/10 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Event Attendance</h4>
                                <p className="text-xs text-muted-foreground">User participation stats</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload("ATTENDANCE", "CSV")} disabled={loading["ATTENDANCE-CSV"]}>
                                {loading["ATTENDANCE-CSV"] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload("ATTENDANCE", "PDF")} disabled={loading["ATTENDANCE-PDF"]}>
                                {loading["ATTENDANCE-PDF"] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                                PDF
                            </Button>
                        </div>
                    </div>

                    {/* KYC Summary */}
                    <div className="flex flex-col space-y-3 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-500/10 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">KYC Compliance Summary</h4>
                                <p className="text-xs text-muted-foreground">Entity verification status</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload("KYC", "CSV")} disabled={loading["KYC-CSV"]}>
                                {loading["KYC-CSV"] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload("KYC", "PDF")} disabled={loading["KYC-PDF"]}>
                                {loading["KYC-PDF"] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                                PDF
                            </Button>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
