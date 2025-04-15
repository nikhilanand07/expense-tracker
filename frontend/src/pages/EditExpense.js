import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExpenseForm from '../components/ExpenseForm';
import { useTheme } from '../context/ThemeContext';

const EditExpense = () => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const { darkMode } = useTheme();

  // Fetch expense details
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await axios.get(`/api/expenses/${id}`);
        
        // Format date for the form
        const expenseData = {
          ...response.data.data,
          expense_date: new Date(response.data.data.expense_date)
        };
        
        setExpense(expenseData);
        setError('');
      } catch (error) {
        setError('Failed to fetch expense details. Please try again.');
        console.error('Error fetching expense:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.put(`/api/expenses/${id}`, values);
      toast.success('Expense updated successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to update expense');
      console.error('Error updating expense:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className={`mt-2 ${darkMode ? "text-light" : ""}`}>Loading expense details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className={darkMode ? "bg-dark" : "bg-white"}>
              <h3 className={`mb-0 ${darkMode ? "text-light" : ""}`}>Edit Expense</h3>
            </Card.Header>
            <Card.Body>
              {expense && (
                <ExpenseForm 
                  initialValues={expense} 
                  onSubmit={handleSubmit} 
                  buttonText="Update Expense"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditExpense;
