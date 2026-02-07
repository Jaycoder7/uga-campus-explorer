const express = require('express');
const {
  getLeaderboard,
  getUserRank
} = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/user/:username', getUserRank);

module.exports = router;