import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

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
          // Get user data - the token is automatically added by the api service
          const res = await api.get('/api/users/profile');
          setUser(res.data.user);
        } catch (error) {
          // Clear token and user data if invalid
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const res = await api.post('/api/users/signup', userData);
      
      // Save token to local storage
      localStorage.setItem('token', res.data.token);
      
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
      const res = await api.post('/api/users/login', userData);
      
      // Save token to local storage
      localStorage.setItem('token', res.data.token);
      
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
      const res = await api.put('/api/users/currency', { currency });
      
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
