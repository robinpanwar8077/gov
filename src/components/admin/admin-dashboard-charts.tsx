"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DollarSign, Users, Store, ShieldCheck } from "lucide-react";

interface AdminStats {
    counts: {
        totalUsers: number;
        totalVendors: number;
        activeVendors: number;
        totalOEMs: number;
        activeOEMs: number;
    };
    authStats: {
        total: number;
        approved: number;
        pending: number;
        rejected: number;
    };
    productStats: {
        total: number;
        oemProducts: number;
        vendorProducts: number;
    };
    revenueData: { name: string; amount: number }[];
    userGrowthData: { name: string; vendors: number; oems: number }[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function AdminDashboardCharts({ stats }: { stats: AdminStats }) {
    if (!stats) return null;

    const pieData = [
        { name: 'Approved', value: stats.authStats.approved },
        { name: 'Pending', value: stats.authStats.pending },
        { name: 'Rejected', value: stats.authStats.rejected },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.activeVendors}</div>
                        <p className="text-xs text-muted-foreground">/{stats.counts.totalVendors} total registered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active OEMs</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.activeOEMs}</div>
                        <p className="text-xs text-muted-foreground">/{stats.counts.totalOEMs} total registered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Across all roles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">OEM Catalog items</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.productStats.oemProducts}</div>
                        <p className="text-xs text-muted-foreground">{stats.productStats.vendorProducts} Regular items</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(stats.revenueData.reduce((acc, curr = { name: '', amount: 0 }) => acc + (curr?.amount || 0), 0) / 1000).toFixed(1)}k</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Platform Revenue Trend</CardTitle>
                        <CardDescription>
                            Monthly membership revenue growth.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={stats.revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                    width={60}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <Tooltip
                                    formatter={(value: any) => [`₹${(value || 0).toLocaleString()}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Authorization Requests</CardTitle>
                        <CardDescription>Status distribution of requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => [value, 'Requests']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New Vendor and OEM registrations.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.userGrowthData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="vendors" name="Vendors" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="oems" name="OEMs" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
