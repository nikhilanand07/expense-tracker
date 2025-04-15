import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExpenseForm from '../components/ExpenseForm';
import { useTheme } from '../context/ThemeContext';

const AddExpense = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post('/api/expenses', values);
      toast.success('Expense added successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to add expense');
      console.error('Error adding expense:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className={darkMode ? "bg-dark" : "bg-white"}>
              <h3 className={`mb-0 ${darkMode ? "text-light" : ""}`}>Add New Expense</h3>
            </Card.Header>
            <Card.Body>
              <ExpenseForm 
                onSubmit={handleSubmit} 
                buttonText="Add Expense"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddExpense;
