const express = require('express');
const {
  getAllAchievements,
  getUserAchievements
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllAchievements);
router.get('/user', protect, getUserAchievements);

module.exports = router;