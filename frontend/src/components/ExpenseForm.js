import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrencySymbol } from '../utils/currencyUtils';
import { useNavigate } from 'react-router-dom';

const ExpenseForm = ({ initialValues, onSubmit, buttonText }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const currencySymbol = getCurrencySymbol(user?.currency);
  
  // Default initial values if not provided
  const defaultValues = {
    amount: '',
    category: '',
    expense_date: new Date(),
    mode_of_payment: '',
    description: ''
  };

  // Validation schema
  const validationSchema = Yup.object({
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .typeError('Amount must be a number'),
    category: Yup.string().required('Category is required'),
    expense_date: Yup.date().required('Date is required'),
    mode_of_payment: Yup.string().required('Payment mode is required'),
    description: Yup.string()
  });

  // Category options
  const categories = [
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
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Mobile Wallet',
    'Other'
  ];

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <Formik
      initialValues={initialValues || defaultValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        errors,
        setFieldValue
      }) => (
        <Form onSubmit={handleSubmit} className="expense-form">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="amount">
                <Form.Label className={darkMode ? "text-light" : ""}>Amount ({currencySymbol})</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={values.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.amount && errors.amount}
                  placeholder="Enter amount"
                  className={darkMode ? "dark-input" : ""}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.amount}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="category">
                <Form.Label className={darkMode ? "text-light" : ""}>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.category && errors.category}
                  className={darkMode ? "dark-input" : ""}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="expense_date">
                <Form.Label className={darkMode ? "text-light" : ""}>Date</Form.Label>
                <DatePicker
                  selected={values.expense_date}
                  onChange={(date) => setFieldValue('expense_date', date)}
                  className={`form-control ${
                    touched.expense_date && errors.expense_date ? 'is-invalid' : ''
                  } ${darkMode ? 'dark-input' : ''}`}
                  dateFormat="MMMM d, yyyy"
                  maxDate={new Date()}
                />
                {touched.expense_date && errors.expense_date && (
                  <div className="invalid-feedback">{errors.expense_date}</div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="mode_of_payment">
                <Form.Label className={darkMode ? "text-light" : ""}>Payment Method</Form.Label>
                <Form.Select
                  name="mode_of_payment"
                  value={values.mode_of_payment}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.mode_of_payment && errors.mode_of_payment}
                  className={darkMode ? "dark-input" : ""}
                >
                  <option value="">Select Payment Method</option>
                  {paymentModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.mode_of_payment}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="description" className="mb-3">
            <Form.Label className={darkMode ? "text-light" : ""}>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="Enter description"
              className={darkMode ? "dark-input" : ""}
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button 
              variant={darkMode ? "outline-light" : "outline-secondary"} 
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
            >
              {buttonText || 'Save Expense'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ExpenseForm;
