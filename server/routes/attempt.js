const express = require('express');
const router = express.Router();
const { submitAttempt, getMyAttempts } = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all attempt routes

router.route('/')
  .post(submitAttempt);

router.route('/my')
  .get(getMyAttempts);

module.exports = router;
