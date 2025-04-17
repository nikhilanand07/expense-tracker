import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';
import { FaChartPie, FaRobot, FaBrain, FaLightbulb, FaHome } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  // Check if the current route is the insights page
  const isInsightsPage = location.pathname === '/insights';

  // Close navbar when route changes
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar 
      bg={darkMode ? 'dark' : 'white'} 
      variant={darkMode ? 'dark' : 'light'} 
      expand="lg" 
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
      className={`navbar ${darkMode ? 'navbar-dark' : ''}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <div className={`dashboard-icon-container ${darkMode ? 'dark' : 'light'}`}>
            <div className="dashboard-icon-gradient"></div>
            <div className="dashboard-icon-circle">
              <FaHome className="dashboard-icon" />
            </div>
          </div>
          <span className="ms-2" style={{ color: darkMode ? '#a66eff' : '#6a11cb' }}>Expense</span> Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto mobile-nav">
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard" className="my-2 my-lg-0" onClick={() => setExpanded(false)}>
                  Dashboard
                </Nav.Link>
                
                {/* Enhanced AI-themed Insights Link */}
                <Nav.Link 
                  as={Link} 
                  to="/insights" 
                  onClick={() => setExpanded(false)}
                  className={`insights-link my-2 my-lg-0 ${isInsightsPage ? 'active' : ''}`}
                  style={{
                    background: isInsightsPage 
                      ? 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)' 
                      : 'linear-gradient(90deg, #8e2de2 0%, #4a00e0 100%)',
                    color: '#fff',
                    borderRadius: '20px',
                    padding: '6px 15px',
                    margin: '8px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: darkMode 
                      ? '0 4px 6px rgba(255, 255, 255, 0.08), 0 1px 3px rgba(255, 255, 255, 0.05)' 
                      : '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = darkMode 
                      ? '0 7px 14px rgba(255, 255, 255, 0.08), 0 3px 6px rgba(255, 255, 255, 0.05)' 
                      : '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = darkMode 
                      ? '0 4px 6px rgba(255, 255, 255, 0.08), 0 1px 3px rgba(255, 255, 255, 0.05)' 
                      : '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <FaBrain style={{ fontSize: '16px' }} /> 
                  <span>AI Insights</span>
                  <div 
                    className="pulse-effect"
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#4ade80',
                      borderRadius: '50%',
                      marginLeft: '5px',
                      position: 'relative'
                    }}
                  />
                </Nav.Link>
                
                <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center mt-2 mt-lg-0">
                  {user && (
                    <div className="d-flex align-items-center my-2 my-lg-0 mx-lg-2">
                      <CurrencySelector />
                    </div>
                  )}
                  <div className="my-2 my-lg-0 mx-lg-2">
                    <ThemeToggle />
                  </div>
                  <Button 
                    variant={darkMode ? "outline-light" : "outline-danger"} 
                    className="my-2 my-lg-0 ms-lg-2" 
                    onClick={() => {
                      setExpanded(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/" className="my-2 my-lg-0" onClick={() => setExpanded(false)}>
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/login" className="my-2 my-lg-0" onClick={() => setExpanded(false)}>
                  Login
                </Nav.Link>
                <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center mt-2 mt-lg-0">
                  <div className="my-2 my-lg-0 mx-lg-2">
                    <ThemeToggle />
                  </div>
                  <Button 
                    variant={darkMode ? "light" : "primary"} 
                    className="my-2 my-lg-0 ms-lg-2" 
                    as={Link} 
                    to="/signup"
                    onClick={() => setExpanded(false)}
                  >
                    Sign Up
                  </Button>
                </div>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
