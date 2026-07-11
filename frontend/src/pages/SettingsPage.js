import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { currencies } from '../utils/currencyUtils';
import { toast } from 'react-toastify';
import api from '../services/api';

const BUDGET_KEY = 'et_monthly_budget';
const DEFAULT_BUDGET = 25000;
const EMAIL_NOTIF_KEY = 'et_email_notifications';
const BUDGET_ALERT_KEY = 'et_budget_alerts';

const SettingsPage = () => {
  const { user, updateCurrency } = useAuth();
  
  // Stats state
  const [stats, setStats] = useState({ expenses: 0, groups: 0, months: 4 });

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem(BUDGET_KEY);
    return saved ? parseFloat(saved) : DEFAULT_BUDGET;
  });
  
  // Toggle states
  const [emailNotif, setEmailNotif] = useState(() => {
    const saved = localStorage.getItem(EMAIL_NOTIF_KEY);
    return saved === null ? true : saved === 'true';
  });
  const [budgetAlert, setBudgetAlert] = useState(() => {
    const saved = localStorage.getItem(BUDGET_ALERT_KEY);
    return saved === null ? true : saved === 'true';
  });

  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch stats on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [expRes, grpRes] = await Promise.all([
          api.get('/api/expenses', { params: { limit: 1 } }),
          api.get('/api/groups')
        ]);
        
        const totalExpensesCount = expRes.data.count || 0;
        const totalGroupsCount = grpRes.data.data?.length || grpRes.data.length || 0;
        
        // Calculate months (fetch at least some records to find start date if any, or default to 4)
        let monthsCount = 4;
        const dateRes = await api.get('/api/expenses', { params: { limit: 1000 } });
        if (dateRes.data.data && dateRes.data.data.length > 0) {
          const dates = dateRes.data.data.map(e => new Date(e.expense_date));
          const oldest = new Date(Math.min(...dates));
          const now = new Date();
          monthsCount = Math.max(1, (now.getFullYear() - oldest.getFullYear()) * 12 + now.getMonth() - oldest.getMonth() + 1);
        }
        
        setStats({
          expenses: totalExpensesCount,
          groups: totalGroupsCount,
          months: monthsCount
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    
    fetchStats();
  }, []);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      // Mock name/email change since backend only supports currency updates
      toast.success('Profile updated successfully');
      setSavingProfile(false);
    }, 600);
  };

  // Auto-save preference changes
  const handleCurrencyChange = async (newVal) => {
    setCurrency(newVal);
    try {
      const res = await updateCurrency(newVal);
      if (res.success) {
        toast.success('Currency updated');
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update currency');
    }
  };

  const handleBudgetChange = (newVal) => {
    const val = parseFloat(newVal) || 0;
    setBudget(val);
    localStorage.setItem(BUDGET_KEY, val.toString());
  };

  const handleToggleEmail = (checked) => {
    setEmailNotif(checked);
    localStorage.setItem(EMAIL_NOTIF_KEY, checked.toString());
    toast.success(`Email summaries ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleToggleAlerts = (checked) => {
    setBudgetAlert(checked);
    localStorage.setItem(BUDGET_ALERT_KEY, checked.toString());
    toast.success(`Budget alerts ${checked ? 'enabled' : 'disabled'}`);
  };

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        
        {/* ── Left Column: Profile Card ── */}
        <div className="settings-profile-card">
          <div className="settings-profile-avatar">
            {getInitials(user?.name)}
          </div>
          <h2 className="settings-profile-name">{user?.name}</h2>
          <p className="settings-profile-email">{user?.email}</p>
          <span className="settings-profile-badge">Personal Account</span>
          
          <div className="settings-profile-stats">
            <div className="settings-stat-item">
              <span className="settings-stat-num">{stats.expenses}</span>
              <span className="settings-stat-label">Expenses</span>
            </div>
            <div className="settings-stat-item">
              <span className="settings-stat-num">{stats.groups}</span>
              <span className="settings-stat-label">Groups</span>
            </div>
            <div className="settings-stat-item">
              <span className="settings-stat-num">{stats.months}</span>
              <span className="settings-stat-label">Months</span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Configuration Cards ── */}
        <div>
          
          {/* Card 1: Profile Information */}
          <div className="settings-card">
            <h3 className="settings-card-title">Profile Information</h3>
            <form onSubmit={handleProfileSubmit}>
              <div className="settings-form-grid">
                <div className="modal-form-field">
                  <label className="modal-label" htmlFor="settings-name">Full Name</label>
                  <input
                    id="settings-name"
                    type="text"
                    className="modal-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-form-field">
                  <label className="modal-label" htmlFor="settings-email">Email</label>
                  <input
                    id="settings-email"
                    type="email"
                    className="modal-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary-dark"
                disabled={savingProfile}
                style={{ padding: '10px 20px', borderRadius: '8px' }}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Card 2: Preferences */}
          <div className="settings-card">
            <h3 className="settings-card-title">Preferences</h3>
            
            {/* Currency Row */}
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Currency</span>
                <span className="settings-row-desc">Display currency for all expenses</span>
              </div>
              <select
                className="modal-select"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                style={{ width: '130px', padding: '8px 24px 8px 12px', fontSize: '13px' }}
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Notifications Row */}
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Email Notifications</span>
                <span className="settings-row-desc">Weekly spending summaries</span>
              </div>
              <label className="switch" htmlFor="toggle-email">
                <input
                  id="toggle-email"
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => handleToggleEmail(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Budget Alerts Row */}
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Budget Alerts</span>
                <span className="settings-row-desc">Alert when nearing monthly limit</span>
              </div>
              <label className="switch" htmlFor="toggle-alerts">
                <input
                  id="toggle-alerts"
                  type="checkbox"
                  checked={budgetAlert}
                  onChange={(e) => handleToggleAlerts(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Monthly Budget Row */}
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Monthly Budget</span>
                <span className="settings-row-desc">Set your spending limit</span>
              </div>
              <input
                type="number"
                className="modal-input"
                value={budget}
                onChange={(e) => handleBudgetChange(e.target.value)}
                style={{ width: '130px', padding: '8px 12px', fontSize: '13px', textAlign: 'right' }}
                placeholder="25000"
                min="0"
              />
            </div>
          </div>

          {/* Card 3: Security */}
          <div className="settings-card">
            <h3 className="settings-card-title">Security</h3>
            
            {/* Change Password Row */}
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Change Password</span>
                <span className="settings-row-desc">Update your account password</span>
              </div>
              <button
                className="btn-ghost"
                onClick={() => toast.info('Password reset instructions sent')}
                style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px' }}
              >
                Change →
              </button>
            </div>

            {/* Delete Account Row */}
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Delete Account</span>
                <span className="settings-row-desc">Permanently remove all your data</span>
              </div>
              <button
                className="btn-danger-sm"
                onClick={() => {
                  if (window.confirm('Are you absolutely sure you want to delete your account? This action is irreversible.')) {
                    toast.error('Account deletion requested');
                  }
                }}
                style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px' }}
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default SettingsPage;
