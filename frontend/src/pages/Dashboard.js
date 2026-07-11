import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import { MdTrendingUp, MdShoppingCart, MdCreditCard, MdAttachMoney } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { formatAmount, getCurrencySymbol } from '../utils/currencyUtils';
import api from '../services/api';
import ExpenseItem from '../components/ExpenseItem';
import ExpenseFilter from '../components/ExpenseFilter';
import SpendingChart from '../components/SpendingChart';
import EditExpenseModal from '../components/EditExpenseModal';
import AddExpenseModal from '../components/AddExpenseModal';

const BUDGET_KEY = 'et_monthly_budget';
const DEFAULT_BUDGET = 25000;

const CATEGORY_COLORS = {
  'Shopping': '#f97316', 'Utilities': '#22c55e', 'Food': '#eab308',
  'Healthcare': '#ef4444', 'Entertainment': '#8b5cf6', 'Transportation': '#3b82f6',
  'Housing': '#06b6d4', 'Education': '#ec4899', 'Travel': '#14b8a6', 'Other': '#94a3b8',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [budget] = useState(() => {
    const saved = localStorage.getItem(BUDGET_KEY);
    return saved ? parseFloat(saved) : DEFAULT_BUDGET;
  });

  const now = new Date();
  const initialFilters = {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
    category: '',
    mode_of_payment: '',
    timePeriod: 'currentMonth',
  };
  const [filters, setFilters] = useState(initialFilters);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchExpenses(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.category, filters.mode_of_payment]);

  const fetchExpenses = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (currentFilters.startDate) params.startDate = currentFilters.startDate.toISOString();
      if (currentFilters.endDate)   params.endDate   = currentFilters.endDate.toISOString();
      if (currentFilters.category)       params.category        = currentFilters.category;
      if (currentFilters.mode_of_payment) params.mode_of_payment = currentFilters.mode_of_payment;

      const res = await api.get('/api/expenses', { params });
      const processed = (res.data.data || []).map(e => ({
        ...e,
        amount: typeof e.amount === 'number' ? e.amount : parseFloat(e.amount) || 0,
      }));
      setExpenses(processed);
      setTotalCount(res.data.count || 0);
      setTotalAmount(res.data.totalAmount || 0);
      setTotalPages(Math.ceil((res.data.count || 0) / ITEMS_PER_PAGE) || 1);
      setError('');
    } catch (err) {
      setError('Failed to load expenses.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterData) => {
    setCurrentPage(1);
    fetchExpenses(1, filterData);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchExpenses(page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      toast.success('Expense deleted');
      fetchExpenses(currentPage);
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const handleEditOpen  = (expense) => setEditingExpense(expense);
  const handleEditClose = ()        => setEditingExpense(null);
  const handleUpdated   = ()        => { fetchExpenses(currentPage); };

  // ── Derived stats ──────────────────────────────────────
  const categoryTotals = useMemo(() => {
    const map = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const topCategory    = categoryTotals[0];
  const budgetUsedPct  = budget > 0 ? Math.min((totalAmount / budget) * 100, 100) : 0;
  const budgetLeft     = Math.max(budget - totalAmount, 0);
  const monthLabel     = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currencySymbol = getCurrencySymbol(user?.currency);

  // ── Pagination ─────────────────────────────────────────
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    pages.push(
      <button
        key="prev"
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>
    );
    for (let p = start; p <= end; p++) {
      pages.push(
        <button
          key={p}
          className={`pagination-btn${p === currentPage ? ' active' : ''}`}
          onClick={() => handlePageChange(p)}
        >
          {p}
        </button>
      );
    }
    pages.push(
      <button
        key="next"
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    );
    return <div className="pagination-bar">{pages}</div>;
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Expenses</h1>
          <p className="page-subtitle">
            {monthLabel} · {totalCount} transaction{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="page-header-actions">
          <span className="currency-pill">
            ₹&nbsp;{user?.currency || 'INR'}
          </span>
          <button onClick={() => setIsAddingExpense(true)} className="btn-primary-dark">
            <FaPlus size={12} /> Add New Expense
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        {/* Total this month */}
        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{ background: 'rgba(124,58,237,0.15)' }}
          >
            <MdAttachMoney color="#a78bfa" size={20} />
          </div>
          <div className="stat-card-value">{formatAmount(totalAmount, user?.currency)}</div>
          <div className="stat-card-label">Total this month</div>
          <div className="stat-card-change neutral">— current period</div>
        </div>

        {/* Transactions */}
        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{ background: 'rgba(20,184,166,0.15)' }}
          >
            <MdCreditCard color="#14b8a6" size={20} />
          </div>
          <div className="stat-card-value">{totalCount}</div>
          <div className="stat-card-label">Transactions</div>
          <div className="stat-card-change neutral">— current period</div>
        </div>

        {/* Top Category */}
        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{ background: 'rgba(249,115,22,0.15)' }}
          >
            <MdShoppingCart color="#f97316" size={20} />
          </div>
          <div className="stat-card-value">
            {topCategory ? topCategory[0] : '—'}
          </div>
          <div className="stat-card-label">Top category</div>
          {topCategory && (
            <div className="stat-card-change neutral" style={{ color: '#f97316' }}>
              {formatAmount(topCategory[1], user?.currency)}
              &nbsp;·&nbsp;
              {totalAmount > 0 ? Math.round((topCategory[1] / totalAmount) * 100) : 0}%
            </div>
          )}
        </div>

        {/* Monthly Budget */}
        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{ background: 'rgba(34,197,94,0.15)' }}
          >
            <MdTrendingUp color="#22c55e" size={20} />
          </div>
          <div className="stat-card-value">
            {currencySymbol}{budget.toLocaleString()}
          </div>
          <div className="stat-card-label">Monthly budget</div>
          <div
            className={`stat-card-change ${
              budgetUsedPct >= 90 ? 'negative' : budgetUsedPct >= 70 ? 'warning' : 'neutral'
            }`}
          >
            {budget > 0
              ? `${Math.round(budgetUsedPct)}% used · ${currencySymbol}${Math.round(budgetLeft).toLocaleString()} left`
              : 'No budget set'}
          </div>
        </div>
      </div>

      {/* ── Chart + Category Legend ── */}
      <div className="chart-section">
        <SpendingChart expenses={expenses} currency={user?.currency} />

        <div className="category-legend-card">
          <div className="category-legend-title">By Category</div>
          {categoryTotals.slice(0, 7).map(([cat, amt]) => {
            const pct = totalAmount > 0 ? (amt / totalAmount) * 100 : 0;
            const color = CATEGORY_COLORS[cat] || '#94a3b8';
            return (
              <div key={cat} className="category-legend-item">
                <div className="category-dot" style={{ background: color }} />
                <div className="category-name">{cat}</div>
                <div className="category-bar-wrapper">
                  <div
                    className="category-bar"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <div className="category-amount">
                  {formatAmount(amt, user?.currency)}
                </div>
              </div>
            );
          })}
          {categoryTotals.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No data</div>
          )}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <ExpenseFilter filters={filters} setFilters={setFilters} onFilter={handleFilter} />

      {/* ── Summary Bar ── */}
      {!loading && (
        <div className="expense-summary-bar">
          <div className="summary-stats">
            <div>
              <div className="summary-stat-label">Total Expenses</div>
              <div className="summary-stat-value">
                {formatAmount(totalAmount, user?.currency)}
              </div>
            </div>
            <div>
              <div className="summary-stat-label">Number of Expenses</div>
              <div className="summary-stat-value plain">{totalCount}</div>
            </div>
          </div>
          <div className="showing-count">
            Showing {expenses.length} of {totalCount} expenses
          </div>
        </div>
      )}

      {/* ── Expense List ── */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner-dark" />
          Loading expenses…
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-text">{error}</div>
        </div>
      ) : totalCount === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">
            No expenses found. Try adjusting your filters or add a new expense.
          </div>
        </div>
      ) : (
        <>
          <div className="expense-list">
            {expenses.map((expense, i) => (
              <ExpenseItem
                key={expense._id}
                expense={expense}
                onDelete={handleDelete}
                onEdit={handleEditOpen}
                style={{ animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
          {renderPagination()}
        </>
      )}

      {/* ── Edit Modal ── */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={handleEditClose}
          onUpdated={handleUpdated}
        />
      )}

      {/* ── Add Modal ── */}
      {isAddingExpense && (
        <AddExpenseModal
          onClose={() => setIsAddingExpense(false)}
          onAdded={handleUpdated}
        />
      )}
    </>
  );
};

export default Dashboard;
