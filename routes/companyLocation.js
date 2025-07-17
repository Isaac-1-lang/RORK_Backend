const express = require('express');
const router = express.Router();
const companyLocationController = require('../controllers/companyLocationController');
const auth = require('../middleware/auth');

// Get current company location
router.get('/', companyLocationController.getCompanyLocation);

// Set/update company location (HR only)
router.post('/', auth, companyLocationController.setCompanyLocation);

module.exports = router; 