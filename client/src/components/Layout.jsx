import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { getOverallHistoryAPI } from '../utils/api';
import {
    LayoutDashboard,
    Users,
    CheckSquare,
    CalendarDays,
    Clock,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    MessageSquare,
    Send,
    Zap
} from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        const isConfirmed = await confirm({
            title: 'Sign Out?',
            message: 'Are you sure you want to end your session?',
            variant: 'standard',
            confirmText: 'Yes, Sign Out'
        });

        if (!isConfirmed) return;

        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Overview', path: '/', icon: LayoutDashboard },
        { name: 'Faculty', path: '/faculty', icon: Users },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Meetings', path: '/meetings', icon: CalendarDays },
        { name: 'Schedule', path: '/schedule', icon: Clock },
        { name: 'Chat', path: '/chat', icon: MessageSquare },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'} md:relative md:translate-x-0`}>
            <div className="flex items-center gap-3 h-24 px-8 border-b border-slate-50/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Zap size={20} className="text-white fill-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-900 tracking-tight leading-none">CampusOps</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600/60 mt-1">Nexus Protocol</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar h-[calc(100vh-160px)]">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={`transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-600'}`} />
                                <span className={`font-bold text-[13px] tracking-wide ${isActive ? 'font-black' : ''}`}>{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-50">
                <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 text-slate-400 hover:bg-rose-50 hover:text-rose-500 w-full rounded-xl transition-all font-black text-[12px] uppercase tracking-widest group">
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Terminate Session</span>
                </button>
            </div>
        </div>
    );
};

const Header = ({ toggleSidebar, user }) => {
    const navigate = useNavigate();
    const [activePopover, setActivePopover] = useState(null); // 'notifications', 'chat', or null
    const popoverRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);
    const chatInitializedRef = useRef(false);

    useEffect(() => {
        if (activePopover !== 'chat') return;
        if (!user?.token) return;
        if (chatInitializedRef.current) return;

        chatInitializedRef.current = true;
        const socket = io(SOCKET_URL, { auth: { token: user.token }, transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => { setConnected(true); socket.emit('join_room', 'overall'); });
        socket.on('disconnect', () => setConnected(false));
        socket.on('receive_message', (msg) => {
            if (msg.room === 'overall') setMessages(prev => [...prev, msg]);
        });

        const loadHistory = async () => {
            try {
                const { data } = await getOverallHistoryAPI();
                setMessages(data);
            } catch (err) { console.error(err); }
        };
        loadHistory();

        return () => { socket.disconnect(); chatInitializedRef.current = false; };
    }, [activePopover, user?.token]);

    const [inputText, setInputText] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);

    useEffect(() => {
        const fetchNotifs = async () => {
            if (activePopover === 'notifications') {
                setNotifLoading(true);
                try {
                    const { getNotificationsAPI } = await import('../utils/api');
                    const { data } = await getNotificationsAPI();
                    setNotifications(data);
                } catch (err) { console.error(err); } finally { setNotifLoading(false); }
            }
        };
        fetchNotifs();
    }, [activePopover]);

    const handleMarkAllRead = async () => {
        try {
            const { markAllNotificationsReadAPI } = await import('../utils/api');
            await markAllNotificationsReadAPI();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) setActivePopover(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ── Header Chat Popover Logic ───────────────────────────────────────────
    const [chatTab, setChatTab] = useState('overall'); // 'overall' | 'personal'
    const [chatThreads, setChatThreads] = useState([]);
    const [chatAdmins, setChatAdmins] = useState([]);

    useEffect(() => {
        if (activePopover !== 'chat') return;
        const loadPersonal = async () => {
            try {
                const { getDMThreadsAPI, getAdminsAPI } = await import('../utils/api');
                const [threadsRes, adminsRes] = await Promise.all([
                    getDMThreadsAPI(),
                    user.role !== 'admin' ? getAdminsAPI() : Promise.resolve({ data: [] })
                ]);
                setChatThreads(threadsRes.data);
                setChatAdmins(adminsRes.data.filter(a => a._id !== user._id));
            } catch (err) { console.error(err); }
        };
        if (chatTab === 'personal') loadPersonal();
    }, [activePopover, chatTab, user._id, user.role]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !socketRef.current || !connected) return;
        socketRef.current.emit('send_message', { room: 'overall', text: inputText.trim() });
        setInputText('');
    };

    return (
        <header className="h-20 glass-header flex items-center justify-between px-8 sticky top-0 z-40 transition-all">
            <div className="flex items-center gap-6">
                <button onClick={toggleSidebar} className="md:hidden w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-slate-800 hover:bg-slate-50">
                    <Menu size={20} />
                </button>
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Live</span>
                </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-5" ref={popoverRef}>
                {/* Chat */}
                <div className="relative">
                    <button
                        onClick={() => setActivePopover(activePopover === 'chat' ? null : 'chat')}
                        className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 relative group ${activePopover === 'chat' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-gray-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100'}`}
                    >
                        <MessageSquare size={20} className={activePopover === 'chat' ? 'scale-110' : 'group-hover:scale-110'} />
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
                    </button>

                    {activePopover === 'chat' && (
                        <div className="absolute right-0 mt-4 w-[360px] sm:w-[420px] bg-white rounded-[2rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50 flex flex-col max-h-[600px]">
                            {/* Header & Tabs */}
                            <div className="px-6 pt-6 pb-2 border-b border-slate-50 bg-white/80 backdrop-blur-xl shrink-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-black text-slate-900 text-lg tracking-tight">Messaging</h3>
                                    <button onClick={() => { setActivePopover(null); navigate('/chat'); }} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[10px] text-indigo-600 font-black uppercase tracking-widest rounded-lg transition-all">Go Fullscreen</button>
                                </div>
                                <div className="bg-slate-50 p-1 rounded-xl flex gap-1 mb-2">
                                    <button onClick={() => setChatTab('overall')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chatTab === 'overall' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Overall</button>
                                    <button onClick={() => setChatTab('personal')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chatTab === 'personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Personal</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 custom-scrollbar">
                                {chatTab === 'overall' ? (
                                    messages.length === 0 ? (
                                        <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                                            <MessageSquare size={32} className="mb-2 opacity-20" />
                                            <p className="text-xs font-bold uppercase tracking-widest">No history</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => (
                                            <div key={msg._id || idx} className={`flex flex-col ${msg.sender?.toString() === user?._id ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm text-[13px] leading-relaxed ${msg.sender?.toString() === user?._id
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                                    }`}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 mt-1 px-1 uppercase tracking-tighter">
                                                    {msg.sender?.toString() === user?._id ? 'You' : msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))
                                    )
                                ) : (
                                    /* Personal tab in popover */
                                    <div className="space-y-4">
                                        {chatThreads.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Recent Chats</p>
                                                {chatThreads.map(t => (
                                                    <button key={t._id} onClick={() => { setActivePopover(null); navigate('/chat'); }} className="w-full flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all text-left group">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black uppercase">{t.senderName[0]}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-slate-900 truncate">{t.senderName}</p>
                                                            <p className="text-[10px] text-slate-400 truncate">{t.lastMsg}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {user.role !== 'admin' && chatAdmins.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Admin</p>
                                                {chatAdmins.map(a => (
                                                    <button key={a._id} onClick={() => { setActivePopover(null); navigate('/chat'); }} className="w-full flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-200 transition-all text-left">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-sm font-black uppercase">{a.name[0]}</div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-slate-900">{a.name}</p>
                                                            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-tighter italic">Tap to message</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {chatThreads.length === 0 && chatAdmins.length === 0 && (
                                            <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                                                <User size={32} className="mb-2 opacity-20" />
                                                <p className="text-xs font-bold uppercase tracking-widest">No threads</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {chatTab === 'overall' && (
                                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                                    <input
                                        type="text"
                                        placeholder="Broadcast message..."
                                        className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                    <button type="submit" className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-90 disabled:opacity-50" disabled={!inputText.trim()}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setActivePopover(activePopover === 'notifications' ? null : 'notifications')}
                        className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 relative group ${activePopover === 'notifications' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-gray-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100'}`}
                    >
                        <Bell size={20} className={activePopover === 'notifications' ? 'scale-110' : 'group-hover:scale-110'} />
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {activePopover === 'notifications' && (
                        <div className="absolute right-0 mt-4 w-[360px] bg-white rounded-[2rem] shadow-[0_32px_80px_-20px_rgba(15,23,42,0.2)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-xl">
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg tracking-tight">Activity</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">System Alerts</p>
                                </div>
                                <button
                                    onClick={handleMarkAllRead}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-tighter rounded-xl transition-all disabled:opacity-50"
                                    disabled={!notifications.some(n => !n.isRead)}
                                >
                                    Clear New
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifLoading ? (
                                    <div className="p-12 text-center flex flex-col items-center">
                                        <div className="w-10 h-10 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning logs</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-12 text-center text-slate-300">
                                        <Bell size={40} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-sm font-bold italic">Silence everywhere</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif._id} className={`p-5 flex gap-4 transition-all hover:bg-slate-50 group border-b border-gray-50/50 ${notif.isRead ? 'opacity-60' : 'bg-indigo-50/20'}`}>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${notif.type === 'task' ? 'bg-emerald-100 text-emerald-600' : notif.type === 'meeting' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                                <Bell size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className="text-[13px] font-black text-slate-900 tracking-tight">{notif.title}</h4>
                                                    {!notif.isRead && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>}
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{notif.message}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="text-[10px] font-black text-indigo-400/80 tracking-widest uppercase">{notif.faculty?.name.split(' ')[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
                                <button onClick={() => { setActivePopover(null); navigate('/notifications'); }} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-all">Audit Center</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-8 bg-slate-200/60 mx-2 hidden sm:block"></div>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-[13px] font-black text-slate-900 tracking-tight leading-none mb-1">{user?.name || 'Admin'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.role || 'Superior'}</p>
                    </div>
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-105 transition-transform border-4 border-white ring-1 ring-slate-100">
                            {user?.name?.[0] || 'A'}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                    </div>
                </div>
            </div>
        </header >
    )
}

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();
    const isChat = location.pathname === '/chat';

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Decorative Elements */}
                <div className="absolute -top-[500px] -right-[500px] w-[1000px] h-[1000px] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                <div className="absolute -bottom-[500px] -left-[500px] w-[1000px] h-[1000px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none -z-10"></div>

                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

                <main className={`flex-1 transition-all duration-500 overflow-hidden ${isChat ? '' : 'overflow-y-auto'}`}>
                    <div className={isChat ? "h-full w-full" : "max-w-7xl mx-auto p-8 md:p-12 lg:p-16 space-y-12"}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
