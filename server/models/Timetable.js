const mongoose = require('mongoose');

// Timetable slot for a faculty member  (faculties/{uid}/timetable)
const timetableSchema = mongoose.Schema({
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subject: { type: String, required: true },
    room: { type: String, required: true },
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true },
    classSection: { type: String, required: true }, // e.g. "CSE-A"
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
module.exports = Timetable;
