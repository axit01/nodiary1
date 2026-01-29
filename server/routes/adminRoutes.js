const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getFaculty,
    addFaculty,
    deleteFaculty,
    getTasks,
    createTask
} = require('../controllers/adminController');

router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.route('/faculty').get(getFaculty).post(addFaculty);
router.route('/faculty/:id').delete(deleteFaculty);
router.route('/tasks').get(getTasks).post(createTask);

module.exports = router;
