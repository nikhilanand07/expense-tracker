import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remembered, setRemembered] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [pwError, setPwError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnLabel, setBtnLabel] = useState('Sign In →');
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    return '';
  };

  const validatePw = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePwBlur = () => {
    setPwTouched(true);
    setPwError(validatePw(password));
  };

  const handleSubmit = async () => {
    const emailErr = validateEmail(email);
    const pwErr = validatePw(password);
    setEmailTouched(true);
    setPwTouched(true);
    setEmailError(emailErr);
    setPwError(pwErr);
    if (emailErr || pwErr) return;

    setLoading(true);
    setBtnLabel('Signing in…');
    setServerError('');

    const result = await login({ email, password });

    if (result.success) {
      setBtnLabel('✓ Welcome back!');
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      setLoading(false);
      setBtnLabel('Sign In →');
      setServerError(result.message || 'Login failed. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="lp-root">

      {/* ═══ LEFT PANEL ═══ */}
      <div className="lp-left">

        {/* Brand */}
        <div className="lp-brand">
          <svg className="lp-brand-icon" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="rgba(124,58,237,0.15)"/>
            <rect x="1" y="1" width="34" height="34" rx="9" stroke="rgba(124,58,237,0.4)" strokeWidth="1"/>
            <path d="M10 22 L14 17 L18 19 L22 13 L26 15" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="26" cy="15" r="2" fill="#22D3EE"/>
            <path d="M18 26 C18 26 14 24 12 22" stroke="rgba(167,139,250,0.4)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span className="lp-brand-name">Expense<span> Tracker</span></span>
        </div>

        {/* Orbit decoration */}
        <div className="lp-orbit">
          <div className="lp-orbit-ring"></div>
          <div className="lp-orbit-ring"></div>
          <div className="lp-orbit-ring"></div>
          <div className="lp-orbit-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 6 L20 12 L28 13 L22 19 L24 27 L16 23 L8 27 L10 19 L4 13 L12 12 Z"
                fill="none" stroke="rgba(124,58,237,0.5)" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Hero text */}
        <div className="lp-hero-text">
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-dot"></span>
            Financial Intelligence Platform
          </div>

          <div className="lp-headline">
            Money.<br/>
            <em>Redefined.</em><br/>
            Controlled.
          </div>

          <p className="lp-sub">
            Track every rupee, spot patterns before they cost you, and make financial decisions
            backed by real data — not guesswork.
          </p>

          {/* Floating stat cards */}
          <div className="lp-stats-row">
            <div className="lp-stat-card">
              <div className="lp-stat-val">₹2.4L</div>
              <div className="lp-stat-label">Saved this year</div>
              <div className="lp-stat-badge">↑ 18.3%</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-val">94%</div>
              <div className="lp-stat-label">Budget accuracy</div>
              <div className="lp-stat-badge">↑ 6.1%</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-val">127</div>
              <div className="lp-stat-label">Txns tracked</div>
              <div className="lp-stat-badge">↑ this month</div>
            </div>
          </div>
        </div>

        {/* Floating mini chart */}
        <div className="lp-chart-wrap">
          <div className="lp-chart-card">
            <div className="lp-chart-title">Monthly Spending</div>
            <div className="lp-bars">
              <div className="lp-bar" style={{ height: '55%', background: 'rgba(124,58,237,0.35)', animationDelay: '0.1s' }}></div>
              <div className="lp-bar" style={{ height: '80%', background: 'rgba(124,58,237,0.5)', animationDelay: '0.2s' }}></div>
              <div className="lp-bar" style={{ height: '45%', background: 'rgba(124,58,237,0.3)', animationDelay: '0.3s' }}></div>
              <div className="lp-bar" style={{ height: '90%', background: 'linear-gradient(to top,#7C3AED,#A78BFA)', animationDelay: '0.4s' }}></div>
              <div className="lp-bar" style={{ height: '60%', background: 'rgba(124,58,237,0.4)', animationDelay: '0.5s' }}></div>
              <div className="lp-bar" style={{ height: '70%', background: 'rgba(34,211,238,0.5)', animationDelay: '0.6s' }}></div>
              <div className="lp-bar" style={{ height: '35%', background: 'rgba(34,211,238,0.3)', animationDelay: '0.7s' }}></div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="lp-ticker-wrap">
          <div className="lp-ticker-inner">
            {[
              { label: 'Food', val: '₹4,200', up: true, pct: '3.2%' },
              { label: 'Travel', val: '₹8,500', up: false, pct: '1.1%' },
              { label: 'Utilities', val: '₹2,100', up: true, pct: '0.8%' },
              { label: 'Shopping', val: '₹6,700', up: false, pct: '5.3%' },
              { label: 'Health', val: '₹1,800', up: true, pct: '2.1%' },
              { label: 'Entertainment', val: '₹3,400', up: true, pct: '12%' },
              { label: 'Food', val: '₹4,200', up: true, pct: '3.2%' },
              { label: 'Travel', val: '₹8,500', up: false, pct: '1.1%' },
              { label: 'Utilities', val: '₹2,100', up: true, pct: '0.8%' },
              { label: 'Shopping', val: '₹6,700', up: false, pct: '5.3%' },
              { label: 'Health', val: '₹1,800', up: true, pct: '2.1%' },
              { label: 'Entertainment', val: '₹3,400', up: true, pct: '12%' },
            ].map((item, i) => (
              <div className="lp-ticker-item" key={i}>
                <strong>{item.label}</strong> {item.val}
                <span className={item.up ? 'lp-ticker-up' : 'lp-ticker-down'}>
                  {item.up ? '↑' : '↓'} {item.pct}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="lp-right">
        <div className="lp-form-card">

          <div className="lp-form-header">
            <div className="lp-form-title">Welcome back</div>
            <div className="lp-form-sub">
              No account? <Link to="/signup">Create one free →</Link>
            </div>
          </div>

          {/* Social login */}
          <div className="lp-social-row">
            <button className="lp-social-btn" type="button" onClick={() => alert('Google OAuth')}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="lp-social-btn" type="button" onClick={() => alert('GitHub OAuth')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="lp-divider">
            <div className="lp-divider-line"></div>
            <div className="lp-divider-text">or</div>
            <div className="lp-divider-line"></div>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="lp-server-error">{serverError}</div>
          )}

          {/* Form fields */}
          <div className="lp-fields">
            <div className="lp-field-wrap">
              <label className="lp-field-label">Email address</label>
              <input
                className={`lp-field-input${emailTouched && emailError ? ' has-error' : emailTouched && !emailError ? ' is-valid' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
              <div className={`lp-field-error${emailTouched && emailError ? ' visible' : ''}`}>
                {emailError}
              </div>
            </div>

            <div className="lp-field-wrap">
              <label className="lp-field-label">Password</label>
              <div className="lp-pw-wrap">
                <input
                  className={`lp-field-input${pwTouched && pwError ? ' has-error' : pwTouched && !pwError ? ' is-valid' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handlePwBlur}
                  onKeyDown={handleKeyDown}
                  style={{ paddingRight: '44px' }}
                  autoComplete="current-password"
                />
                <button className="lp-pw-toggle" type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className={`lp-field-error${pwTouched && pwError ? ' visible' : ''}`}>
                {pwError}
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="lp-meta-row">
            <div className="lp-remember" onClick={() => setRemembered(r => !r)}>
              <div className={`lp-remember-box${remembered ? ' checked' : ''}`}>
                {remembered && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="lp-remember-text">Remember me</span>
            </div>
            <button className="lp-forgot" type="button">Forgot password?</button>
          </div>

          {/* Submit */}
          <button
            className={`lp-submit-btn${loading ? ' loading' : ''}`}
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {btnLabel}
          </button>

          <div className="lp-terms">
            By signing in you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
