const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const Message = require('./models/Message');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
const server = http.createServer(app);  // wrap express with http for socket.io

// ── Socket.io server ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Auth middleware for socket connections
io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // If token has name+role embedded (new tokens), use them directly
        // Else fall back to a DB lookup (old tokens)
        if (decoded.name && decoded.role) {
            socket.user = { id: decoded.id, name: decoded.name, role: decoded.role };
        } else {
            const User = require('./models/User');
            const u = await User.findById(decoded.id).select('name role');
            if (!u) return next(new Error('User not found'));
            socket.user = { id: decoded.id, name: u.name, role: u.role };
        }
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    const { id: userId, name, role } = socket.user;

    // Join a room (overall or dm_xxx_yyy)
    socket.on('join_room', (room) => {
        socket.join(room);
    });

    // Send message to a room — persist + broadcast
    socket.on('send_message', async ({ room, text }) => {
        if (!text?.trim()) return;
        try {
            const msg = await Message.create({
                room,
                sender: userId,
                senderName: name,
                senderRole: role,
                text: text.trim(),
                readBy: [userId],
            });
            // Broadcast to everyone in the room (including sender)
            io.to(room).emit('receive_message', {
                _id: msg._id,
                room: msg.room,
                sender: userId,
                senderName: name,
                senderRole: role,
                text: msg.text,
                createdAt: msg.createdAt,
            });
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('delete_message', async ({ id, room }) => {
        try {
            const msg = await Message.findById(id);
            if (!msg) return;

            // Optional: check if sender is the one deleting OR if user is admin
            if (msg.sender.toString() !== userId && role !== 'admin') {
                return socket.emit('error', { message: 'Unauthorized to delete this message' });
            }

            await Message.findByIdAndDelete(id);
            io.to(room).emit('message_deleted', id);
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('disconnect', () => { });
});

// ── Express middleware ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ── REST: Chat history endpoints (protected by JWT header) ────────────────────
const { protect } = require('./middleware/authMiddleware');

// GET /api/chat/overall  — last 100 messages in the group chat
app.get('/api/chat/overall', protect, async (req, res) => {
    try {
        const msgs = await Message.find({ room: 'overall' })
            .sort({ createdAt: 1 })
            .limit(100);
        res.json(msgs);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET /api/chat/dm/:otherUserId  — DM history between caller and otherUser
app.get('/api/chat/dm/:otherUserId', protect, async (req, res) => {
    try {
        const ids = [req.user._id.toString(), req.params.otherUserId].sort();
        const room = `dm_${ids[0]}_${ids[1]}`;
        const msgs = await Message.find({ room }).sort({ createdAt: 1 }).limit(200);
        res.json(msgs);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET /api/chat/dm-threads  — list all rooms that the current user is part of
app.get('/api/chat/dm-threads', protect, async (req, res) => {
    try {
        const myId = req.user._id.toString();

        // Find all rooms where my ID is part of the string
        const rooms = await Message.distinct('room', { room: { $regex: myId } });

        const threads = [];
        for (const room of rooms) {
            // Room format: dm_id1_id2
            const ids = room.replace('dm_', '').split('_');
            const otherId = ids.find(id => id !== myId);

            if (otherId) {
                const User = require('./models/User');
                const lastMsg = await Message.findOne({ room }).sort({ createdAt: -1 });
                const otherUser = await User.findById(otherId).select('name role');

                if (otherUser) {
                    threads.push({
                        _id: room,
                        room: room,
                        senderName: otherUser.name,
                        senderRole: otherUser.role,
                        senderId: otherId,
                        lastMsg: lastMsg ? lastMsg.text : '',
                        lastAt: lastMsg ? lastMsg.createdAt : null
                    });
                }
            }
        }

        // Sort by most recent
        threads.sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));
        res.json(threads);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET /api/chat/admins — get all admins to start a conversation with
app.get('/api/chat/admins', protect, async (req, res) => {
    try {
        const User = require('./models/User');
        const admins = await User.find({ role: 'admin' }).select('name role');
        res.json(admins);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ── Existing routes ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('CampusOps Admin API is running...'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
