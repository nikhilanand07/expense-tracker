import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChartLine, FaMoneyBillWave, FaShieldAlt, FaMobileAlt } from 'react-icons/fa';
import expenseTrackerImage from '../assets/images/expense-tracker.svg';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">Take Control of Your Finances</h1>
              <p className="lead mb-4">
                Track, analyze, and manage your expenses with our easy-to-use expense tracker. 
                Get insights into your spending habits and make smarter financial decisions.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/signup" variant="light" size="lg">
                  Get Started
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Login
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src={expenseTrackerImage} 
                alt="Expense Tracker" 
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Why Choose Our Expense Tracker?</h2>
          <Row>
            <Col md={3} className="mb-4">
              <Card className="feature-card h-100 border-0">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <FaChartLine size={40} color="#6a11cb" />
                  </div>
                  <Card.Title>Track Expenses</Card.Title>
                  <Card.Text>
                    Easily record and categorize your daily expenses to keep track of where your money goes.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="feature-card h-100 border-0">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <FaMoneyBillWave size={40} color="#6a11cb" />
                  </div>
                  <Card.Title>Budget Management</Card.Title>
                  <Card.Text>
                    Set budgets for different categories and get alerts when you're close to exceeding them.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="feature-card h-100 border-0">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <FaShieldAlt size={40} color="#6a11cb" />
                  </div>
                  <Card.Title>Secure & Private</Card.Title>
                  <Card.Text>
                    Your financial data is encrypted and securely stored. We prioritize your privacy.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="feature-card h-100 border-0">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <FaMobileAlt size={40} color="#6a11cb" />
                  </div>
                  <Card.Title>Access Anywhere</Card.Title>
                  <Card.Text>
                    Access your expense data from any device, anytime, anywhere with our responsive design.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-light">
        <Container className="text-center">
          <h2 className="mb-4">Ready to Start Managing Your Expenses?</h2>
          <p className="lead mb-4">
            Join thousands of users who have taken control of their finances with our expense tracker.
          </p>
          <Button as={Link} to="/signup" variant="primary" size="lg">
            Sign Up for Free
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
