import { useEffect, useState } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Users, FileCheck, Calendar, Clock, Plus, ArrowRight, Zap, Target, BookOpen, MessageSquare, Settings } from 'lucide-react';
import { getDashboardStatsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler);

const StatsCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="cool-card p-7 group transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
        <div className="flex justify-between items-start mb-6 relative">
            <div className={`w-14 h-14 rounded-[1.25rem] ${color} bg-opacity-10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-opacity-20`}>
                <Icon size={24} className={`${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                    <Zap size={10} className="fill-emerald-600" />
                    +{trend}%
                </div>
            )}
        </div>
        <div className="relative">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">{title}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{value ?? '—'}</h3>
            {subtitle && (
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <p className="text-[11px] font-bold text-slate-400 tracking-wide">{subtitle}</p>
                </div>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getDashboardStatsAPI();
                setStats(data);
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const freeCount = stats?.facultyStatusStats?.find(s => s._id === 'Free')?.count ?? 0;
    const busyCount = stats?.facultyStatusStats?.find(s => s._id === 'Busy')?.count ?? 0;
    const meetCount = stats?.facultyStatusStats?.find(s => s._id === 'Meeting')?.count ?? 0;
    const leaveCount = stats?.facultyStatusStats?.find(s => s._id === 'Leave')?.count ?? 0;

    const availabilityData = {
        labels: ['Free', 'Busy', 'Meeting', 'Leave'],
        datasets: [{
            data: [freeCount, busyCount, meetCount, leaveCount],
            backgroundColor: ['#10b981', '#f43f5e', '#f59e0b', '#94a3b8'],
            hoverOffset: 15,
            borderWidth: 0,
            borderRadius: 8,
            spacing: 5,
        }],
    };

    const taskStatMap = {};
    stats?.taskStats?.forEach(s => { taskStatMap[s._id] = s.count; });

    const taskTrendData = {
        labels: ['Queued', 'Planning', 'Active', 'Review', 'Signed'],
        datasets: [{
            label: 'Volume',
            data: [
                taskStatMap['Assigned'] ?? 0,
                taskStatMap['Accepted'] ?? 0,
                taskStatMap['In Progress'] ?? 0,
                taskStatMap['Completed'] ?? 0,
                taskStatMap['Verified'] ?? 0,
            ],
            borderColor: '#0061FF',
            borderWidth: 4,
            backgroundColor: (context) => {
                const bg = context.chart.ctx.createLinearGradient(0, 0, 0, 400);
                bg.addColorStop(0, 'rgba(0, 97, 255, 0.1)');
                bg.addColorStop(1, 'rgba(0, 97, 255, 0)');
                return bg;
            },
            tension: 0.45,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#0061FF',
            pointBorderWidth: 3,
        }],
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-16rem)] gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-[5px] border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={20} className="text-indigo-500 animate-pulse" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-slate-900 font-black tracking-tight text-lg">Optimizing Workspace</p>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Downloading live metrics...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* ── Welcome Banner (EdusoftX Style) ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-10 lg:p-14 text-white shadow-2xl shadow-indigo-200 group">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-[200px] -mt-[200px] blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full -ml-[150px] -mb-[150px] blur-[60px]"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="max-w-2xl text-center lg:text-left">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-4">
                            Dashboard Overview
                        </h1>
                        <p className="text-indigo-100/80 text-lg font-medium">
                            Welcome back, <span className="text-white font-black underline decoration-blue-400 underline-offset-4">{user?.name || 'Administrator'}</span>! Here's what's happening in your campus today.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                        <button onClick={() => navigate('/reports')} className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 transition-all font-black text-xs uppercase tracking-widest">
                            <FileCheck size={18} />
                            Generate Report
                        </button>
                        <button onClick={() => navigate('/tasks')} className="flex items-center gap-3 bg-blue-500 hover:bg-blue-400 px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all font-black text-xs uppercase tracking-widest">
                            <Plus size={18} className="stroke-[3px]" />
                            Add Deployment
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard title="Total Students" value={stats?.totalFaculty} icon={Users} color="bg-blue-500" trend="12" subtitle="vs last month" />
                <StatsCard title="Active Projects" value={stats?.activeTasks} icon={Target} color="bg-emerald-500" trend="5" subtitle="vs last month" />
                <StatsCard title="Attendance Today" value="94.2%" icon={Clock} color="bg-rose-500" trend="2.1" subtitle="vs last month" />
                <StatsCard title="Pending Fees" value="$48,500" icon={BookOpen} color="bg-slate-900" trend="-8" subtitle="vs last month" />
            </div>

            {/* ── Analytics Section ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-12">
                <div className="xl:col-span-8 cool-card p-10 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-50/20 to-transparent rounded-full -mr-[250px] -mt-[250px] pointer-events-none"></div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deployment flow</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Real-time throughput metrics</p>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                            {['7 Days', '30 Days'].map((period, i) => (
                                <button key={i} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[320px] relative">
                        <Line
                            data={taskTrendData}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        grid: { color: '#f1f5f9', borderDash: [5, 5] },
                                        border: { display: false },
                                        ticks: { font: { weight: 'bold', size: 11 }, color: '#94a3b8', padding: 10 }
                                    },
                                    x: {
                                        grid: { display: false },
                                        border: { display: false },
                                        ticks: { font: { weight: 'bold', size: 10 }, color: '#94a3b8', padding: 10 }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-8">
                    <div className="cool-card p-10 relative overflow-hidden h-full">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Staff Utilization</h3>
                        <div className="relative h-64 w-full flex items-center justify-center">
                            <Doughnut
                                data={availabilityData}
                                options={{
                                    maintainAspectRatio: false,
                                    cutout: '82%',
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                boxWidth: 6,
                                                padding: 25,
                                                font: { size: 10, weight: 800 },
                                                usePointStyle: true,
                                                color: '#64748b'
                                            }
                                        }
                                    }
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                                <span className="block text-4xl font-black text-slate-900 tracking-tight leading-none">{stats?.totalFaculty || 0}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Active</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center group cursor-pointer" onClick={() => navigate('/reports')}>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm">Automated Audit</h4>
                                <p className="text-[11px] font-bold text-slate-400 mt-0.5">Generate daily PDF insights</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-transform group-hover:translate-x-1">
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-4">
                <div className="lg:col-span-5 cool-card p-8 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl shadow-indigo-100">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                            <Settings size={22} className="text-indigo-300" />
                        </div>
                        <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-500/30">System v2.4</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">Integrity Check</h3>
                    <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">All sub-modules are responding within normal parameters. Next system backup scheduled in 4 hours.</p>
                    <button className="w-fit text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                        Run Hardware Diagnostic
                        <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="lg:col-span-7 cool-card p-8 relative overflow-hidden bg-white">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Audit Logs</h3>
                        <button onClick={() => navigate('/notifications')} className="text-[11px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Archive</button>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {[
                            { text: 'Core engine synchronized with master branch', time: '12m ago', type: 'success' },
                            { text: 'New faculty onboarded: Dr. Sarah Connor', time: '4h ago', type: 'info' },
                            { text: 'Emergency task assigned to IT Department', time: '6h ago', type: 'warning' }
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : log.type === 'warning' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                                    <p className="text-xs font-bold text-slate-700">{log.text}</p>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 ml-4">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
