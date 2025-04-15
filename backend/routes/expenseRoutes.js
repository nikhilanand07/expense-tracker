const express = require('express');
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All expense routes are protected
router.use(protect);

// Routes for /api/expenses
router.route('/')
  .get(getExpenses)
  .post(createExpense);

// Routes for /api/expenses/:id
router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
