import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getOverallHistoryAPI, getDMHistoryAPI, getDMThreadsAPI, getAdminsAPI } from '../utils/api';
import {
    MessageSquare, Users, User, Send, Hash,
    ArrowLeft, Clock, Wifi, WifiOff, Search, PlusCircle, UserPlus
} from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

// ── Helpers ───────────────────────────────────────────────────────────────────
const dmRoom = (id1, id2) => {
    const sorted = [id1, id2].sort();
    return `dm_${sorted[0]}_${sorted[1]}`;
};

const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const groupByDate = (msgs) => {
    const groups = [];
    let lastDate = null;
    msgs.forEach(m => {
        const day = new Date(m.createdAt).toDateString();
        if (day !== lastDate) { groups.push({ type: 'divider', label: formatDate(m.createdAt) }); lastDate = day; }
        groups.push({ type: 'message', ...m });
    });
    return groups;
};

const AVATAR_COLORS = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-teal-500',
];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// ── Chat Bubble ───────────────────────────────────────────────────────────────
const Bubble = ({ msg, isMe }) => (
    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isMe && (
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(msg.senderName)}`}>
                {initials(msg.senderName)}
            </div>
        )}
        <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
            {isMe ? (
                <span className="text-xs font-semibold text-gray-500 px-1 text-right w-full">You</span>
            ) : (
                <span className="text-xs font-semibold text-gray-500 px-1">
                    {msg.senderName}
                    {msg.senderRole === 'admin' && <span className="ml-1 text-[10px] text-blue-500 font-bold">[Admin]</span>}
                </span>
            )}
            <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${isMe
                ? 'bg-slate-900 text-white rounded-br-sm'
                : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
                }`}>
                {msg.text}
            </div>
            <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
        </div>
    </div>
);

// ── Message List ─────────────────────────────────────────────────────────────
const MessageList = ({ messages, userId }) => {
    const bottomRef = useRef(null);
    const grouped = groupByDate(messages);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
            <MessageSquare size={40} className="text-gray-200" />
            <p className="text-sm">No messages yet — say hello!</p>
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {grouped.map((item, i) =>
                item.type === 'divider'
                    ? <div key={i} className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[11px] text-gray-400 font-medium">{item.label}</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    : <Bubble key={item._id || i} msg={item} isMe={item.sender?.toString() === userId} />
            )}
            <div ref={bottomRef} />
        </div>
    );
};

// ── Input Bar ─────────────────────────────────────────────────────────────────
const InputBar = ({ onSend, disabled }) => {
    const [text, setText] = useState('');
    const taRef = useRef(null);

    const resize = () => {
        const ta = taRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    };

    const handleSend = () => {
        if (!text.trim() || disabled) return;
        onSend(text.trim());
        setText('');
        if (taRef.current) { taRef.current.style.height = 'auto'; }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <div className="border-t border-gray-100 bg-white px-4 py-3 flex-shrink-0">
            <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2">
                <textarea
                    ref={taRef}
                    rows={1}
                    value={text}
                    onChange={e => { setText(e.target.value); resize(); }}
                    onKeyDown={handleKey}
                    placeholder="Type a message… (Enter to send)"
                    disabled={disabled}
                    className="flex-1 resize-none bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 overflow-hidden leading-5 pt-0.5"
                    style={{ minHeight: '20px', maxHeight: '120px' }}
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim() || disabled}
                    className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-colors flex-shrink-0 mb-0.5"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

// ── Thread/Admin Card ────────────────────────────────────────────────────────
const ThreadCard = ({ thread, myId, onClick }) => {
    const parts = thread._id.split('_');
    const otherId = parts.length > 1 ? (parts[1] === myId ? parts[2] : parts[1]) : thread.senderId;

    return (
        <button
            onClick={() => onClick({ id: otherId, name: thread.senderName, role: thread.senderRole })}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all text-left border-b border-gray-50 group"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform ${avatarColor(thread.senderName)}`}>
                {initials(thread.senderName)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-bold text-slate-900 truncate">{thread.senderName}</p>
                    {thread.lastAt && <span className="text-[10px] text-gray-400 font-medium">{formatTime(thread.lastAt)}</span>}
                </div>
                <p className="text-xs text-gray-400 truncate font-medium">{thread.lastMsg || 'Tap to start conversation'}</p>
            </div>
        </button>
    );
};

// ── Tab Bar component ─────────────────────────────────────────────────────────
const TabBar = ({ active, onChange, connected }) => (
    <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-md mx-auto px-4 py-4">
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 relative overflow-hidden">
                {[
                    { id: 'overall', label: 'Overall Channel', icon: Users },
                    { id: 'personal', label: 'Private Messages', icon: User },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 relative z-10 ${active === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon size={14} className={active === tab.id ? 'text-indigo-600' : ''} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
        {/* Connection status bar */}
        {!connected && (
            <div className="bg-amber-50 text-amber-600 text-[10px] py-1 px-4 font-black uppercase tracking-[0.2em] text-center border-b border-amber-100">
                Connection lost • Attempting to reconnect...
            </div>
        )}
    </div>
);

// ── Main Chat Page ────────────────────────────────────────────────────────────
const Chat = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overall');
    const [messages, setMessages] = useState([]);
    const [threads, setThreads] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [activeDM, setActiveDM] = useState(null);
    const [connected, setConnected] = useState(false);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const socketRef = useRef(null);
    const currentRoom = useRef('overall');

    useEffect(() => {
        if (!user?.token) return;
        const socket = io(SOCKET_URL, { auth: { token: user.token }, transports: ['websocket'] });
        socketRef.current = socket;
        socket.on('connect', () => {
            setConnected(true);
            socket.emit('join_room', currentRoom.current);
        });
        socket.on('disconnect', () => setConnected(false));
        socket.on('receive_message', (msg) => {
            if (msg.room === currentRoom.current) {
                setMessages(prev => [...prev, msg]);
            }
            if (msg.room.startsWith('dm_')) loadThreads();
        });
        return () => socket.disconnect();
    }, [user?.token]);

    const loadOverall = useCallback(async () => {
        setLoadingMsgs(true);
        try {
            const { data } = await getOverallHistoryAPI();
            setMessages(data);
        } catch { setMessages([]); }
        finally { setLoadingMsgs(false); }
    }, []);

    const loadDM = useCallback(async (otherId) => {
        setLoadingMsgs(true);
        try {
            const { data } = await getDMHistoryAPI(otherId);
            setMessages(data);
        } catch { setMessages([]); }
        finally { setLoadingMsgs(false); }
    }, []);

    const loadThreads = useCallback(async () => {
        try {
            const { data } = await getDMThreadsAPI();
            setThreads(data);
        } catch { setThreads([]); }
    }, []);

    const loadAdmins = useCallback(async () => {
        try {
            const { data } = await getAdminsAPI();
            setAdmins(data.filter(a => a._id !== user._id));
        } catch { setAdmins([]); }
    }, [user._id]);

    useEffect(() => {
        if (activeTab === 'overall') {
            currentRoom.current = 'overall';
            socketRef.current?.emit('join_room', 'overall');
            loadOverall();
            setActiveDM(null);
        } else {
            loadThreads();
            if (user.role !== 'admin') loadAdmins();
            setMessages([]);
        }
    }, [activeTab, loadOverall, loadThreads, loadAdmins, user.role]);

    const openDM = (peer) => {
        setActiveDM(peer);
        const room = dmRoom(user._id, peer.id);
        currentRoom.current = room;
        socketRef.current?.emit('join_room', room);
        loadDM(peer.id);
    };

    const closeDM = () => {
        setActiveDM(null);
        currentRoom.current = 'personal-list';
        setMessages([]);
    };

    const handleSend = (text) => {
        if (!socketRef.current || !connected) return;
        socketRef.current.emit('send_message', { room: currentRoom.current, text });
    };

    const userId = user?._id;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <TabBar active={activeTab} onChange={setActiveTab} connected={connected} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'overall' ? (
                    <div className="flex-1 flex flex-col overflow-hidden bg-white">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-white">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Hash size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Main Channel</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public Campus Hall</p>
                            </div>
                        </div>

                        {loadingMsgs
                            ? <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Synchronizing pulse…</div>
                            : <MessageList messages={messages} userId={userId} />
                        }
                        <InputBar onSend={handleSend} disabled={!connected} />
                    </div>
                ) : activeDM ? (
                    <div className="flex-1 flex flex-col overflow-hidden bg-white">
                        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 bg-white">
                            <button onClick={closeDM} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <ArrowLeft size={18} className="text-gray-500" />
                            </button>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-sm ${avatarColor(activeDM.name)}`}>
                                {initials(activeDM.name)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">{activeDM.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Endpoint • {activeDM.role}</p>
                            </div>
                        </div>

                        {loadingMsgs
                            ? <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Decrypting logs…</div>
                            : <MessageList messages={messages} userId={userId} />
                        }
                        <InputBar onSend={handleSend} disabled={!connected} />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden bg-white">
                        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 tracking-tight">Private Threads</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End-to-end encrypted</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                            {threads.length === 0 && admins.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-10 py-20 grayscale opacity-40">
                                    <MessageSquare size={64} className="text-slate-200 mb-6" />
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase">Silence in Sector</h3>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                                        No active conversations found.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {threads.length > 0 && (
                                        <>
                                            <p className="px-6 pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Sessions</p>
                                            {threads.map(t => (
                                                <ThreadCard key={t._id} thread={t} myId={userId} onClick={openDM} />
                                            ))}
                                        </>
                                    )}

                                    {user.role !== 'admin' && admins.length > 0 && (
                                        <>
                                            <p className="px-6 pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Administrators</p>
                                            {admins.map(admin => (
                                                <button
                                                    key={admin._id}
                                                    onClick={() => openDM({ id: admin._id, name: admin.name, role: admin.role })}
                                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all text-left group"
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform ${avatarColor(admin.name)}`}>
                                                        {initials(admin.name)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-900">{admin.name}</p>
                                                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">Start Conversation</p>
                                                    </div>
                                                    <PlusCircle size={20} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
