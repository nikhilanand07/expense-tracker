const express = require('express');
const { 
  createBill, 
  getBills, 
  getBill, 
  updateBill, 
  deleteBill,
  markShareAsPaid
} = require('../controllers/billController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Bill routes
router.route('/')
  .post(createBill)
  .get(getBills);

router.route('/:id')
  .get(getBill)
  .put(updateBill)
  .delete(deleteBill);

// Share management
router.route('/:id/shares/:shareId')
  .put(markShareAsPaid);

module.exports = router;
