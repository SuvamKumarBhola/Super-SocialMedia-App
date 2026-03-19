import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Loader2, Users, Flame, Link2, PlusCircle, Activity, Calendar as CalendarIcon, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DashboardHome = () => {
    const { user, token, activeOrgId } = useAuthStore();
    const [stats, setStats] = useState({ followers: 0, engagement: 0, impressions: 0 });
    const [accountsCount, setAccountsCount] = useState(0);
    const [activities, setActivities] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !activeOrgId) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [statsRes, accRes, actRes, chartRes] = await Promise.all([
                    axios.get(`${API_URL}/analytics/${activeOrgId}/global`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { followers: 0, engagement: 0, impressions: 0 } })),
                    axios.get(`${API_URL}/social/accounts/${activeOrgId}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/activity/${activeOrgId}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/analytics/${activeOrgId}/charts`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
                ]);

                // Ensure stats has expected shape if error occurs
                setStats(statsRes.data || { followers: 0, engagement: 0, impressions: 0 });
                setAccountsCount(accRes.data?.length || 0);
                setActivities(actRes.data?.slice(0, 8) || []);
                setChartData(chartRes.data?.slice(-14) || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, activeOrgId]);

    if (loading) {
        return <div className="p-12 flex justify-center min-h-[50vh] items-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;
    }

    const formatActionStr = (action) => {
        return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'Creator'}</span>! 👋
                    </h1>
                    <p className="mt-2 text-base text-gray-500">Here's what's happening across your connected platforms today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/dashboard/composer" className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm text-white font-medium rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Post
                    </Link>
                    <Link to="/dashboard/analytics" className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <TrendingUp className="mr-2 h-5 w-5 text-gray-500" />
                        View Analytics
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 bg-blue-50 text-blue-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Audience</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.followers?.toLocaleString() || '0'}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-red-100 transition-all group">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 bg-red-50 text-red-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <Flame className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Global Engagement</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.engagement?.toLocaleString() || '0'}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all group">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 bg-purple-50 text-purple-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Impressions</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.impressions?.toLocaleString() || '0'}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-emerald-100 transition-all group">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 bg-emerald-50 text-emerald-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <Link2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Accounts Linked</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{accountsCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Audience Growth */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Audience Growth
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">Last 14 days · all platforms</p>
                        </div>
                        <Link to="/dashboard/analytics" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center group">
                            Full Report <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    {chartData.length === 0 ? (
                        <div className="h-56 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                            <TrendingUp className="w-8 h-8 text-gray-200" />
                            Connect accounts to see growth data
                        </div>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }}
                                        itemStyle={{ color: '#374151' }}
                                    />
                                    <Area type="monotone" dataKey="total_followers" name="Followers" stroke="#3B82F6" strokeWidth={2.5} fill="url(#colorFollowers)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Engagement Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-red-500" /> Engagement Trend
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">Last 14 days · daily totals</p>
                        </div>
                        <Link to="/dashboard/analytics" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center group">
                            Full Report <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    {chartData.length === 0 ? (
                        <div className="h-56 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                            <Flame className="w-8 h-8 text-gray-200" />
                            Connect accounts to see engagement data
                        </div>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={14}>
                                    <defs>
                                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.9} />
                                            <stop offset="95%" stopColor="#F97316" stopOpacity={0.7} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }}
                                        cursor={{ fill: '#F9FAFB' }}
                                    />
                                    <Bar dataKey="total_engagement" name="Engagement" fill="url(#colorEngagement)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latest Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gray-500" /> Recent Activity
                        </h3>
                        <Link to="/dashboard/activity" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center group">
                            View all <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="p-0">
                        {activities.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <Activity className="w-8 h-8 text-gray-400" />
                                </div>
                                <p>No activity yet in this organization.</p>
                                <Link to="/dashboard/composer" className="text-blue-600 mt-2 hover:underline">Create your first post</Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {activities.map((act) => (
                                    <li key={act._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${act.userId?.name || 'User'}&background=random`}
                                                alt="avatar"
                                                className="w-10 h-10 rounded-full shadow-sm ring-2 ring-white"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-baseline justify-between">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {act.userId?.name || 'User'} <span className="text-gray-500 font-normal">performed an action:</span> {formatActionStr(act.action)}
                                                    </p>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                                        {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {act.metadata?.captionPreview && (
                                                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 italic">
                                                        "{act.metadata.captionPreview}..."
                                                    </div>
                                                )}
                                                {act.metadata?.reviewMessage && (
                                                    <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-100">
                                                        <span className="font-semibold text-red-800">Review Note:</span> {act.metadata.reviewMessage}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Quick Help / Connect Accounts card */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Connect more platforms</h3>
                            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                Unlock the full potential of Creator OS. Connect platforms like Instagram, X, LinkedIn & more to publish everywhere at once.
                            </p>
                            <Link to="/dashboard/accounts" className="inline-flex w-full justify-center items-center px-4 py-2.5 bg-white text-blue-700 font-medium text-sm rounded-xl shadow hover:bg-gray-50 transition-colors">
                                <Link2 className="w-4 h-4 mr-2" /> View Connections
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <CalendarIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900">Content Calendar</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                            Visualize your upcoming posts. Draft, schedule, and review content within your team effortlessly.
                        </p>
                        <Link to="/dashboard/calendar" className="inline-flex w-full justify-center items-center px-4 py-2 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors">
                            Go to Calendar <ArrowRight className="ml-2 w-4 h-4 text-gray-400" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
