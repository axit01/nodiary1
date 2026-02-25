const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    configId: { type: String, default: 'config', unique: true }, // Always one document
    collegeName: { type: String, default: 'CampusOps Institute of Technology' },
    academicYear: { type: String, default: '2025-26' },
    workingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
