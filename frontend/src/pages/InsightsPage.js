import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { formatAmount } from '../utils/currencyUtils';
import api from '../services/api';
import { MdTrendingUp, MdAttachMoney } from 'react-icons/md';
import { BsArrowUpRight, BsActivity } from 'react-icons/bs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TIME_PERIODS = [
  { value: 'currentMonth', label: 'Current Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'currentYear', label: 'Current Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'all', label: 'All Time' }
];

const CATEGORY_COLORS = {
  'Shopping': '#f97316', 'Utilities': '#22c55e', 'Food': '#eab308',
  'Healthcare': '#ef4444', 'Entertainment': '#8b5cf6', 'Transportation': '#3b82f6',
  'Housing': '#06b6d4', 'Education': '#ec4899', 'Travel': '#14b8a6', 'Other': '#94a3b8',
};

const PAYMENT_COLORS = {
  'Cash': '#10b981', 'Credit Card': '#8b5cf6', 'Debit Card': '#3b82f6',
  'UPI': '#f59e0b', 'Net Banking': '#ec4899', 'Mobile Wallet': '#06b6d4', 'Other': '#94a3b8',
};

const InsightsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [timePeriod, setTimePeriod] = useState('currentMonth');

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod]);

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      switch (timePeriod) {
        case 'currentMonth':
          params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          params.endDate = today.toISOString();
          break;
        case 'lastMonth':
          params.startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
          params.endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
          break;
        case 'last3Months':
          params.startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
          params.endDate = today.toISOString();
          break;
        case 'last6Months':
          params.startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString();
          params.endDate = today.toISOString();
          break;
        case 'currentYear':
          params.startDate = new Date(now.getFullYear(), 0, 1).toISOString();
          params.endDate = today.toISOString();
          break;
        case 'lastYear':
          params.startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString();
          params.endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59).toISOString();
          break;
        default:
          break;
      }

      const response = await api.get('/api/expenses', { params });
      const processed = (response.data.data || []).map(e => ({
        ...e,
        amount: typeof e.amount === 'number' ? e.amount : parseFloat(e.amount) || 0
      }));
      setExpenses(processed);
      setError('');
    } catch (err) {
      setError('Failed to fetch insights data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Stats Calculations ───────────────────────────────
  const stats = useMemo(() => {
    if (expenses.length === 0) return { total: 0, avg: 0, largest: null };
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const avg = total / expenses.length;
    let largest = expenses[0];
    expenses.forEach(e => {
      if (e.amount > largest.amount) largest = e;
    });
    return { total, avg, largest };
  }, [expenses]);

  // ── Category Aggregation ──────────────────────────────
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        color: CATEGORY_COLORS[name] || '#94a3b8',
        pct: stats.total > 0 ? (amount / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, stats.total]);

  // ── Payment Aggregation ──────────────────────────────
  const paymentData = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      map[e.mode_of_payment] = (map[e.mode_of_payment] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        color: PAYMENT_COLORS[name] || '#94a3b8',
        pct: stats.total > 0 ? (amount / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, stats.total]);

  // ── Daily Spending Aggregation ─────────────────────────
  const dailySpending = useMemo(() => {
    const map = {};
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) map[d] = 0;

    expenses.forEach(exp => {
      const d = new Date(exp.expense_date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        const day = d.getDate();
        map[day] = (map[day] || 0) + exp.amount;
      }
    });

    return {
      labels: Object.keys(map),
      values: Object.values(map)
    };
  }, [expenses]);

  // ── Chart Configurations ──────────────────────────────
  const categoryChartConfig = {
    labels: categoryData.map(c => c.name),
    datasets: [{
      data: categoryData.map(c => c.amount),
      backgroundColor: categoryData.map(c => c.color),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const paymentChartConfig = {
    labels: paymentData.map(p => p.name),
    datasets: [{
      data: paymentData.map(p => p.amount),
      backgroundColor: paymentData.map(p => p.color),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const dailyChartConfig = {
    labels: dailySpending.labels,
    datasets: [{
      data: dailySpending.values,
      backgroundColor: dailySpending.values.map(v => v === 0 ? 'rgba(255,255,255,0.03)' : '#7c3aed'),
      borderRadius: 4
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1e2a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: 'rgba(232,232,240,0.5)',
        bodyColor: '#e8e8f0',
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${formatAmount(ctx.raw, user?.currency)}`
        }
      }
    },
    cutout: '75%'
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1e2a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${formatAmount(ctx.raw, user?.currency)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: 'rgba(232,232,240,0.3)', font: { size: 10 } }
      },
      y: { display: false, grid: { display: false } }
    }
  };

  const currentMonthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Insights</h1>
          <p className="page-subtitle">Visual breakdown of your spending patterns</p>
        </div>
        <div className="page-header-actions">
          <select
            className="filter-select"
            value={timePeriod}
            onChange={handleTimePeriodChange}
            style={{ minWidth: '160px' }}
          >
            {TIME_PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner-dark" />
          Loading insights data...
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-text">{error}</div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">No records found. Try adding some expenses.</div>
        </div>
      ) : (
        <>
          {/* ── Stats Row ── */}
          <div className="stats-grid" style={{ marginBottom: '22px' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(124,58,237,0.15)' }}>
                <MdAttachMoney color="#a78bfa" size={20} />
              </div>
              <div className="stat-card-value">{formatAmount(stats.total, user?.currency)}</div>
              <div className="stat-card-label">Total Expenses</div>
              <div className="stat-card-change neutral">Based on {expenses.length} records</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>
                <BsActivity color="#22c55e" size={18} />
              </div>
              <div className="stat-card-value">{formatAmount(stats.avg, user?.currency)}</div>
              <div className="stat-card-label">Avg per Transaction</div>
              <div className="stat-card-change positive">
                <BsArrowUpRight size={10} /> 8% vs last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <MdTrendingUp color="#f59e0b" size={20} />
              </div>
              <div className="stat-card-value">
                {stats.largest ? formatAmount(stats.largest.amount, user?.currency) : '—'}
              </div>
              <div className="stat-card-label">Largest Expense</div>
              <div className="stat-card-change warning" style={{ color: '#f59e0b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {stats.largest ? `${stats.largest.description || stats.largest.category} · ${stats.largest.category}` : '—'}
              </div>
            </div>
          </div>

          {/* ── Donut Charts Side-by-Side ── */}
          <div className="insights-donut-section">
            {/* By Category */}
            <div className="donut-card">
              <h3 className="donut-card-title">By Category</h3>
              <div className="donut-inner">
                <div className="donut-chart-wrapper">
                  <Doughnut data={categoryChartConfig} options={doughnutOptions} />
                </div>
                <div className="donut-legend">
                  {categoryData.slice(0, 5).map(c => (
                    <div key={c.name} className="donut-legend-item">
                      <div className="donut-legend-dot" style={{ background: c.color }} />
                      <span className="donut-legend-name">{c.name}</span>
                      <span className="donut-legend-pct">{Math.round(c.pct)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By Payment Method */}
            <div className="donut-card">
              <h3 className="donut-card-title">By Payment Method</h3>
              <div className="donut-inner">
                <div className="donut-chart-wrapper">
                  <Doughnut data={paymentChartConfig} options={doughnutOptions} />
                </div>
                <div className="donut-legend">
                  {paymentData.slice(0, 5).map(p => (
                    <div key={p.name} className="donut-legend-item">
                      <div className="donut-legend-dot" style={{ background: p.color }} />
                      <span className="donut-legend-name">{p.name}</span>
                      <span className="donut-legend-pct">{Math.round(p.pct)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Daily Spending Chart ── */}
          <div className="chart-card" style={{ marginBottom: '22px' }}>
            <div className="chart-card-header">
              <h3 className="chart-card-title">Daily Spending — {currentMonthLabel}</h3>
            </div>
            <div style={{ height: '180px' }}>
              <Bar data={dailyChartConfig} options={barChartOptions} />
            </div>
          </div>

          {/* ── Category Breakdown Progress Bars ── */}
          <div className="breakdown-section">
            <h3 className="breakdown-title">Category Breakdown</h3>
            {categoryData.map(c => (
              <div key={c.name} className="breakdown-row">
                <div className="breakdown-dot" style={{ background: c.color }} />
                <div className="breakdown-name">{c.name}</div>
                <div className="breakdown-bar-wrapper">
                  <div
                    className="breakdown-bar"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </div>
                <div className="breakdown-amount">{formatAmount(c.amount, user?.currency)}</div>
                <div className="breakdown-pct">{Math.round(c.pct)}%</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default InsightsPage;
