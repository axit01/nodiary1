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
    Send
} from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        const isConfirmed = await confirm({
            title: 'Confirm Logout',
            message: 'Are you sure you want to end your session?',
            variant: 'standard',
            confirmText: 'Yes, Sign Out'
        });

        if (!isConfirmed) return;

        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
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
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
            <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CampusOps</span>
                <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 w-full rounded-lg transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

const Header = ({ toggleSidebar, user }) => {
    const navigate = useNavigate();
    const [activePopover, setActivePopover] = useState(null); // 'notifications', 'chat', or null
    const popoverRef = useRef(null);
    // Live Overall Chat Data
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    // Socket Connection Setup
    useEffect(() => {
        if (!user?.token) return;

        const socket = io(SOCKET_URL, {
            auth: { token: user.token },
            transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('join_room', 'overall');
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('receive_message', (msg) => {
            if (msg.room === 'overall') {
                setMessages(prev => [...prev, msg]);
            }
        });

        // Load History
        const loadHistory = async () => {
            try {
                const { data } = await getOverallHistoryAPI();
                setMessages(data);
            } catch (err) { console.error(err); }
        };
        loadHistory();

        return () => socket.disconnect();
    }, [user?.token]);

    const [inputText, setInputText] = useState('');

    // Live Notifications Data
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
                } catch (err) {
                    console.error(err);
                } finally {
                    setNotifLoading(false);
                }
            }
        };
        fetchNotifs();
    }, [activePopover]);

    const handleMarkAllRead = async () => {
        try {
            const { markAllNotificationsReadAPI } = await import('../utils/api');
            await markAllNotificationsReadAPI();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    // Close popover on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setActivePopover(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !socketRef.current || !connected) return;

        socketRef.current.emit('send_message', { room: 'overall', text: inputText.trim() });
        setInputText('');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
                    <Menu size={24} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">Campus Panel</h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management Suite</span>
                </div>
            </div>

            <div className="flex items-center gap-4" ref={popoverRef}>
                {/* Chat Icon & Popover */}
                <div className="relative">
                    <button
                        onClick={() => setActivePopover(activePopover === 'chat' ? null : 'chat')}
                        className={`relative p-2 rounded-lg transition-colors ${activePopover === 'chat' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'}`}
                    >
                        <MessageSquare size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
                    </button>

                    {activePopover === 'chat' && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
                                <h3 className="font-bold text-slate-100">Overall Chat</h3>
                                <button onClick={() => { setActivePopover(null); navigate('/chat'); }} className="text-xs text-primary-400 hover:text-primary-300 font-bold transition-colors">Open Full View</button>
                            </div>

                            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                        <MessageSquare size={32} className="mb-2 opacity-20" />
                                        <p className="text-sm font-medium">No system history yet</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div key={msg._id || idx} className={`flex flex-col ${msg.sender?.toString() === user?._id ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm shadow-sm transition-all ${msg.sender?.toString() === user?._id
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1">
                                                <span className="font-bold uppercase tracking-wider">{msg.sender?.toString() === user?._id ? 'You' : msg.senderName}</span>
                                                <span className="opacity-50">• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 text-sm px-4 py-2.5 bg-slate-800 border-none rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-inner"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <button type="submit" className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all shadow-lg active:scale-95 disabled:opacity-50" disabled={!inputText.trim()}>
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Notifications Icon & Popover */}
                <div className="relative">
                    <button
                        onClick={() => setActivePopover(activePopover === 'notifications' ? null : 'notifications')}
                        className={`relative p-2 rounded-lg transition-colors ${activePopover === 'notifications' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'}`}
                    >
                        <Bell size={20} />
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>

                    {activePopover === 'notifications' && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                                    disabled={!notifications.some(n => !n.isRead)}
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifLoading ? (
                                    <div className="p-8 text-center text-xs text-slate-400">Loading alerts...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">No new alerts</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif._id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}>
                                            <div className="flex gap-3">
                                                <div className={`mt-1 min-w-[32px] h-8 rounded-full flex items-center justify-center ${notif.type === 'task' ? 'bg-emerald-100 text-emerald-600' : notif.type === 'meeting' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    <Bell size={14} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                                                        {!notif.isRead && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[10px] text-gray-400">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{notif.faculty?.name.split(' ')[0]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 text-center border-t border-gray-100 bg-gray-50/50">
                                <button onClick={() => { setActivePopover(null); navigate('/notifications'); }} className="text-xs font-semibold text-primary-600 hover:text-primary-800">View Audit Log</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-8 bg-gray-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'admin@college.edu'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-md shadow-slate-200 border-2 border-white ring-2 ring-gray-100">
                        {user?.name?.[0] || 'A'}
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
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

                <main className={`flex-1 overflow-hidden ${isChat ? '' : 'overflow-y-auto p-6 scroll-smooth'}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
