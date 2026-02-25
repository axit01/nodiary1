const Faculty = require('../models/Faculty');
const Task = require('../models/Task');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const User = require('../models/User');
const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Department = require('../models/Department');
const { sendInviteEmail } = require('../utils/mailer');

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
    try {
        const isHod = req.user.role === 'hod';
        const dept = req.user.department;

        // Filtering for HODs
        const facultyQuery = isHod ? { department: dept } : {};

        let taskQuery = { status: { $nin: ['Verified', 'Completed'] } };
        if (isHod) {
            const deptFaculty = await Faculty.find({ department: dept }).select('_id');
            const facultyIds = deptFaculty.map(f => f._id);
            taskQuery.assignedTo = { $in: facultyIds };
        }

        const totalFaculty = await Faculty.countDocuments(facultyQuery);
        const activeTasks = await Task.countDocuments(taskQuery);

        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

        let meetingQuery = { date: { $gte: todayStart, $lt: todayEnd } };
        if (isHod) {
            const deptFaculty = await Faculty.find({ department: dept }).select('_id');
            const facultyIds = deptFaculty.map(f => f._id);
            meetingQuery.participants = { $in: facultyIds };
        }

        const meetingsToday = await Meeting.countDocuments(meetingQuery);

        const taskStats = await Task.aggregate([
            ...(isHod ? [{ $match: taskQuery }] : []),
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const facultyStatusStats = await Faculty.aggregate([
            ...(isHod ? [{ $match: { department: dept } }] : []),
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({ totalFaculty, activeTasks, meetingsToday, taskStats, facultyStatusStats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// FACULTY
// ─────────────────────────────────────────────

// Helper: generate a readable auto-password like  CampusDoe@4821
const generatePassword = (name) => {
    const lastName = name.trim().split(' ').pop();
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `Campus${lastName}@${digits}`;
};

const getFaculty = async (req, res) => {
    try {
        const { search, department } = req.query;
        const query = {};

        // Filtering
        if (req.user.role === 'hod') {
            query.department = req.user.department;
        } else if (req.user.role === 'faculty') {
            query.email = req.user.email; // Faculty can only see their own profile in this search
        } else if (department) {
            query.department = department;
        }

        if (search) {
            query.$and = [
                ...(query.department ? [{ department: query.department }] : []),
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                    ]
                }
            ];
            // If we have $and, we remove the top-level department to avoid duplication if it was added above
            if (query.department) delete query.department;
        }

        const faculty = await Faculty.find(query).sort({ createdAt: -1 });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add faculty + auto-create their login account
// @route   POST /api/admin/faculty
const addFaculty = async (req, res) => {
    let faculty = null;
    try {
        const { name, email, department, designation, phone, courses } = req.body;

        const exists = await Faculty.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Faculty with this email already exists' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'A user account with this email already exists' });

        // 1. Create Faculty record
        faculty = await Faculty.create({ name, email, department, designation, phone, courses: courses || [] });

        // 2. Auto-generate credentials and create User login account
        const plainPassword = generatePassword(name);
        const isHOD = designation && (designation.toUpperCase().includes('HOD') || designation.toUpperCase().includes('HEAD'));

        await User.create({
            name,
            email,
            password: plainPassword,
            role: isHOD ? 'hod' : 'faculty',
            department: department // Link user to their department for filtering
        });

        // 3. Send invite email automatically (non-fatal — don't block response if it fails)
        let emailSent = false;
        try {
            const result = await sendInviteEmail({
                name,
                email,
                password: plainPassword,
                collegeName: process.env.COLLEGE_NAME,
            });
            emailSent = result.sent;
        } catch (mailErr) {
            console.error('📧 Email failed (non-fatal):', mailErr.message);
        }

        // 4. Return faculty + plaintext credentials (only once) + email status
        res.status(201).json({
            faculty,
            credentials: {
                email,
                password: plainPassword,
                appName: 'CampusOps Faculty App',
                message: `Hi ${name}! Your CampusOps account has been created by the admin.`,
                emailSent,
            },
        });
    } catch (error) {
        // ROLLBACK: if User creation failed but Faculty was already created, delete it
        if (faculty) {
            await Faculty.findByIdAndDelete(faculty._id).catch(() => { });
        }
        res.status(500).json({ message: error.message || 'Failed to create faculty account' });
    }
};

const updateFaculty = async (req, res) => {
    try {
        const facultyToUpdate = await Faculty.findById(req.params.id);
        if (!facultyToUpdate) return res.status(404).json({ message: 'Faculty not found' });

        // Security: Faculty can only update themselves
        if (req.user.role === 'faculty' && facultyToUpdate.email !== req.user.email) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
        }

        const updated = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        // Sync role and department in User model
        const isHOD = updated.designation && (updated.designation.toUpperCase().includes('HOD') || updated.designation.toUpperCase().includes('HEAD'));
        await User.findOneAndUpdate(
            { email: updated.email },
            {
                role: isHOD ? 'hod' : 'faculty',
                department: updated.department
            }
        ).catch(e => console.error('Role sync error:', e));

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        await faculty.deleteOne();
        await Task.deleteMany({ assignedTo: req.params.id });
        await Notification.deleteMany({ faculty: req.params.id });
        await User.deleteOne({ email: faculty.email });  // remove login account too

        res.json({ message: 'Faculty and related records removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────

const getTasks = async (req, res) => {
    try {
        const { status, assignedTo } = req.query;
        let query = {};

        if (req.user.role === 'hod') {
            const deptFaculty = await Faculty.find({ department: req.user.department }).select('_id');
            const facultyIds = deptFaculty.map(f => f._id);
            query.assignedTo = { $in: facultyIds };
        } else if (req.user.role === 'faculty') {
            const myProfile = await Faculty.findOne({ email: req.user.email });
            query.assignedTo = myProfile ? myProfile._id : req.user._id;
        } else if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        if (status) query.status = status;

        const tasks = await Task.find(query).populate('assignedTo', 'name department').sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate, priority } = req.body;

        const faculty = await Faculty.findById(assignedTo);
        if (!faculty) return res.status(404).json({ message: 'Assigned faculty not found' });

        const task = await Task.create({ title, description, assignedTo, dueDate, priority });

        await Notification.create({
            faculty: assignedTo,
            title: 'New Task Assigned',
            message: `A new task "${title}" has been assigned to you by the Admin. Priority: ${priority}. Due: ${new Date(dueDate).toLocaleDateString()}. Action required: Accept or Reject.`,
            type: 'task',
            relatedId: task._id,
        });

        // Automated Personal Message (DM) to the assigned faculty
        try {
            const adminId = req.user._id;
            const adminName = req.user.name;

            // Find the user account for this faculty
            const recipientUser = await User.findOne({ email: faculty.email });

            if (recipientUser) {
                const sortedIds = [adminId.toString(), recipientUser._id.toString()].sort();
                const room = `dm_${sortedIds[0]}_${sortedIds[1]}`;

                await Message.create({
                    room,
                    sender: adminId,
                    senderName: adminName,
                    senderRole: 'admin',
                    text: `📝 *New Task Assigned*: ${title}\n⏳ *Due Date*: ${new Date(dueDate).toLocaleDateString()}\n⚡ *Priority*: ${priority || 'Normal'}\n\n📖 *Description*: ${description || 'No additional description.'}`,
                });
            }
        } catch (chatErr) {
            console.error('Failed to send automated task chat message:', chatErr.message);
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Security: Faculty can only update tasks assigned to them
        if (req.user.role === 'faculty') {
            const myProfile = await Faculty.findOne({ email: req.user.email });
            if (!myProfile || task.assignedTo.toString() !== myProfile._id.toString()) {
                return res.status(403).json({ message: 'Forbidden: You can only update your own tasks' });
            }
        }

        const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// MEETINGS
// ─────────────────────────────────────────────

const getMeetings = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'hod') {
            const deptFaculty = await Faculty.find({ department: req.user.department }).select('_id');
            const facultyIds = deptFaculty.map(f => f._id);
            query.participants = { $in: facultyIds };
        } else if (req.user.role === 'faculty') {
            const myProfile = await Faculty.findOne({ email: req.user.email });
            if (myProfile) {
                query.participants = myProfile._id;
            }
        }

        const meetings = await Meeting.find(query)
            .populate('participants', 'name department')
            .sort({ date: 1 });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMeeting = async (req, res) => {
    try {
        const { title, description, date, startTime, endTime, location, participants } = req.body;

        const meeting = await Meeting.create({
            title, description, date, startTime, endTime,
            location: location || '',
            participants: participants || [],
        });

        if (participants && participants.length > 0) {
            // 1. Create In-App Notifications
            const notifications = participants.map(facultyId => ({
                faculty: facultyId,
                title: 'Meeting Scheduled by Admin',
                message: `Admin has scheduled a meeting: "${title}". \n📍 Location: ${location || 'N/A'}\n⏰ Time: ${new Date(date).toLocaleDateString()} at ${startTime} - ${endTime}\n📝 Details: ${description || 'No additional details.'}`,
                type: 'meeting',
                relatedId: meeting._id,
            }));
            await Notification.insertMany(notifications);

            // 2. Automated Personal Message (DM) to each participant
            try {
                const adminId = req.user._id;
                const adminName = req.user.name;

                // Find all faculty users to get their emails/userIDs
                const facultyDocs = await Faculty.find({ _id: { $in: participants } });
                const facultyEmails = facultyDocs.map(f => f.email);
                const recipientUsers = await User.find({ email: { $in: facultyEmails } });

                const chatMessages = recipientUsers.map(u => {
                    const sortedIds = [adminId.toString(), u._id.toString()].sort();
                    const room = `dm_${sortedIds[0]}_${sortedIds[1]}`;

                    return {
                        room,
                        sender: adminId,
                        senderName: adminName,
                        senderRole: 'admin',
                        text: `📅 *Meeting Scheduled*: ${title}\n📍 *Location*: ${location || 'Not Specified'}\n⏰ *Time*: ${new Date(date).toLocaleDateString()} at ${startTime} - ${endTime}\n\n📝 *Details*: ${description || 'No additional details provided.'}`,
                    };
                });

                if (chatMessages.length > 0) {
                    await Message.insertMany(chatMessages);
                }
            } catch (chatErr) {
                console.error('Failed to send automated chat messages:', chatErr.message);
                // We don't block the response even if chat relay fails
            }
        }

        const populated = await Meeting.findById(meeting._id).populate('participants', 'name department');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const updated = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('participants', 'name department');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        await meeting.deleteOne();
        res.json({ message: 'Meeting cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

const getFacultyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ faculty: req.params.facultyId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const respondToTask = async (req, res) => {
    try {
        const { taskId, notificationId, action } = req.body; // action: 'Accepted' or 'Rejected'
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.status = action;
        await task.save();

        if (notificationId) {
            await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        }

        res.json({ message: `Task ${action.toLowerCase()} successfully`, task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all notifications (Admin global log)
// @route GET /api/admin/notifications
const getAllNotifications = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'hod') {
            const deptFaculty = await Faculty.find({ department: req.user.department }).select('_id');
            const facultyIds = deptFaculty.map(f => f._id);
            query.faculty = { $in: facultyIds };
        }

        const notifications = await Notification.find(query)
            .populate('faculty', 'name department')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Mark all as read
// @route PUT /api/admin/notifications/read
const markAllNotificationsRead = async (req, res) => {
    try {
        let query = { isRead: false };
        if (req.user.role === 'hod') {
            const deptFaculty = await Faculty.find({ department: req.user.department }).select('_id');
            const facultyIds = deptFaculty.map(f => f._id);
            query.faculty = { $in: facultyIds };
        }
        await Notification.updateMany(query, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// COURSES (Settings → Courses tab)
// ─────────────────────────────────────────────

// @desc  Get all courses
// @route GET /api/admin/courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).sort({ department: 1, courseCode: 1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Add a course
// @route POST /api/admin/courses
const addCourse = async (req, res) => {
    try {
        const { courseCode, name, department, credits } = req.body;
        if (!courseCode || !name || !department) {
            return res.status(400).json({ message: 'courseCode, name, and department are required' });
        }
        const exists = await Course.findOne({ courseCode: courseCode.toUpperCase() });
        if (exists) return res.status(400).json({ message: `Course code "${courseCode}" already exists` });

        const course = await Course.create({
            courseCode: courseCode.toUpperCase(),
            name,
            department,
            credits: credits || 3,
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Delete a course + cascade remove from Timetable
// @route DELETE /api/admin/courses/:id
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Cascade: remove all timetable slots that reference this subject name
        const timetableResult = await Timetable.deleteMany({ subject: course.name });

        await course.deleteOne();

        res.json({
            message: `Course "${course.name}" deleted`,
            timetableSlotsRemoved: timetableResult.deletedCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// DEPARTMENTS (Settings → Departments tab)
// ─────────────────────────────────────────────

// @desc  Get all departments
// @route GET /api/admin/departments
const getDepartments = async (req, res) => {
    try {
        const depts = await Department.find({}).sort({ deptId: 1 });
        res.json(depts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Add a department
// @route POST /api/admin/departments
const addDepartment = async (req, res) => {
    try {
        const { deptId, name } = req.body;
        if (!deptId || !name) {
            return res.status(400).json({ message: 'deptId and name are required' });
        }
        const exists = await Department.findOne({ deptId: deptId.toUpperCase() });
        if (exists) return res.status(400).json({ message: `Department code "${deptId}" already exists` });

        const dept = await Department.create({ deptId: deptId.toUpperCase(), name });
        res.status(201).json(dept);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Delete department + cascade to Faculty, Course, Timetable
// @route DELETE /api/admin/departments/:id
const deleteDepartment = async (req, res) => {
    try {
        const dept = await Department.findById(req.params.id);
        if (!dept) return res.status(404).json({ message: 'Department not found' });

        // 1. Find all faculty in this department
        const deptFaculty = await Faculty.find({ department: dept.deptId });
        const facultyIds = deptFaculty.map(f => f._id);

        // 2. Cascade: delete timetable slots for those faculty
        const timetableResult = await Timetable.deleteMany({ faculty: { $in: facultyIds } });

        // 3. Cascade: delete tasks assigned to those faculty
        const taskResult = await Task.deleteMany({ assignedTo: { $in: facultyIds } });

        // 4. Cascade: delete notifications for those faculty
        await Notification.deleteMany({ faculty: { $in: facultyIds } });

        // 5. Remove their User login accounts
        const facultyEmails = deptFaculty.map(f => f.email);
        await User.deleteMany({ email: { $in: facultyEmails }, role: 'faculty' });

        // 6. Delete the faculty records
        const facultyResult = await Faculty.deleteMany({ department: dept.deptId });

        // 7. Delete courses in this department
        const courseResult = await Course.deleteMany({ department: dept.deptId });

        // 8. Delete the department itself
        await dept.deleteOne();

        res.json({
            message: `Department "${dept.name}" deleted`,
            removed: {
                faculty: facultyResult.deletedCount,
                courses: courseResult.deletedCount,
                timetable: timetableResult.deletedCount,
                tasks: taskResult.deletedCount,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// TIMETABLE
// ─────────────────────────────────────────────

// GET /api/admin/timetable  — all slots, populated with faculty name
const getTimetable = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'hod') {
            const deptFaculty = await Faculty.find({ department: req.user.department }).select('_id');
            const facultyIds = deptFaculty.map(f => f._id);
            query.faculty = { $in: facultyIds };
        } else if (req.user.role === 'faculty') {
            const myProfile = await Faculty.findOne({ email: req.user.email });
            if (myProfile) {
                query.faculty = myProfile._id;
            }
        }

        const slots = await Timetable.find(query)
            .populate('faculty', 'name department designation')
            .sort({ day: 1, startTime: 1 });
        res.json(slots);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// POST /api/admin/timetable
const addTimetableSlot = async (req, res) => {
    try {
        let { faculty, subject, room, day, startTime, endTime, classSection } = req.body;

        // If faculty role, auto-assign their own faculty ID
        if (req.user.role === 'faculty') {
            const myProfile = await Faculty.findOne({ email: req.user.email });
            if (!myProfile) return res.status(404).json({ message: 'Faculty profile not found' });
            faculty = myProfile._id;
        }

        const slot = await Timetable.create({ faculty, subject, room, day, startTime, endTime, classSection });
        const populated = await slot.populate('faculty', 'name department designation');
        res.status(201).json(populated);
    } catch (e) { res.status(400).json({ message: e.message }); }
};

// PUT /api/admin/timetable/:id
const updateTimetableSlot = async (req, res) => {
    try {
        const slot = await Timetable.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        // Faculty can only update their own slots
        if (req.user.role === 'faculty') {
            const myProfile = await Faculty.findOne({ email: req.user.email });
            if (!myProfile || slot.faculty.toString() !== myProfile._id.toString()) {
                return res.status(403).json({ message: 'You can only edit your own schedule' });
            }
        }

        const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('faculty', 'name department designation');
        res.json(updated);
    } catch (e) { res.status(400).json({ message: e.message }); }
};

// DELETE /api/admin/timetable/:id
const deleteTimetableSlot = async (req, res) => {
    try {
        const slot = await Timetable.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        // Faculty can only delete their own slots
        if (req.user.role === 'faculty') {
            const myProfile = await Faculty.findOne({ email: req.user.email });
            if (!myProfile || slot.faculty.toString() !== myProfile._id.toString()) {
                return res.status(403).json({ message: 'You can only delete your own schedule' });
            }
        }

        await Timetable.findByIdAndDelete(req.params.id);
        res.json({ message: 'Slot deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const changePassword = async (req, res) => {
    try {
        const { old, new: newPass, email } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(old))) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        user.password = newPass;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getFaculty, addFaculty, updateFaculty, deleteFaculty,
    getTasks, createTask, updateTask, deleteTask,
    getMeetings, createMeeting, updateMeeting, deleteMeeting,
    getFacultyNotifications, getAllNotifications, markAllNotificationsRead,
    getCourses, addCourse, deleteCourse,
    getDepartments, addDepartment, deleteDepartment,
    getTimetable, addTimetableSlot, updateTimetableSlot, deleteTimetableSlot,
    changePassword, respondToTask
};
