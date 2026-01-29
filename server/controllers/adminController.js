const Faculty = require('../models/Faculty');
const Task = require('../models/Task');
const Meeting = require('../models/Meeting');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    const totalFaculty = await Faculty.countDocuments();
    const activeTasks = await Task.countDocuments({ status: { $ne: 'Verified' } });
    const meetingsToday = await Meeting.countDocuments({
        date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
    });

    // Status breakdown
    const statusCounts = await Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
        totalFaculty,
        activeTasks,
        meetingsToday,
        taskStats: statusCounts
    });
};

// @desc    Get all faculty
// @route   GET /api/admin/faculty
// @access  Private/Admin
const getFaculty = async (req, res) => {
    const faculty = await Faculty.find({});
    res.json(faculty);
};

// @desc    Add faculty
// @route   POST /api/admin/faculty
// @access  Private/Admin
const addFaculty = async (req, res) => {
    const { name, email, department, designation, phone } = req.body;
    const faculty = await Faculty.create({ name, email, department, designation, phone });
    res.status(201).json(faculty);
};

// @desc    Delete faculty
// @route   DELETE /api/admin/faculty/:id
// @access  Private/Admin
const deleteFaculty = async (req, res) => {
    const faculty = await Faculty.findById(req.params.id);
    if (faculty) {
        await faculty.deleteOne();
        res.json({ message: 'Faculty removed' });
    } else {
        res.status(404).json({ message: 'Faculty not found' });
    }
};

// @desc    Get all tasks
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getTasks = async (req, res) => {
    const tasks = await Task.find({}).populate('assignedTo', 'name');
    res.json(tasks);
};

// @desc    Create task
// @route   POST /api/admin/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
    const { title, description, assignedTo, dueDate } = req.body;
    const task = await Task.create({ title, description, assignedTo, dueDate });
    res.status(201).json(task);
};

module.exports = {
    getDashboardStats,
    getFaculty,
    addFaculty,
    deleteFaculty,
    getTasks,
    createTask
};
