const express = require('express');
const {
  getProfile,
  updateProfile,
  getStats,
  getDiscoveries,
  syncUser,
  updateTotalPoints,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateUpdateProfile } = require('../middleware/validation');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.get("/:userId/stats", getStats);
router.get('/discoveries', protect, getDiscoveries);
router.post('/sync', protect, syncUser);
router.post('/points', protect, updateTotalPoints);



module.exports = router;