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
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 transition-colors group-hover:bg-opacity-20`}>
                <Icon size={22} className={`${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    +{trend}%
                </div>
            )}
        </div>
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value ?? '—'}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
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
            borderWidth: 4,
            borderColor: '#ffffff',
        }],
    };

    const taskStatMap = {};
    stats?.taskStats?.forEach(s => { taskStatMap[s._id] = s.count; });

    const taskTrendData = {
        labels: ['Assigned', 'Accepted', 'Progress', 'Done', 'Verified'],
        datasets: [{
            label: 'Volume',
            data: [
                taskStatMap['Assigned'] ?? 0,
                taskStatMap['Accepted'] ?? 0,
                taskStatMap['In Progress'] ?? 0,
                taskStatMap['Completed'] ?? 0,
                taskStatMap['Verified'] ?? 0,
            ],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.5,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
        }],
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse text-sm">Syncing latest data...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ── Welcome Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Hello, {user?.name?.split(' ')[0] || 'Admin'} <span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Here's a snapshot of the campus operations today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/tasks')}
                        className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-sm font-bold">New Task</span>
                    </button>
                    <div className="h-10 w-px bg-slate-200 mx-1 hidden md:block"></div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Status</p>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-700">Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Staff" value={stats?.totalFaculty} icon={Users} color="bg-indigo-600" trend="12" subtitle="Personnel onboarded" />
                <StatsCard title="Pending Tasks" value={stats?.activeTasks} icon={Target} color="bg-rose-600" trend="5" subtitle="Requires attention" />
                <StatsCard title="Events Today" value={stats?.meetingsToday} icon={Zap} color="bg-amber-500" subtitle="Meetings & seminars" />
                <StatsCard title="Resources" value="94%" icon={BookOpen} color="bg-emerald-600" subtitle="System utilization" />
            </div>

            {/* ── Main Layout ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Task Analytics */}
                <div className="xl:col-span-8 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Task Performance</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Flow of operations through different stages</p>
                        </div>
                        <select className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 focus:ring-0 px-3 py-2 cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[280px]">
                        <Line
                            data={taskTrendData}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' }, color: '#cbd5e1' } },
                                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' }, color: '#94a3b8' } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Faculty Status & Quick Stats */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Staff Availability</h3>
                        <div className="relative h-56 flex items-center justify-center">
                            <Doughnut
                                data={availabilityData}
                                options={{
                                    maintainAspectRatio: false,
                                    cutout: '75%',
                                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 20, font: { size: 10, weight: 'bold' }, usePointStyle: true } } }
                                }}
                            />
                            <div className="absolute inset-x-0 top-[40%] text-center pointer-events-none">
                                <span className="block text-2xl font-black text-slate-900 leading-none">{stats?.totalFaculty || 0}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Link/Action */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white overflow-hidden relative group cursor-pointer" onClick={() => navigate('/reports')}>
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-lg leading-tight">Generate<br />Reports</h4>
                                <p className="text-indigo-100 text-[10px] mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full">Monthly Audit Ready</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-2xl group-hover:px-5 transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                            <FileCheck size={120} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Footer / Secondary Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Quick Actions</h3>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">Admin Tools</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Schedule', icon: Clock, path: '/schedule', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Chat', icon: MessageSquare, path: '/chat', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Faculty', icon: Users, path: '/faculty', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Settings', icon: Settings, path: '/settings', color: 'text-rose-600', bg: 'bg-rose-50' },
                        ].map((btn, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(btn.path)}
                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all group"
                            >
                                <div className={`p-2.5 rounded-xl ${btn.bg} ${btn.color} group-hover:scale-110 transition-transform`}>
                                    <btn.icon size={20} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600">{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">System Logs</h3>
                        <button onClick={() => navigate('/notifications')} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">View All</button>
                    </div>
                    <div className="space-y-3">
                        {[
                            { text: 'Server successfully synchronized with cloud database', time: '2m ago', type: 'success' },
                            { text: 'Meeting scheduler finalized for Computer Dept.', time: '1h ago', type: 'info' }
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                    <p className="text-[11px] font-medium text-slate-600">{log.text}</p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 shrink-0">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
