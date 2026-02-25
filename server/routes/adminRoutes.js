const express = require('express');
const router = express.Router();
const { protect, admin, adminOrHod } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getFaculty, addFaculty, updateFaculty, deleteFaculty,
    getTasks, createTask, updateTask, deleteTask,
    getMeetings, createMeeting, updateMeeting, deleteMeeting,
    getFacultyNotifications, getAllNotifications, markAllNotificationsRead,
    getCourses, addCourse, deleteCourse,
    getDepartments, addDepartment, deleteDepartment,
    getTimetable, addTimetableSlot, updateTimetableSlot, deleteTimetableSlot,
} = require('../controllers/adminController');

// All routes below require a logged-in User
router.use(protect);

// ── Dashboard ──────────────────────────────────
router.get('/dashboard', adminOrHod, getDashboardStats);

// ── Notifications ──────────────────────────────
router.get('/notifications', adminOrHod, getAllNotifications);
router.put('/notifications/read', adminOrHod, markAllNotificationsRead);

// ── Faculty (HODs can view/manage their own department)
router.route('/faculty').get(adminOrHod, getFaculty).post(adminOrHod, addFaculty);
router.route('/faculty/:id').put(adminOrHod, updateFaculty).delete(adminOrHod, deleteFaculty);

// ── Tasks ──────────────────────────────────────
router.route('/tasks').get(adminOrHod, getTasks).post(adminOrHod, createTask);
router.route('/tasks/:id').put(adminOrHod, updateTask).delete(adminOrHod, deleteTask);

// ── Meetings ───────────────────────────────────
router.route('/meetings').get(adminOrHod, getMeetings).post(adminOrHod, createMeeting);
router.route('/meetings/:id').put(adminOrHod, updateMeeting).delete(adminOrHod, deleteMeeting);

// ── Courses (Settings) (Super Admin Only) ──────
router.route('/courses').get(admin, getCourses).post(admin, addCourse);
router.route('/courses/:id').delete(admin, deleteCourse);

// ── Departments (Settings) (Super Admin Only) ──
router.route('/departments').get(admin, getDepartments).post(admin, addDepartment);
router.route('/departments/:id').delete(admin, deleteDepartment);

// ── Notifications (Flutter app) ────────────────
router.get('/notifications/:facultyId', adminOrHod, getFacultyNotifications);

// ── Timetable ──────────────────────────────────
router.route('/timetable').get(adminOrHod, getTimetable).post(adminOrHod, addTimetableSlot);
router.route('/timetable/:id').put(adminOrHod, updateTimetableSlot).delete(adminOrHod, deleteTimetableSlot);

module.exports = router;
