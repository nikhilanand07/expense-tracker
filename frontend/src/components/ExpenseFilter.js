import React, { useCallback } from 'react';

const CATEGORIES = [
  'All Categories', 'Food', 'Transportation', 'Housing',
  'Entertainment', 'Shopping', 'Utilities', 'Healthcare',
  'Education', 'Travel', 'Other',
];

const PAYMENT_MODES = [
  'All Methods', 'Cash', 'Credit Card', 'Debit Card',
  'UPI', 'Net Banking', 'Mobile Wallet', 'Other',
];

const TIME_PERIODS = [
  { value: 'currentMonth', label: 'Current Month' },
  { value: 'lastMonth',    label: 'Last Month' },
  { value: 'last3Months',  label: 'Last 3 Months' },
  { value: 'last6Months',  label: 'Last 6 Months' },
  { value: 'currentYear',  label: 'Current Year' },
  { value: 'lastYear',     label: 'Last Year' },
  { value: 'all',          label: 'All Time' },
];

const ExpenseFilter = ({ filters, setFilters, onFilter }) => {
  // Update dates when timePeriod changes
  const applyTimePeriod = useCallback((timePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let startDate = null;
    let endDate = today;

    switch (timePeriod) {
      case 'currentMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'currentYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate   = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      case 'all':
        startDate = null;
        endDate   = null;
        break;
      default:
        break;
    }

    return { startDate, endDate };
  }, []);

  const handleTimePeriod = (e) => {
    const tp = e.target.value;
    const dates = applyTimePeriod(tp);
    const next = { ...filters, timePeriod: tp, ...dates };
    setFilters(next);
    onFilter(next);
  };

  const handleCategory = (e) => {
    const val = e.target.value;
    const next = { ...filters, category: val === 'All Categories' ? '' : val };
    setFilters(next);
    onFilter(next);
  };

  const handlePayment = (e) => {
    const val = e.target.value;
    const next = { ...filters, mode_of_payment: val === 'All Methods' ? '' : val };
    setFilters(next);
    onFilter(next);
  };

  const handleReset = () => {
    const dates = applyTimePeriod('currentMonth');
    const reset = { ...dates, category: '', mode_of_payment: '', timePeriod: 'currentMonth' };
    setFilters(reset);
    onFilter(reset);
  };

  return (
    <div className="filter-bar">
      {/* Time Period */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-period">Time Period</label>
        <select
          id="filter-period"
          className="filter-select"
          value={filters.timePeriod}
          onChange={handleTimePeriod}
        >
          {TIME_PERIODS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          className="filter-select"
          value={filters.category || 'All Categories'}
          onChange={handleCategory}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Payment Method */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-payment">Payment Method</label>
        <select
          id="filter-payment"
          className="filter-select"
          value={filters.mode_of_payment || 'All Methods'}
          onChange={handlePayment}
        >
          {PAYMENT_MODES.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <button className="btn-reset" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
};

export default ExpenseFilter;
