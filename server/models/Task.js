const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true,
    },
    status: {
        type: String,
        enum: ['Assigned', 'Accepted', 'In Progress', 'Completed', 'Verified'],
        default: 'Assigned',
    },
    dueDate: { type: Date },
    isOverdue: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
