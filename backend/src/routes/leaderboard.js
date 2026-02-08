const express = require('express');
const {
  getLeaderboard,
  getUserRank,
  getTopUsersByTotalPoints,
  getTopUsersByStreak,
} = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/user/:username', getUserRank);
router.get('/topPoints', getTopUsersByTotalPoints);
router.get('/topStreak', getTopUsersByStreak);

module.exports = router;