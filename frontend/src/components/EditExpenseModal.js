import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import api from '../services/api';

const CATEGORIES = [
  'Food', 'Transportation', 'Housing', 'Entertainment',
  'Shopping', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Other',
];

const PAYMENT_MODES = [
  'Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Mobile Wallet', 'Other',
];

const EditExpenseModal = ({ expense, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    amount: '',
    category: '',
    expense_date: '',
    mode_of_payment: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        amount: expense.amount || '',
        category: expense.category || '',
        expense_date: expense.expense_date
          ? new Date(expense.expense_date).toISOString().split('T')[0]
          : '',
        mode_of_payment: expense.mode_of_payment || '',
        description: expense.description || '',
      });
    }
  }, [expense]);

  // Trap focus / close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.expense_date || !form.mode_of_payment) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        category: form.category,
        expense_date: new Date(form.expense_date).toISOString(),
        mode_of_payment: form.mode_of_payment,
        description: form.description,
      };
      await api.put(`/api/expenses/${expense._id}`, payload);
      toast.success('Expense updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  if (!expense) return null;

  return (
    <div
      className="modal-backdrop-dark"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="modal-panel">
        {/* Header */}
        <div className="modal-panel-header">
          <h2 className="modal-panel-title" id="edit-modal-title">Edit Expense</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <IoClose size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <div className="modal-form-field">
              <label className="modal-label" htmlFor="modal-amount">Amount (₹)</label>
              <input
                id="modal-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                className="modal-input"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="modal-form-field">
              <label className="modal-label" htmlFor="modal-category">Category</label>
              <select
                id="modal-category"
                name="category"
                className="modal-select"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="modal-form-field">
              <label className="modal-label" htmlFor="modal-date">Date</label>
              <input
                id="modal-date"
                name="expense_date"
                type="date"
                className="modal-input"
                value={form.expense_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="modal-form-field">
              <label className="modal-label" htmlFor="modal-payment">Payment Method</label>
              <select
                id="modal-payment"
                name="mode_of_payment"
                className="modal-select"
                value={form.mode_of_payment}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select method</option>
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="modal-form-field full-width">
              <label className="modal-label" htmlFor="modal-desc">
                Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="modal-desc"
                name="description"
                className="modal-textarea"
                value={form.description}
                onChange={handleChange}
                placeholder="Add a note…"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-dark"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
