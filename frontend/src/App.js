import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import SettingsPage from './pages/SettingsPage';

// Components
import Sidebar from './components/Sidebar';
import BottomNavbar from './components/BottomNavbar';
import ProtectedRoute from './components/ProtectedRoute';

const AUTH_PATHS = ['/login', '/signup'];

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div className="spinner-dark" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <GroupProvider>
        {isAuthPage || !user ? (
          /* ── Auth / Public Routes ── */
          <Routes>
            <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
            <Route path="/login"  element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          </Routes>
        ) : (
          /* ── Authenticated App Shell ── */
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/login"  element={<Navigate to="/dashboard" />} />
                <Route path="/signup" element={<Navigate to="/dashboard" />} />

                <Route path="/dashboard"              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/add-expense"            element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
                <Route path="/edit-expense/:id"       element={<ProtectedRoute><EditExpense /></ProtectedRoute>} />
                <Route path="/insights"               element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
                <Route path="/groups"                 element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
                <Route path="/groups/create"          element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
                <Route path="/groups/:id"             element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
                <Route path="/groups/:id/create-bill" element={<ProtectedRoute><CreateBill /></ProtectedRoute>} />
                <Route path="/settings"               element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
            <BottomNavbar />
          </div>
        )}
      </GroupProvider>
    </ThemeProvider>
  );
}

export default App;
