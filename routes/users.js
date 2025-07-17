const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

router.post('/add-worker', auth, requireRole('hr'), userController.addWorker);
router.get('/list-users', userController.listUsers);
// List workers by HR or department
router.get('/list-workers', auth, requireRole('hr', 'admin'), userController.listWorkersByHROrDepartment);

// Example: admin-only endpoint (placeholder)
// router.get('/admin-stats', auth, requireRole('admin'), (req, res) => {
//   res.json({ message: 'Admin stats endpoint' });
// });

module.exports = router; 