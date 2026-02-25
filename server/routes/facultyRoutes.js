const express = require('express');
const router = express.Router();
const { protect, anyRole } = require('../middleware/authMiddleware');
const { updateTaskStatus, getMyTasks } = require('../controllers/facultyController');

// All faculty routes are protected
router.use(protect);

// Ensure user is at least faculty role (could be admin/hod too)
router.use(anyRole);

router.get('/tasks', getMyTasks);
router.put('/tasks/:id/status', updateTaskStatus);

module.exports = router;
