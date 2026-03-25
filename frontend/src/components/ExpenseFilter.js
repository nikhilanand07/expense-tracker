import React, { useEffect, useState, useCallback } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ExpenseFilter = ({ filters, setFilters, onFilter }) => {
  const { darkMode } = useTheme();
  // Category options
  const categories = [
    'All',
    'Food',
    'Transportation',
    'Housing',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  // Payment mode options
  const paymentModes = [
    'All',
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Mobile Wallet',
    'Other'
  ];

  // Time period options
  const timePeriods = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'currentYear', label: 'Current Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsFilterOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle date changes
  const handleDateChange = (field, date) => {
    setFilters({
      ...filters,
      [field]: date
    });
  };

  // Handle select changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'timePeriod') {
      handleTimePeriodChange(value);
    } else {
      // For category and payment method, update filters and apply immediately
      const newFilters = {
        ...filters,
        [name]: value === 'All' ? '' : value
      };
      
      setFilters(newFilters);
      applyAndClose(newFilters); // Apply filters immediately
    }
  };

  // Handle time period selection
  const handleTimePeriodChange = (timePeriod) => {
    let newStartDate = null;
    let newEndDate = null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (timePeriod) {
      case 'currentMonth':
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        newEndDate = today;
        break;
      case 'lastMonth':
        newStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        newEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'last3Months':
        newStartDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        newEndDate = today;
        break;
      case 'last6Months':
        newStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        newEndDate = today;
        break;
      case 'currentYear':
        newStartDate = new Date(now.getFullYear(), 0, 1);
        newEndDate = today;
        break;
      case 'lastYear':
        newStartDate = new Date(now.getFullYear() - 1, 0, 1);
        newEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      case 'all':
        newStartDate = null;
        newEndDate = null;
        break;
      case 'custom':
        // Keep current dates for custom
        newStartDate = filters.startDate;
        newEndDate = filters.endDate;
        break;
      default:
        return;
    }

    const newFilters = {
      ...filters,
      startDate: newStartDate,
      endDate: newEndDate,
      timePeriod
    };
    
    setFilters(newFilters);

    // If not custom, apply the filter immediately
    if (timePeriod !== 'custom') {
      applyAndClose(newFilters);
    }
  };

  // Apply filters and close on mobile
  const applyAndClose = useCallback((newFilters) => {
    onFilter(newFilters);
    if (isMobile) {
      setIsFilterOpen(false);
    }
  }, [onFilter, isMobile]);

  // Reset filters
  const handleReset = () => {
    const resetFilters = {
      startDate: null,
      endDate: null,
      category: '',
      mode_of_payment: '',
      timePeriod: 'currentMonth'
    };
    setFilters(resetFilters);
    applyAndClose(resetFilters);
  };

  // Toggle filter on mobile
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="filter-container mb-4">
      {/* Mobile Filter Toggle Button */}
      {isMobile && (
        <div className="mb-3">
          <Button 
            variant={darkMode ? "outline-light" : "outline-primary"} 
            className="w-100 d-flex justify-content-between align-items-center"
            onClick={toggleFilter}
          >
            <span><FaFilter className="me-2" /> Filters {activeFilters > 0 && <span className="badge bg-primary ms-2">{activeFilters}</span>}</span>
            <span>{isFilterOpen ? <FaTimes /> : '+'}</span>
          </Button>
        </div>
      )}

      {/* Filter Content - Always visible on desktop, toggleable on mobile */}
      <div className={`filter-section ${isMobile && !isFilterOpen ? 'd-none' : 'd-block'}`}>
        <h5 className="mb-3">Filter Expenses</h5>
        
        <Form onSubmit={(e) => {
          e.preventDefault();
          applyAndClose(filters);
        }}>
          <Row className="mb-3">
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group controlId="timePeriod">
                <Form.Label>Time Period</Form.Label>
                <Form.Select
                  name="timePeriod"
                  value={filters.timePeriod}
                  onChange={handleSelectChange}
                >
                  {timePeriods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={filters.category === '' ? 'All' : filters.category}
                  onChange={handleSelectChange}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group controlId="mode_of_payment">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="mode_of_payment"
                  value={filters.mode_of_payment === '' ? 'All' : filters.mode_of_payment}
                  onChange={handleSelectChange}
                >
                  {paymentModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Only show date pickers for custom time period */}
          {filters.timePeriod === 'custom' && (
            <>
              <Row className="mb-3">
                <Col md={6} className="mb-3 mb-md-0">
                  <Form.Group controlId="startDate">
                    <Form.Label>Start Date</Form.Label>
                    <DatePicker
                      selected={filters.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      selectsStart
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      className="form-control"
                      dateFormat="MMMM d, yyyy"
                      isClearable
                      placeholderText="Select start date"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="endDate">
                    <Form.Label>End Date</Form.Label>
                    <DatePicker
                      selected={filters.endDate}
                      onChange={(date) => {
                        // Set time to end of day (23:59:59) for the end date
                        if (date) {
                          const endOfDay = new Date(date);
                          endOfDay.setHours(23, 59, 59, 999);
                          handleDateChange('endDate', endOfDay);
                        } else {
                          handleDateChange('endDate', null);
                        }
                      }}
                      selectsEnd
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      minDate={filters.startDate}
                      maxDate={new Date()}
                      className="form-control"
                      dateFormat="MMMM d, yyyy"
                      isClearable
                      placeholderText="Select end date"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Button variant="primary" type="submit">
                    Apply Custom Dates
                  </Button>
                </Col>
              </Row>
            </>
          )}
          
          <Row>
            <Col>
              <Button 
                variant="outline-secondary" 
                type="button" 
                onClick={handleReset}
                className="mt-2"
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default ExpenseFilter;
