import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdGroup, MdShowChart, MdSettings, MdLogout } from 'react-icons/md';
import { BsActivity } from 'react-icons/bs';

const NAV_SECTIONS = [
  {
    section: 'MAIN',
    items: [
      { path: '/dashboard', Icon: MdDashboard, label: 'Dashboard' },
    ]
  },
  {
    section: 'MENU',
    items: [
      { path: '/groups',   Icon: MdGroup,     label: 'Groups' },
      { path: '/insights', Icon: MdShowChart,  label: 'Insights' },
    ]
  },
  {
    section: 'ACCOUNT',
    items: [
      { path: '/settings', Icon: MdSettings, label: 'Settings' },
    ]
  }
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const getCurrencyCode = () => user?.currency || 'INR';

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BsActivity color="white" size={17} />
        </div>
        <div className="sidebar-logo-text">
          <em>Expense</em>&nbsp;Tracker
        </div>
      </div>

      {/* ── Navigation ── */}
      {NAV_SECTIONS.map(({ section, items }) => (
        <div key={section} className="sidebar-section">
          <div className="sidebar-section-label">{section}</div>
          {items.map(({ path, Icon, label }) => {
            const isActive =
              location.pathname === path ||
              (path !== '/dashboard' && location.pathname.startsWith(path + '/'));
            return (
              <Link
                key={path}
                to={path}
                className={`sidebar-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon className="nav-icon" />
                {label}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="sidebar-spacer" />

      {/* ── User Footer ── */}
      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-sub">
                ₹ {getCurrencyCode()} · Personal
              </div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <MdLogout size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
