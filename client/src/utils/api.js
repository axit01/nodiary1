import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create a reusable axios instance
const api = axios.create({ baseURL: API_BASE });

// Automatically attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginAPI = (email, password) =>
    api.post('/auth/login', { email, password });

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStatsAPI = () =>
    api.get('/admin/dashboard');

// ── Faculty ───────────────────────────────────────────────────────────────────
export const getFacultyAPI = (params = {}) =>
    api.get('/admin/faculty', { params });

export const addFacultyAPI = (data) =>
    api.post('/admin/faculty', data);

export const updateFacultyAPI = (id, data) =>
    api.put(`/admin/faculty/${id}`, data);

export const deleteFacultyAPI = (id) =>
    api.delete(`/admin/faculty/${id}`);

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const getTasksAPI = (params = {}) =>
    api.get('/admin/tasks', { params });

export const createTaskAPI = (data) =>
    api.post('/admin/tasks', data);

export const updateTaskAPI = (id, data) =>
    api.put(`/admin/tasks/${id}`, data);

export const deleteTaskAPI = (id) =>
    api.delete(`/admin/tasks/${id}`);

// ── Meetings ──────────────────────────────────────────────────────────────────
export const getMeetingsAPI = () =>
    api.get('/admin/meetings');

export const createMeetingAPI = (data) =>
    api.post('/admin/meetings', data);

export const updateMeetingAPI = (id, data) =>
    api.put(`/admin/meetings/${id}`, data);

export const deleteMeetingAPI = (id) =>
    api.delete(`/admin/meetings/${id}`);

// ── Courses (Settings) ────────────────────────────────────────────────────────
export const getCoursesAPI = () =>
    api.get('/admin/courses');

export const addCourseAPI = (data) =>
    api.post('/admin/courses', data);

export const deleteCourseAPI = (id) =>
    api.delete(`/admin/courses/${id}`);

// ── Departments (Settings) ────────────────────────────────────────────────────
export const getDepartmentsAPI = () =>
    api.get('/admin/departments');

export const addDepartmentAPI = (data) =>
    api.post('/admin/departments', data);

export const deleteDepartmentAPI = (id) =>
    api.delete(`/admin/departments/${id}`);

// ── Timetable ─────────────────────────────────────────────────────────────────
export const getTimetableAPI = () =>
    api.get('/admin/timetable');

export const addTimetableSlotAPI = (data) =>
    api.post('/admin/timetable', data);

export const updateTimetableSlotAPI = (id, data) =>
    api.put(`/admin/timetable/${id}`, data);

export const deleteTimetableSlotAPI = (id) =>
    api.delete(`/admin/timetable/${id}`);

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotificationsAPI = () =>
    api.get('/admin/notifications');

export const markAllNotificationsReadAPI = () =>
    api.put('/admin/notifications/read');

// ── Chat ──────────────────────────────────────────────────────────────────────
export const getOverallHistoryAPI = () =>
    api.get('/chat/overall');

export const getDMHistoryAPI = (otherUserId) =>
    api.get(`/chat/dm/${otherUserId}`);

export const getDMThreadsAPI = () =>
    api.get('/chat/dm-threads');

export default api;
