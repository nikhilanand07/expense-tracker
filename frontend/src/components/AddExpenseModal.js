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

const AddExpenseModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    amount: '',
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    mode_of_payment: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  // Close on Escape key
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
      await api.post('/api/expenses', payload);
      toast.success('Expense added successfully');
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop-dark"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
    >
      <div className="modal-panel">
        {/* Header */}
        <div className="modal-panel-header">
          <h2 className="modal-panel-title" id="add-modal-title">Add New Expense</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <IoClose size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <div className="modal-form-field">
              <label className="modal-label" htmlFor="add-amount">Amount (₹)</label>
              <input
                id="add-amount"
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
              <label className="modal-label" htmlFor="add-category">Category</label>
              <select
                id="add-category"
                name="category"
                className="modal-select"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="modal-form-field">
              <label className="modal-label" htmlFor="add-date">Date</label>
              <input
                id="add-date"
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
              <label className="modal-label" htmlFor="add-payment">Payment Method</label>
              <select
                id="add-payment"
                name="mode_of_payment"
                className="modal-select"
                value={form.mode_of_payment}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Method</option>
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="modal-form-field full-width">
              <label className="modal-label" htmlFor="add-desc">
                Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="add-desc"
                name="description"
                className="modal-textarea"
                value={form.description}
                onChange={handleChange}
                placeholder="What was this expense for?"
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
              {saving ? 'Adding…' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
