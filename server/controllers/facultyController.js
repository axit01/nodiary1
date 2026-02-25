const Task = require('../models/Task');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

// @desc    Update task status (Accept/Decline/In Progress/Completed)
// @route   PUT /api/faculty/tasks/:id/status
// @access  Faculty
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Accepted', 'Rejected', 'In Progress', 'Completed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status update' });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Find the faculty record associated with the logged-in user
        const faculty = await Faculty.findOne({ email: req.user.email });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }

        // Ensure the task is assigned to this faculty
        if (task.assignedTo.toString() !== faculty._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this task' });
        }

        task.status = status;
        await task.save();

        // Optional: Notify Admin/HOD when a task is Rejected or Completed
        if (status === 'Rejected' || status === 'Completed') {
            await Notification.create({
                faculty: faculty._id, // In this system, notifications are for faculty, but we can repurpose or add an admin notification model
                title: `Task ${status}`,
                message: `Faculty ${faculty.name} has marked the task "${task.title}" as ${status}.`,
                type: 'task',
                relatedId: task._id,
            });
        }

        res.json({ message: `Task marked as ${status}`, task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my assigned tasks
// @route   GET /api/faculty/tasks
// @access  Faculty
const getMyTasks = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ email: req.user.email });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }

        const tasks = await Task.find({ assignedTo: faculty._id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateTaskStatus,
    getMyTasks
};
