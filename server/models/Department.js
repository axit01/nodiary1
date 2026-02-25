const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
    deptId: { type: String, required: true, unique: true }, // e.g. "CS", "MECH"
    name: { type: String, required: true },               // e.g. "Computer Science"
    hodName: { type: String, default: '' },
    hodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    totalFaculty: { type: Number, default: 0 },
    announcements: [{ type: String }],
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
