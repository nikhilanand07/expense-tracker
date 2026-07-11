import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { GroupProvider } from './context/GroupContext';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import InsightsPage from './pages/InsightsPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetail from './pages/GroupDetail';
import CreateGroup from './pages/CreateGroup';
import CreateBill from './pages/CreateBill';

// Components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const hideHeader = ['/login', '/signup'].includes(location.pathname);
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <ThemeProvider>
      <GroupProvider>
        {!hideHeader && <Header />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
          <Route path="/edit-expense/:id" element={<ProtectedRoute><EditExpense /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
          
          {/* Group and Bill Routes */}
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/groups/create" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
          <Route path="/groups/:id/create-bill" element={<ProtectedRoute><CreateBill /></ProtectedRoute>} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </GroupProvider>
    </ThemeProvider>
  );
}

export default App;
