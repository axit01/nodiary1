const express = require('express');
const router = express.Router();
const { protect, admin, adminOrHod, anyRole } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getFaculty, addFaculty, updateFaculty, deleteFaculty,
    getTasks, createTask, updateTask, deleteTask,
    getMeetings, createMeeting, updateMeeting, deleteMeeting,
    getFacultyNotifications, getAllNotifications, markAllNotificationsRead,
    getCourses, addCourse, deleteCourse,
    getDepartments, addDepartment, deleteDepartment,
    getTimetable, addTimetableSlot, updateTimetableSlot, deleteTimetableSlot,
    changePassword, respondToTask
} = require('../controllers/adminController');

// All routes below require a logged-in User
router.use(protect);

// ── Dashboard ──────────────────────────────────
router.get('/dashboard', adminOrHod, getDashboardStats);

// ── Notifications ──────────────────────────────
router.get('/notifications', adminOrHod, getAllNotifications);
router.put('/notifications/read', adminOrHod, markAllNotificationsRead);

// ── Faculty (HODs can view/manage their own department, Faculty can update their own status)
router.route('/faculty').get(anyRole, getFaculty).post(adminOrHod, addFaculty);
router.put('/faculty/change-password', anyRole, changePassword);
router.route('/faculty/:id').put(anyRole, updateFaculty).delete(adminOrHod, deleteFaculty);

// ── Tasks ──────────────────────────────────────
router.route('/tasks').get(anyRole, getTasks).post(adminOrHod, createTask);
router.post('/tasks/respond', anyRole, respondToTask);
router.route('/tasks/:id').put(anyRole, updateTask).delete(adminOrHod, deleteTask);

// ── Meetings ───────────────────────────────────
router.route('/meetings').get(anyRole, getMeetings).post(adminOrHod, createMeeting);
router.route('/meetings/:id').put(anyRole, updateMeeting).delete(adminOrHod, deleteMeeting);

// ── Courses (Settings) (Super Admin Only) ──────
router.route('/courses').get(admin, getCourses).post(admin, addCourse);
router.route('/courses/:id').delete(admin, deleteCourse);

// ── Departments (Settings) (Super Admin Only) ──
router.route('/departments').get(admin, getDepartments).post(admin, addDepartment);
router.route('/departments/:id').delete(admin, deleteDepartment);

// ── Notifications (Flutter app) ────────────────
router.get('/notifications/:facultyId', anyRole, getFacultyNotifications);

// ── Timetable ──────────────────────────────────
router.route('/timetable').get(anyRole, getTimetable).post(anyRole, addTimetableSlot);
router.route('/timetable/:id').put(anyRole, updateTimetableSlot).delete(anyRole, deleteTimetableSlot);

module.exports = router;
