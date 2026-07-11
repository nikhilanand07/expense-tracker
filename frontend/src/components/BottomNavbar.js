import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdGroup, MdShowChart, MdSettings } from 'react-icons/md';

const BottomNavbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', Icon: MdDashboard, label: 'Dashboard' },
    { path: '/groups', Icon: MdGroup, label: 'Groups' },
    { path: '/insights', Icon: MdShowChart, label: 'Insights' },
    { path: '/settings', Icon: MdSettings, label: 'Profile' }
  ];

  return (
    <nav className="bottom-navbar">
      {navItems.map(({ path, Icon, label }) => {
        const isActive =
          location.pathname === path ||
          (path !== '/dashboard' && location.pathname.startsWith(path + '/'));
        return (
          <Link
            key={path}
            to={path}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="bottom-nav-icon" />
            <span className="bottom-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavbar;
