const mongoose = require('mongoose');

const facultySchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    phone: { type: String },
    status: {
        type: String,
        enum: ['Free', 'Busy', 'Meeting', 'Leave'],
        default: 'Free',
    },
    workload: { type: Number, default: 0 }, // Hours or tasks count
}, {
    timestamps: true,
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;
