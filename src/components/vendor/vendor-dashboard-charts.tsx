"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    TrendingUp,
    ArrowUpRight,
    Users,
    IndianRupee,
    Calendar,
    Briefcase
} from "lucide-react";

interface VendorStats {
    authStats: {
        approved: number;
        pending: number;
        rejected: number;
        total: number;
    };
    leadsData: {
        name: string;
        leads: number;
    }[];
    gmvData: {
        name: string;
        amount: number;
    }[];
    recentEvents: {
        id: number;
        name: string;
        date: string;
        status: string;
    }[];
    recentOrders: {
        id: string;
        customer: string;
        amount: number;
        date: string;
        status: string;
    }[];
}

export function VendorDashboardCharts({ stats }: { stats: VendorStats }) {
    if (!stats) return null;

    return (
        <div className="grid gap-6 md:grid-cols-2">

            {/* 1. Monthly GMV Graph */}
            <Card className="col-span-1 shadow-md border-indigo-100">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <IndianRupee className="h-5 w-5 text-indigo-600" />
                                Monthly GMV
                            </CardTitle>
                            <CardDescription>Estimated revenue from GeM orders</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                            +12.5% vs Last Month
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={stats.gmvData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                            <Tooltip
                                formatter={(value: any) => [`₹${(value || 0).toLocaleString()}`, 'GMV']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorGmv)" activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* 2. New Leads Trend */}
            <Card className="col-span-1 shadow-md border-blue-100">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                New Leads Generated
                            </CardTitle>
                            <CardDescription>Inquiries and messages from buyers</CardDescription>
                        </div>
                        <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Use "GeM Leads" to boost
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats.leadsData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="leads" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* 3. Recent Events */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            Upcoming Government Events
                        </CardTitle>
                        <Badge variant="outline">View All</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentEvents.map(event => (
                            <div key={event.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-semibold text-sm text-slate-800">{event.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <Badge variant={event.status === 'Registered' ? 'default' : 'secondary'} className={event.status === 'Registered' ? 'bg-green-600' : ''}>
                                    {event.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 3.5. Recent Orders */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Briefcase className="h-5 w-5 text-green-600" />
                            Recent Orders
                        </CardTitle>
                        <Badge variant="outline">View All</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentOrders && stats.recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-semibold text-sm text-slate-800">{order.customer}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">₹{order.amount.toLocaleString()}</p>
                                    <Badge variant="secondary" className="text-[10px] h-5">{order.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 4. Quick Stats Summary */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-sm bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-5 w-5 text-slate-600" />
                        Performance Snapshot
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Total Authorizations</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{stats.authStats.total}</p>
                            <p className="text-[10px] text-green-600 font-bold flex items-center mt-1">
                                <ArrowUpRight className="h-3 w-3 mr-1" /> {stats.authStats.approved} Approved
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Total Orders</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{stats.recentOrders ? stats.recentOrders.length : 0}</p>
                            <p className="text-[10px] text-green-600 font-bold flex items-center mt-1">
                                <ArrowUpRight className="h-3 w-3 mr-1" /> Active
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Avg. Response Time</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">4h 12m</p>
                            <p className="text-[10px] text-green-600 font-bold flex items-center mt-1">
                                Top 10% of Vendors
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
