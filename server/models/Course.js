const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    courseCode: { type: String, required: true, unique: true }, // e.g. "CS101"
    name: { type: String, required: true },              // "Intro to Computer Science"
    department: { type: String, required: true },
    credits: { type: Number, default: 3 },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
