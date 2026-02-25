import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getOverallHistoryAPI, getDMHistoryAPI, getDMThreadsAPI } from '../utils/api';
import {
    MessageSquare, Users, User, Send, Hash,
    ArrowLeft, Clock, Wifi, WifiOff,
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

// group messages by date for dividers
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

// Avatar initials + colour
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

// ── Message List (scrolls to bottom) ─────────────────────────────────────────
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

    // Auto-resize textarea
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

// ── Faculty Thread Card ───────────────────────────────────────────────────────
const ThreadCard = ({ thread, myId, onClick }) => {
    // extract the other user's id from room string dm_A_B
    const parts = thread._id.split('_'); // ['dm', id1, id2]
    const otherId = parts[1] === myId ? parts[2] : parts[1];

    return (
        <button
            onClick={() => onClick({ id: otherId, name: thread.senderName, role: thread.senderRole })}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50"
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarColor(thread.senderName)}`}>
                {initials(thread.senderName)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{thread.senderName}</p>
                <p className="text-xs text-gray-400 truncate">{thread.lastMsg}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] text-gray-400">{formatTime(thread.lastAt)}</span>
                <span className="text-[10px] text-gray-300 capitalize">{thread.senderRole}</span>
            </div>
        </button>
    );
};

// ── Main Chat Page ────────────────────────────────────────────────────────────
const Chat = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overall');  // 'overall' | 'personal'
    const [messages, setMessages] = useState([]);
    const [threads, setThreads] = useState([]);         // DM thread list
    const [activeDM, setActiveDM] = useState(null);       // { id, name, role }
    const [connected, setConnected] = useState(false);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const socketRef = useRef(null);
    const currentRoom = useRef('overall');

    // ── Socket setup ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.token) return;

        const socket = io(SOCKET_URL, {
            auth: { token: user.token },
            transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('receive_message', (msg) => {
            if (msg.room === currentRoom.current) {
                setMessages(prev => [...prev, msg]);
            }
            // Refresh DM thread list whenever any personal message arrives
            if (msg.room.startsWith('dm_')) loadThreads();
        });

        // Join overall on mount
        socket.emit('join_room', 'overall');

        return () => socket.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token]);

    // ── Load message history ────────────────────────────────────────────────
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

    // Load data on tab change
    useEffect(() => {
        if (activeTab === 'overall') {
            currentRoom.current = 'overall';
            socketRef.current?.emit('join_room', 'overall');
            loadOverall();
            setActiveDM(null);
        } else {
            loadThreads();
            setMessages([]);
        }
    }, [activeTab, loadOverall, loadThreads]);

    // Open a DM conversation
    const openDM = (peer) => {
        setActiveDM(peer);
        const room = dmRoom(user._id, peer.id);
        currentRoom.current = room;
        socketRef.current?.emit('join_room', room);
        loadDM(peer.id);
    };

    const closeDM = () => {
        setActiveDM(null);
        setMessages([]);
    };

    // Send handler
    const handleSend = (text) => {
        if (!socketRef.current || !connected) return;
        socketRef.current.emit('send_message', { room: currentRoom.current, text });
    };

    const userId = user?._id;

    // ── Render: Personal tab — DM open ──────────────────────────────────────
    if (activeTab === 'personal' && activeDM) {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                {/* Tab Bar */}
                <TabBar active={activeTab} onChange={setActiveTab} connected={connected} />

                {/* DM Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                    <button onClick={closeDM} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft size={18} className="text-gray-500" />
                    </button>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarColor(activeDM.name)}`}>
                        {initials(activeDM.name)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{activeDM.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{activeDM.role}</p>
                    </div>
                </div>

                {loadingMsgs
                    ? <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
                    : <MessageList messages={messages} userId={userId} />
                }
                <InputBar onSend={handleSend} disabled={!connected} />
            </div>
        );
    }

    // ── Render: Normal layout ────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-gray-50">
            <TabBar active={activeTab} onChange={setActiveTab} connected={connected} />

            {activeTab === 'overall' ? (
                <>
                    {/* Overall header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
                        <Hash size={16} className="text-gray-400" />
                        <p className="text-sm font-semibold text-gray-700">Overall — All Faculty &amp; Admin</p>
                    </div>

                    {loadingMsgs
                        ? <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
                        : <MessageList messages={messages} userId={userId} />
                    }
                    <InputBar onSend={handleSend} disabled={!connected} />
                </>
            ) : (
                /* Personal tab — thread list */
                <>
                    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
                        <User size={16} className="text-gray-400" />
                        <p className="text-sm font-semibold text-gray-700">Personal Messages</p>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white">
                        {threads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 py-16">
                                <User size={40} className="text-gray-200" />
                                <p className="text-sm text-center px-8">
                                    No personal chats yet.<br />
                                    Faculty members can message you from their app — their name will appear here.
                                </p>
                            </div>
                        ) : (
                            threads.map(t => (
                                <ThreadCard
                                    key={t._id}
                                    thread={t}
                                    myId={userId}
                                    onClick={openDM}
                                />
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// ── Tab Bar component ─────────────────────────────────────────────────────────
const TabBar = ({ active, onChange, connected }) => (
    <div className="flex items-center justify-between px-4 pt-4 pb-0 bg-white border-b border-gray-100">
        <div className="flex gap-1">
            {[
                { id: 'overall', label: 'Overall', icon: Users },
                { id: 'personal', label: 'Personal', icon: User },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${active === tab.id
                        ? 'border-slate-900 text-slate-900 bg-slate-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <tab.icon size={15} />
                    {tab.label}
                </button>
            ))}
        </div>
        {/* Connection indicator */}
        <div className={`flex items-center gap-1.5 text-xs mb-1 ${connected ? 'text-emerald-600' : 'text-gray-400'}`}>
            {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {connected ? 'Live' : 'Connecting…'}
        </div>
    </div>
);

export default Chat;
