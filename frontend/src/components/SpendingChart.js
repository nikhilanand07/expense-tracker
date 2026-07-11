import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatAmount } from '../utils/currencyUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const PERIODS = ['W', 'M', 'Y'];

const SpendingChart = ({ expenses, currency }) => {
  const [period, setPeriod] = useState('M');

  const { labels, data } = useMemo(() => {
    const now = new Date();
    const buckets = {};

    if (period === 'W') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.getDate().toString();
        buckets[key] = 0;
      }
      expenses.forEach(exp => {
        const d = new Date(exp.expense_date);
        const diff = Math.floor((now - d) / 86400000);
        if (diff <= 6) {
          const key = d.getDate().toString();
          if (key in buckets) buckets[key] += exp.amount;
        }
      });
    } else if (period === 'M') {
      // Days 1–31 for current month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) buckets[d] = 0;
      expenses.forEach(exp => {
        const d = new Date(exp.expense_date);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const day = d.getDate();
          buckets[day] = (buckets[day] || 0) + exp.amount;
        }
      });
    } else {
      // Months of current year
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      months.forEach(m => (buckets[m] = 0));
      expenses.forEach(exp => {
        const d = new Date(exp.expense_date);
        if (d.getFullYear() === now.getFullYear()) {
          const key = months[d.getMonth()];
          buckets[key] += exp.amount;
        }
      });
    }

    return {
      labels: Object.keys(buckets),
      data: Object.values(buckets),
    };
  }, [expenses, period]);

  const maxVal = Math.max(...data, 1);

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: data.map(v =>
        v === 0
          ? 'rgba(255,255,255,0.04)'
          : v >= maxVal * 0.7
            ? 'rgba(124, 58, 237, 0.85)'
            : 'rgba(124, 58, 237, 0.55)'
      ),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1e2a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        titleColor: 'rgba(232,232,240,0.5)',
        bodyColor: '#e8e8f0',
        bodyFont: { size: 13, weight: '700' },
        callbacks: {
          label: ctx => formatAmount(ctx.raw, currency),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: 'rgba(232,232,240,0.3)',
          font: { size: 11 },
          maxRotation: 0,
          maxTicksLimit: period === 'M' ? 12 : undefined,
        },
      },
      y: {
        display: false,
        grid: { display: false },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Spending Overview</h3>
        <div className="period-toggle">
          {PERIODS.map(p => (
            <button
              key={p}
              className={`period-toggle-btn${period === p ? ' active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 160 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SpendingChart;
