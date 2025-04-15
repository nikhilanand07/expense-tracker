const express = require('express');
const { signup, login, getProfile, updateCurrency } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/currency', protect, updateCurrency);

module.exports = router;
