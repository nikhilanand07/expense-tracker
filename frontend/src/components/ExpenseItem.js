import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatAmount } from '../utils/currencyUtils';

const ExpenseItem = ({ expense, onDelete }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // Function to determine badge color based on category
  const getBadgeColor = (category) => {
    const categories = {
      'Food': 'warning',
      'Transportation': 'info',
      'Housing': 'danger',
      'Entertainment': 'success',
      'Shopping': 'primary',
      'Utilities': 'secondary',
      'Healthcare': 'dark',
      'Education': darkMode ? 'light' : 'dark',
      'Travel': 'info',
      'Other': 'secondary'
    };
    
    return categories[category] || 'secondary';
  };

  return (
    <Card className="expense-card">
      <Card.Body>
        <Row>
          <Col md={8}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg={getBadgeColor(expense.category)} className="me-2">
                  {expense.category}
                </Badge>
                <Badge bg="secondary">
                  {expense.mode_of_payment}
                </Badge>
              </div>
              <h4 className="mb-0 text-primary">
                {formatAmount(expense.amount, user?.currency)}
              </h4>
            </div>
            <p className={darkMode ? "text-light mb-2" : "text-muted mb-2"}>
              {expense.description || 'No description provided'}
            </p>
            <small className={darkMode ? "text-light" : "text-muted"}>
              Date: {moment(expense.expense_date).format('MMM DD, YYYY')}
            </small>
          </Col>
          <Col md={4} className="d-flex justify-content-end align-items-center">
            <Button
              as={Link}
              to={`/edit-expense/${expense._id}`}
              variant={darkMode ? "outline-light" : "outline-primary"}
              size="sm"
              className="me-2"
            >
              <FaEdit /> Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(expense._id)}
            >
              <FaTrash /> Delete
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ExpenseItem;
