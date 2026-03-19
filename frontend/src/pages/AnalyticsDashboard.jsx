import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Loader2, Users, Flame, Eye, BarChart2, TrendingUp, Layout } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = {
  instagram: '#FF3D77',
  facebook: '#0084FF',
  x: '#000000',
  linkedin: '#0077B5',
  youtube: '#FF0000',
  total: '#6366F1'
};

const AnalyticsDashboard = () => {
  const { token, activeOrgId } = useAuthStore();
  const [globalStats, setGlobalStats] = useState({ followers: 0, engagement: 0, impressions: 0 });
  const [chartData, setChartData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [contentTypeData, setContentTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !activeOrgId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [statsRes, chartRes, compRes, typeRes] = await Promise.all([
          axios.get(`${API_URL}/analytics/${activeOrgId}/global`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/analytics/${activeOrgId}/charts`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/analytics/${activeOrgId}/comparison`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/analytics/${activeOrgId}/content-type`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setGlobalStats(statsRes.data);
        setChartData(chartRes.data);
        setComparisonData(compRes.data);
        setContentTypeData(typeRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, activeOrgId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
        <p className="text-gray-500 font-medium italic">Generating insights...</p>
      </div>
    );
  }

  const availablePlatforms = new Set();
  chartData.forEach(day => {
    Object.keys(day).forEach(key => {
      if (key.includes('_followers') && !key.startsWith('total')) {
        availablePlatforms.add(key.split('_')[0]);
      }
    });
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-gray-100 p-4 shadow-xl rounded-xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 py-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-semibold text-gray-700">{entry.name}:</span>
              <span className="text-sm font-bold text-gray-900 ml-auto">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const AIAdvisor = ({ globalStats, chartData, token }) => {
    const [advice, setAdvice] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAdvice = async () => {
      if (advice.length > 0) return;
      setLoading(true);
      try {
        const res = await axios.post(`${API_URL}/ai/advice`, {
          data: { globalStats, recentTrend: chartData.slice(-3) },
          type: 'global'
        }, { headers: { Authorization: `Bearer ${token}` } });
        setAdvice(res.data.advice);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (globalStats.followers > 0) getAdvice();
    }, [globalStats]);

    if (!advice.length && !loading) return null;

    return (
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <Sparkles size={20} className="text-indigo-200" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-100">Genesis AI Growth Advisor</span>
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight">Your digital ecosystem is evolving. Here is your strategic pulse.</h2>
            {loading ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="animate-spin" />
                <span className="font-bold italic text-indigo-100">Consulting the Oracle...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {advice.map((tip, i) => (
                  <div key={i} className="flex gap-4 items-start bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-colors">
                    <div className="mt-1 w-5 h-5 bg-white text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 bg-white/10 p-8 rounded-[40px] backdrop-blur-xl border border-white/10 text-center">
            <div className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-4">Predicted Growth</div>
            <div className="text-6xl font-black mb-1">+12%</div>
            <div className="text-sm font-bold text-indigo-100 italic">Next 30 Days</div>
            <button className="mt-8 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
              Optimize Strategy
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Performance Analytics</h1>
          <p className="mt-2 text-lg text-gray-500 font-medium">Detailed breakdown of your digital ecosystem's heartbeat.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold flex items-center gap-1 border border-green-100">
                <TrendingUp className="w-3 h-3" /> Live Updates
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-100">
                <Layout className="w-3 h-3" /> All Platforms
            </span>
        </div>
      </div>

      {/* AI Advisor Section */}
      <AIAdvisor globalStats={globalStats} chartData={chartData} token={token} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: 'Total Audience', value: globalStats.followers, icon: Users, color: 'blue' },
          { label: 'Total Engagement', value: globalStats.engagement, icon: Flame, color: 'rose' },
          { label: 'Total Impressions', value: globalStats.impressions, icon: Eye, color: 'indigo' }
        ].map((kpi, idx) => (
          <div key={idx} className="group relative bg-white overflow-hidden rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${kpi.color}-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                <h3 className="text-4xl font-black text-gray-900 mt-2">{kpi.value.toLocaleString()}</h3>
              </div>
              <div className={`p-4 bg-${kpi.color}-50 rounded-2xl`}>
                <kpi.icon className={`h-8 w-8 text-${kpi.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="bg-white shadow-2xl rounded-3xl p-20 text-center border border-gray-100">
          <BarChart2 className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900">No Data Pulse Detected</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">Connect your social accounts in the platform settings to start tracking growth and engagement.</p>
        </div>
      ) : (
        <>
          {/* Main Growth Area Chart */}
          <div className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900">Audience Trajectory</h3>
              <div className="flex gap-3">
                {Array.from(availablePlatforms).map(p => (
                  <div key={p} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[p] }} />
                    <span className="text-xs font-bold text-gray-500 uppercase">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    {Array.from(availablePlatforms).map(p => (
                      <linearGradient key={`grad-${p}`} id={`color-${p}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[p]} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={COLORS[p]} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  {Array.from(availablePlatforms).map(platform => (
                    <Area 
                      key={`${platform}_followers`}
                      type="monotone" 
                      dataKey={`${platform}_followers`} 
                      name={platform.charAt(0).toUpperCase() + platform.slice(1)}
                      stroke={COLORS[platform]} 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={`url(#color-${platform})`}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Engagement Trends */}
            <div className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Engagement Intensity</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                    <Tooltip content={<CustomTooltip />} />
                    {Array.from(availablePlatforms).map(platform => (
                      <Line 
                        key={`${platform}_engagement`}
                        type="step" 
                        dataKey={`${platform}_engagement`} 
                        name={platform.charAt(0).toUpperCase() + platform.slice(1)}
                        stroke={COLORS[platform]} 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Content Type Bar Chart */}
            <div className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Format Efficiency</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentTypeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                    <Bar dataKey="avgEngagement" radius={[10, 10, 0, 0]} barSize={40}>
                      {contentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366F1' : '#F43F5E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis Chart */}
          <div className="bg-white shadow-sm rounded-3xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sentiment Rhythm</h3>
                <p className="text-sm text-gray-500 mt-1">AI-powered mood tracking across your digital nodes.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Positive
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-gray-300" /> Neutral
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Negative
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                  <YAxis domain={[-1, 1]} axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="sentiment_score" 
                    name="Sentiment Score"
                    stroke="#6366F1" 
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#sentimentGrad)"
                    baseValue={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Performance Comparison */}
          <div className="bg-white shadow-sm rounded-3xl overflow-hidden border border-gray-100">
            <div className="px-8 py-8">
              <h3 className="text-xl font-bold text-gray-900">Platform Matrix</h3>
              <p className="text-sm text-gray-500 mt-1">Direct performance mapping across all nodes.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Node</th>
                    <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Identifier</th>
                    <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Audience</th>
                    <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Rate</th>
                    <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter" style={{backgroundColor: `${COLORS[row.platform]}15`, color: COLORS[row.platform]}}>
                          {row.platform}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 font-bold">@{row.username}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-bold text-right">{row.followers.toLocaleString()}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-right">
                          <span className="font-black text-gray-900">{row.engagementRate}</span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase">Active</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

