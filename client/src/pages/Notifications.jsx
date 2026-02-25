import { useState, useEffect } from 'react';
import { Bell, Calendar, CheckSquare, MessageSquare, Clock, Filter, Trash2, Search } from 'lucide-react';
import { getNotificationsAPI } from '../utils/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await getNotificationsAPI();
                setNotifications(data);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'meeting': return { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' };
            case 'task': return { icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' };
            default: return { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' };
        }
    };

    const filtered = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.faculty?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || n.type === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-4">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            <p className="font-medium">Retrieving Notification Logs...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notification Hub</h1>
                    <p className="text-sm text-slate-500 mt-1">Global audit log of all system-generated alerts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            try {
                                const { markAllNotificationsReadAPI } = await import('../utils/api');
                                await markAllNotificationsReadAPI();
                                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                            } catch (err) { console.error(err); }
                        }}
                        className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-xl border border-primary-100 transition-colors disabled:opacity-50"
                        disabled={!notifications.some(n => !n.isRead)}
                    >
                        Mark all as read
                    </button>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        {filtered.length} Alerts
                    </span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, message or faculty..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'task', 'meeting', 'general'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${filter === f
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification List */}
            <div className="grid grid-cols-1 gap-4">
                {filtered.length > 0 ? filtered.map((notif) => {
                    const { icon: Icon, color, bg } = getTypeIcon(notif.type);
                    return (
                        <div key={notif._id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all flex gap-5 group ${notif.isRead ? 'border-slate-100 opacity-70' : 'border-blue-100 bg-blue-50/10'}`}>
                            <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900">{notif.title}</h3>
                                        {!notif.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                                <div className="pt-2 flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-500">{notif.faculty?.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notif.faculty?.department}</span>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Bell size={48} className="opacity-10" />
                        <p className="font-medium">No system alerts found for this criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
