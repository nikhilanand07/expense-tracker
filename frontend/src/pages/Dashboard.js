import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Pagination, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ExpenseItem from '../components/ExpenseItem';
import ExpenseFilter from '../components/ExpenseFilter';
import { FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { formatAmount } from '../utils/currencyUtils';
import api from '../services/api'; // Import the api service

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize with current month
  const now = new Date();
  const initialStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const initialEndOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const [filters, setFilters] = useState({
    startDate: initialStartOfMonth,
    endDate: initialEndOfDay,
    category: '',
    mode_of_payment: '',
    timePeriod: 'currentMonth' // Default to current month
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [displayedExpenses, setDisplayedExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch expenses when filters change
  useEffect(() => {
    if (filters.startDate !== undefined) { // Only fetch if filters are initialized
      fetchPagedExpenses(1, filters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.category, filters.mode_of_payment]); // Re-fetch when filters change

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchPagedExpenses(pageNumber);
  };

  // Fetch a specific page of expenses
  const fetchPagedExpenses = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {};
      if (currentFilters.startDate) {
        params.startDate = currentFilters.startDate.toISOString();
      }
      if (currentFilters.endDate) {
        params.endDate = currentFilters.endDate.toISOString();
      }
      if (currentFilters.category) {
        params.category = currentFilters.category;
      }
      if (currentFilters.mode_of_payment) {
        params.mode_of_payment = currentFilters.mode_of_payment;
      }

      // Fetch paginated expenses for display
      const response = await api.get('/api/expenses', { 
        params: {
          ...params,
          page: page,
          limit: itemsPerPage
        }
      });
      
      const expensesData = response.data.data;
      
      // Ensure amount is a number for each expense
      const processedExpenses = expensesData.map(expense => ({
        ...expense,
        amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
      }));
      
      setExpenses(processedExpenses);
      setDisplayedExpenses(processedExpenses);
      
      // Update total pages and total amount from the API response
      const totalItems = response.data.count;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(calculatedTotalPages);
      setTotalCount(totalItems);
      setTotalAmount(response.data.totalAmount || 0);
      
      setError('');
    } catch (error) {
      setError('Failed to fetch expenses. Please try again.');
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep a wrapper for handleFilter
  const fetchExpenses = (filterParams = {}) => {
    setCurrentPage(1);
    fetchPagedExpenses(1, filterParams);
  };

  // Delete expense
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/api/expenses/${id}`);
        
        // Update both expense lists after deletion
        setExpenses(expenses.filter(expense => expense._id !== id));

        
        // If the current page becomes empty (except for the first page), go to the previous page
        if (currentPage > 1 && displayedExpenses.length === 1) {
          handlePageChange(currentPage - 1);
        } else {
          // Refresh the current page
          fetchPagedExpenses(currentPage);
        }
        
        toast.success('Expense deleted successfully');
      } catch (error) {
        toast.error('Failed to delete expense');
        console.error('Error deleting expense:', error);
      }
    }
  };

  // Apply filters
  const handleFilter = (filterData) => {
    fetchExpenses(filterData);
  };

  // Get period label for the summary
  const getPeriodLabel = () => {
    switch (filters.timePeriod) {
      case 'currentMonth':
        return 'Current Month';
      case 'lastMonth':
        return 'Last Month';
      case 'last3Months':
        return 'Last 3 Months';
      case 'last6Months':
        return 'Last 6 Months';
      case 'currentYear':
        return 'Current Year';
      case 'lastYear':
        return 'Last Year';
      case 'all':
        return 'All Time';
      case 'custom':
        if (filters.startDate && filters.endDate) {
          return `${filters.startDate.toLocaleDateString()} - ${filters.endDate.toLocaleDateString()}`;
        }
        return 'Custom Period';
      default:
        return '';
    }
  };

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );
    
    // First page
    items.push(
      <Pagination.Item 
        key={1} 
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
    );
    
    // Ellipsis if needed
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis1" />);
    }
    
    // Pages around current page
    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page++) {
      items.push(
        <Pagination.Item 
          key={page} 
          active={currentPage === page}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis2" />);
    }
    
    // Last page if not the first page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item 
          key={totalPages} 
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    
    return <Pagination>{items}</Pagination>;
  };

  return (
    <Container className="dashboard-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Expenses</h2>
        <Button as={Link} to="/add-expense" variant="primary" className="d-flex align-items-center">
          <FaPlus className="me-2" /> <span className="d-none d-sm-inline">Add New Expense</span>
        </Button>
      </div>

      <ExpenseFilter 
        filters={filters} 
        setFilters={setFilters} 
        onFilter={handleFilter} 
      />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading expenses...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : totalCount === 0 ? (
        <Alert variant="info">
          No expenses found for the selected period. Try changing your filters or add a new expense!
        </Alert>
      ) : (
        <>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Summary: {getPeriodLabel()}</h4>
              <Row>
                <Col md={6}>
                  <div className="d-flex flex-column">
                    <span className="text-muted">Total Expenses</span>
                    <h3 className="text-primary">{formatAmount(totalAmount, user?.currency)}</h3>
                  </div>
                </Col>
                <Col md={6} className="text-md-end">
                  <div className="d-flex flex-column">
                    <span className="text-muted">Number of Expenses</span>
                    <h3>{totalCount}</h3>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="mb-3">
            <p className="text-muted">
              Showing {displayedExpenses.length} of {totalCount} expenses
              {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>

          <Row>
            <Col>
              {displayedExpenses.map((expense) => (
                <ExpenseItem
                  key={expense._id}
                  expense={expense}
                  onDelete={handleDelete}
                />
              ))}
            </Col>
          </Row>
          
          <div className="d-flex justify-content-center mt-4">
            {renderPagination()}
          </div>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
