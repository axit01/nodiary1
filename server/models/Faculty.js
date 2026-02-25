const mongoose = require('mongoose');

const facultySchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    phone: { type: String },
    // Courses this faculty teaches (array of courseCode strings e.g. ["CS101","CS202"])
    courses: [{ type: String }],
    status: {
        type: String,
        enum: ['Free', 'Busy', 'Meeting', 'Leave'],
        default: 'Free',
    },
    workload: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
