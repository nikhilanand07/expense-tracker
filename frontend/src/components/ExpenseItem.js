import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import { formatAmount } from '../utils/currencyUtils';

// Category metadata
const CATEGORY_META = {
  'Food':           { emoji: '🍔', bg: 'rgba(234,179,8,0.15)',   color: '#eab308' },
  'Transportation': { emoji: '🚗', bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  'Housing':        { emoji: '🏠', bg: 'rgba(6,182,212,0.15)',   color: '#06b6d4' },
  'Entertainment':  { emoji: '🎬', bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  'Shopping':       { emoji: '🛍️', bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  'Utilities':      { emoji: '⚡', bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  'Healthcare':     { emoji: '🏥', bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  'Education':      { emoji: '📚', bg: 'rgba(236,72,153,0.15)',  color: '#ec4899' },
  'Travel':         { emoji: '✈️', bg: 'rgba(20,184,166,0.15)',  color: '#14b8a6' },
  'Other':          { emoji: '📦', bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

const getMeta = (category) =>
  CATEGORY_META[category] || { emoji: '💳', bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };

const ExpenseItem = ({ expense, onDelete, onEdit, style }) => {
  const { user } = useAuth();
  const meta = getMeta(expense.category);

  return (
    <div className="expense-row" style={style}>
      {/* Icon */}
      <div
        className="expense-row-icon"
        style={{ background: meta.bg }}
      >
        {meta.emoji}
      </div>

      {/* Content */}
      <div className="expense-row-content">
        <div className="expense-row-title">
          {expense.description || expense.category}
        </div>
        <div className="expense-row-tags">
          <span
            className="expense-tag"
            style={{
              background: meta.bg,
              color: meta.color,
            }}
          >
            {expense.category}
          </span>
          <span className="expense-tag expense-tag-payment">
            {expense.mode_of_payment}
          </span>
          <span className="expense-tag-date">
            {moment(expense.expense_date).format('D MMM YYYY')}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="expense-row-right">
        <span className="expense-row-amount">
          {formatAmount(expense.amount, user?.currency)}
        </span>
        <div className="expense-row-actions">
          <button
            className="btn-edit-sm"
            onClick={() => onEdit && onEdit(expense)}
            aria-label={`Edit ${expense.description || expense.category}`}
          >
            <FaEdit size={11} /> Edit
          </button>
          <button
            className="btn-danger-sm"
            onClick={() => onDelete(expense._id)}
            aria-label={`Delete ${expense.description || expense.category}`}
          >
            <FaTrash size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
