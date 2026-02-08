const express = require('express');
const {
  getTodayChallenge,
  submitGuess,
  exploreLocation,
  getChallengeHistory,
  getChallengeById
} = require('../controllers/challengeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateGuess } = require('../middleware/validation');

const router = express.Router();

router.get('/today', optionalAuth, getTodayChallenge);
router.post('/submit', protect, validateGuess, submitGuess);
router.post('/explore', protect, exploreLocation);
router.get('/history', protect, getChallengeHistory);
router.get('/:id', optionalAuth, getChallengeById);

module.exports = router;