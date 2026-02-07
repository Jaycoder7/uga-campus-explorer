const express = require('express');
const {
  getAllLocations,
  getLocationsByCategory,
  getLocationById
} = require('../controllers/locationController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getAllLocations);
router.get('/category/:category', optionalAuth, getLocationsByCategory);
router.get('/:id', optionalAuth, getLocationById);

module.exports = router;