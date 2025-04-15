import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatAmount } from '../utils/currencyUtils';
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const InsightsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [timePeriod, setTimePeriod] = useState('currentMonth');

  // Chart colors
  const chartColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(40, 159, 64, 0.7)',
    'rgba(210, 105, 30, 0.7)'
  ];

  // Time period options
  const timePeriods = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'currentYear', label: 'Current Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  // Fetch expenses when time period changes
  useEffect(() => {
    fetchExpenses();
  }, [timePeriod]);

  // Handle time period change
  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  // Fetch expenses based on selected time period
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Calculate date range based on time period
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
        case 'all':
          // No date filters for all time
          break;
        default:
          break;
      }

      const response = await axios.get('/api/expenses', { params });
      setExpenses(response.data.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch expenses data. Please try again.');
      console.error('Error fetching expenses for insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for category chart
  const getCategoryChartData = () => {
    // Group expenses by category
    const categoryData = {};
    expenses.forEach(expense => {
      if (categoryData[expense.category]) {
        categoryData[expense.category] += expense.amount;
      } else {
        categoryData[expense.category] = expense.amount;
      }
    });

    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(categoryData).sort(
      (a, b) => categoryData[b] - categoryData[a]
    );

    return {
      labels: sortedCategories,
      datasets: [
        {
          label: 'Expenses by Category',
          data: sortedCategories.map(category => categoryData[category]),
          backgroundColor: chartColors.slice(0, sortedCategories.length),
          borderWidth: 1
        }
      ]
    };
  };

  // Prepare data for payment method chart
  const getPaymentMethodChartData = () => {
    // Group expenses by payment method
    const paymentData = {};
    expenses.forEach(expense => {
      if (paymentData[expense.mode_of_payment]) {
        paymentData[expense.mode_of_payment] += expense.amount;
      } else {
        paymentData[expense.mode_of_payment] = expense.amount;
      }
    });

    // Sort payment methods by amount (descending)
    const sortedPaymentMethods = Object.keys(paymentData).sort(
      (a, b) => paymentData[b] - paymentData[a]
    );

    return {
      labels: sortedPaymentMethods,
      datasets: [
        {
          label: 'Expenses by Payment Method',
          data: sortedPaymentMethods.map(method => paymentData[method]),
          backgroundColor: chartColors.slice(0, sortedPaymentMethods.length),
          borderWidth: 1
        }
      ]
    };
  };

  // Calculate total expenses
  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Get period label for display
  const getPeriodLabel = () => {
    const period = timePeriods.find(p => p.value === timePeriod);
    return period ? period.label : '';
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.getDatasetMeta(0).total;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatAmount(value, user?.currency)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Bar chart options
  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatAmount(value, user?.currency);
          }
        }
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Expense Insights</h2>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <h4>Time Period: {getPeriodLabel()}</h4>
            </Col>
            <Col md={6}>
              <Form.Group controlId="insightsTimePeriod">
                <Form.Select
                  value={timePeriod}
                  onChange={handleTimePeriodChange}
                  className="w-100"
                >
                  {timePeriods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading expense data...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : expenses.length === 0 ? (
        <Alert variant="info">
          No expenses found for the selected period. Try selecting a different time period or add some expenses.
        </Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="mb-3">Total Expenses: {formatAmount(getTotalExpenses(), user?.currency)}</h4>
                  <p className="text-muted">Based on {expenses.length} expense records</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={6} className="mb-4 mb-lg-0">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="mb-3">Expenses by Category</h4>
                  <div style={{ height: '300px' }}>
                    <Doughnut 
                      data={getCategoryChartData()} 
                      options={chartOptions} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h4 className="mb-3">Expenses by Payment Method</h4>
                  <div style={{ height: '300px' }}>
                    <Pie 
                      data={getPaymentMethodChartData()} 
                      options={chartOptions} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="mb-3">Category Breakdown</h4>
                  <div style={{ height: '400px' }}>
                    <Bar 
                      data={getCategoryChartData()} 
                      options={barChartOptions} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default InsightsPage;
