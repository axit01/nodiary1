const mongoose = require('mongoose');

const meetingSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // '14:00'
    endTime: { type: String, required: true },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
    }],
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },
}, {
    timestamps: true,
});

const Meeting = mongoose.model('Meeting', meetingSchema);
module.exports = Meeting;
