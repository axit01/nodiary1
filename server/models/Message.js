const mongoose = require('mongoose');

/**
 * room: 'overall'              → global group chat (admin + all faculty)
 * room: 'dm_<userId1>_<userId2>' → personal DM between two users
 *   (IDs always sorted so the key is consistent regardless of who initiates)
 */
const messageSchema = new mongoose.Schema({
    room: { type: String, required: true, index: true },  // 'overall' or 'dm_XXX_YYY'
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['admin', 'faculty'], required: true },
    text: { type: String, required: true, maxlength: 2000 },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
