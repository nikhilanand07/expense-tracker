const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  expense_date: {
    type: Date,
    required: [true, 'Please provide an expense date'],
    default: Date.now
  },
  mode_of_payment: {
    type: String,
    required: [true, 'Please provide a mode of payment'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
ExpenseSchema.index({ user: 1, expense_date: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
