import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    User
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Faculty', path: '/faculty', icon: Users },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Meetings', path: '/meetings', icon: CalendarDays },
        { name: 'Schedule', path: '/schedule', icon: Clock },
        { name: 'Reports', path: '/reports', icon: FileText },
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

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
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
    const [activePopover, setActivePopover] = useState(null); // 'notifications', 'chat', or null
    const [chatTab, setChatTab] = useState('overall'); // 'overall' or 'personal'
    const popoverRef = useRef(null);

    // Mock Chat Data
    const [messages, setMessages] = useState({
        overall: [
            { id: 1, sender: 'Admin', text: 'Welcome to the new semester! 🎓', time: '10:00 AM' },
            { id: 2, sender: 'System', text: 'Server maintenance scheduled for tonight.', time: '11:30 AM' },
        ],
        personal: [
            { id: 1, sender: 'Dr. Smith', text: 'Can we reschedule the meeting?', time: '09:15 AM', unread: true },
            { id: 2, sender: 'Dean', text: 'Please review the attached report.', time: 'Yesterday', unread: false },
        ]
    });

    const [inputText, setInputText] = useState('');

    // Mock Notifications Data
    const notifications = [
        { id: 1, title: 'New Task Assigned', desc: 'Review final year projects', time: '2 hrs ago', unread: true },
        { id: 2, title: 'Meeting Reminder', desc: 'Faculty Board Meeting in 30 mins', time: '5 hrs ago', unread: true },
        { id: 3, title: 'System Update', desc: 'New version deployed successfully', time: '1 day ago', unread: false },
    ];

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
        if (!inputText.trim()) return;

        const newMessage = {
            id: Date.now(),
            sender: 'You',
            text: inputText,
            time: 'Just now',
            isMe: true
        };

        setMessages(prev => ({
            ...prev,
            [chatTab]: [...prev[chatTab], newMessage]
        }));
        setInputText('');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
                    <Menu size={24} />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Admin Panel</h2>
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
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setChatTab('overall')}
                                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${chatTab === 'overall' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Overall
                                </button>
                                <button
                                    onClick={() => setChatTab('personal')}
                                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${chatTab === 'personal' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Personal
                                </button>
                            </div>

                            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {messages[chatTab].length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <MessageSquare size={32} className="mb-2 opacity-20" />
                                        <p className="text-sm">No messages yet</p>
                                    </div>
                                ) : (
                                    messages[chatTab].map(msg => (
                                        <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${msg.isMe
                                                    ? 'bg-primary-600 text-white rounded-br-none'
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                                                {!msg.isMe && <span className="font-medium">{msg.sender} •</span>}
                                                <span>{msg.time}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Message ${chatTab}...`}
                                    className="flex-1 text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <button type="submit" className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-md shadow-slate-200">
                                    <Send size={16} />
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
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    {activePopover === 'notifications' && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">Mark all read</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.map(notif => (
                                    <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/30' : ''}`}>
                                        <div className="flex gap-3">
                                            <div className="mt-1 min-w-[32px] h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Bell size={14} />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm ${notif.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{notif.title}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                                                <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                                            </div>
                                            {notif.unread && <div className="mt-2 w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 text-center border-t border-gray-100 bg-gray-50/50">
                                <button className="text-xs font-semibold text-gray-500 hover:text-gray-800">View All Notifications</button>
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
        </header>
    )
}

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
