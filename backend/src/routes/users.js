const express = require('express');
const {
  getProfile,
  updateProfile,
  getStats,
  getDiscoveries
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateUpdateProfile } = require('../middleware/validation');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.get('/stats', protect, getStats);
router.get('/discoveries', protect, getDiscoveries);

module.exports = router;