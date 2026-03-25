import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';
import { FaBrain, FaHome, FaUsers, FaSignOutAlt, FaChartLine } from 'react-icons/fa';
import { HiMenuAlt2 } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    setSidebarOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      {/* ── Sidebar backdrop ── */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Slide-in sidebar ── */}
      <div className={`mobile-sidebar ${sidebarOpen ? 'open' : ''} ${darkMode ? 'dark' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <span className="sidebar-title">Menu</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <IoClose size={24} />
          </button>
        </div>

        {/* Nav items */}
        <div className="sidebar-body">
          {user ? (
            <>
              <Link to="/groups" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <FaUsers className="sidebar-icon" />
                <span>Groups</span>
              </Link>

              <Link to="/insights" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <FaBrain className="sidebar-icon" />
                <span>Insights</span>
              </Link>

              <div className="sidebar-item sidebar-item--control">
                <FaChartLine className="sidebar-icon" />
                <span>Currency</span>
                <div className="sidebar-control-value">
                  <CurrencySelector />
                </div>
              </div>

              <div className="sidebar-item sidebar-item--control">
                <span className="sidebar-icon" style={{ fontSize: '18px' }}>
                  {darkMode ? '🌙' : '☀️'}
                </span>
                <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                <div className="sidebar-control-value">
                  <ThemeToggle />
                </div>
              </div>

              <button className="sidebar-item sidebar-item--logout" onClick={handleLogout}>
                <FaSignOutAlt className="sidebar-icon" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <FaHome className="sidebar-icon" />
                <span>Home</span>
              </Link>
              <Link to="/login" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <span>Login</span>
              </Link>
              <div className="sidebar-item sidebar-item--control">
                <span>{darkMode ? '🌙' : '☀️'}</span>
                <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                <div className="sidebar-control-value">
                  <ThemeToggle />
                </div>
              </div>
              <Link to="/signup" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Top Navbar ── */}
      <Navbar
        bg={darkMode ? 'dark' : 'white'}
        variant={darkMode ? 'dark' : 'light'}
        className={`navbar ${darkMode ? 'navbar-dark' : ''}`}
      >
        <Container>
          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
            <div className={`dashboard-icon-container ${darkMode ? 'dark' : 'light'}`}>
              <div className="dashboard-icon-gradient"></div>
              <div className="dashboard-icon-circle">
                <FaHome className="dashboard-icon" />
              </div>
            </div>
            <span className="ms-2" style={{ color: darkMode ? '#a66eff' : '#6a11cb' }}>Expense</span>&nbsp;Tracker
          </Navbar.Brand>

          {/* Desktop nav links (hidden on mobile) */}
          <Nav className="ms-auto d-none d-lg-flex align-items-center gap-2">
            {user ? (
              <>
                <Nav.Link as={Link} to="/groups">
                  <FaUsers className="me-1" /> Groups
                </Nav.Link>
                <Nav.Link as={Link} to="/insights">
                  <FaBrain className="me-1" /> Insights
                </Nav.Link>
                <CurrencySelector />
                <ThemeToggle />
                <Button variant={darkMode ? 'outline-light' : 'outline-danger'} onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <ThemeToggle />
                <Button variant={darkMode ? 'light' : 'primary'} as={Link} to="/signup">
                  Sign Up
                </Button>
              </>
            )}
          </Nav>

          {/* Mobile hamburger button (hidden on desktop) */}
          <button
            className="d-lg-none sidebar-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <HiMenuAlt2 size={26} />
          </button>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
