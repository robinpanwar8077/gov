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
    Legend
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, TrendingUp, CheckCircle, Clock, XCircle, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OEMStats {
    authStats: {
        approved: number;
        pending: number;
        rejected: number;
        total: number;
    };
    productViewsData: {
        name: string;
        views: number;
        unique: number;
    }[];
    gmvData: {
        name: string;
        amount: number;
    }[];
    recentActivities: {
        id: string;
        type: string;
        message: string;
        date: Date;
    }[];
    activeCatalogCount: number;
    totalCatalogCount: number;
}

export function OEMDashboardCharts({ stats }: { stats: OEMStats }) {
    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.authStats.total}</div>
                        <p className="text-xs text-muted-foreground">Authorization requests received</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.authStats.total > 0
                                ? Math.round((stats.authStats.approved / stats.authStats.total) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.authStats.approved} approved, {stats.authStats.rejected} rejected
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.authStats.pending}</div>
                        <p className="text-xs text-muted-foreground">Requires your attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <Eye className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeCatalogCount}</div>
                        <p className="text-xs text-muted-foreground">Of {stats.totalCatalogCount} total products listed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Performance Analytics</CardTitle>
                        <CardDescription>
                            Track your product views and GMV contributions over time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Tabs defaultValue="gmv" className="space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <TabsList>
                                    <TabsTrigger value="gmv">GMV Contribution</TabsTrigger>
                                    <TabsTrigger value="views">Product Views</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="gmv" className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.gmvData}>
                                        <defs>
                                            <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
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
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <Tooltip
                                            formatter={(value: any) => [`₹${(value || 0).toLocaleString()}`, 'GMV']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#4f46e5"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorGmv)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </TabsContent>
                            <TabsContent value="views" className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.productViewsData}>
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
                                        <Bar dataKey="views" name="Total Views" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="unique" name="Unique Visitors" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your network</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.recentActivities.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                            ) : (
                                stats.recentActivities.map((activity, index) => (
                                    <div key={index} className="flex item-start gap-4">
                                        <div className="mt-1">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 p-2">
                                                <Activity className="h-4 w-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none text-slate-800">
                                                {activity.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
