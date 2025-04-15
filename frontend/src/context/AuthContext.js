import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        try {
          // Set auth token header
          setAuthToken(localStorage.getItem('token'));
          
          // Get user data
          const res = await axios.get('/api/users/profile');
          setUser(res.data.user);
        } catch (error) {
          // Clear token and user data if invalid
          localStorage.removeItem('token');
          setAuthToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Set auth token as default header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/users/signup', userData);
      
      // Save token to local storage
      localStorage.setItem('token', res.data.token);
      
      // Set token to auth header
      setAuthToken(res.data.token);
      
      // Set user
      setUser(res.data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post('/api/users/login', userData);
      
      // Save token to local storage
      localStorage.setItem('token', res.data.token);
      
      // Set token to auth header
      setAuthToken(res.data.token);
      
      // Set user
      setUser(res.data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Update user currency
  const updateCurrency = async (currency) => {
    try {
      const res = await axios.put('/api/users/currency', { currency });
      
      // Update user in state
      setUser(res.data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update currency'
      };
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    
    // Remove auth header
    setAuthToken(null);
    
    // Clear user
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateCurrency
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
