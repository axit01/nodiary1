const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
