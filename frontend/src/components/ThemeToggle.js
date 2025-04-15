import React from 'react';
import { Button } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Button
      variant={darkMode ? 'light' : 'dark'}
      size="sm"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        borderRadius: '50%',
        width: '38px',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        boxShadow: darkMode 
          ? '0 2px 5px rgba(255, 255, 255, 0.2)' 
          : '0 2px 5px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease'
      }}
    >
      {darkMode ? <FaSun className="text-warning" /> : <FaMoon className="text-light" />}
    </Button>
  );
};

export default ThemeToggle;
