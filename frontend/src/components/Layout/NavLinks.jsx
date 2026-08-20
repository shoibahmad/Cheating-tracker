import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  School,
  Building2,
  GraduationCap,
  Activity,
  Settings,
  Eye,
} from 'lucide-react';

export const getNavLinks = (userRole) => {
  const commonLinks = [
    { path: '/docs', label: 'API Docs', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  if (userRole === 'admin') {
    return [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/create-paper', label: 'Create Paper', icon: FileText },
      { path: '/admin/assign-exam', label: 'Assign Exam', icon: School },
      { path: '/admin/live-feed', label: 'Live Feed', icon: Eye },
      { path: '/institutions', label: 'Institutions', icon: Building2 },
      ...commonLinks,
    ];
  }

  if (userRole === 'student') {
    return [
      { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/student/exams', label: 'Exams', icon: GraduationCap },
      { path: '/student/reports', label: 'My Reports', icon: Activity },
      ...commonLinks,
    ];
  }

  return [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/about', label: 'About', icon: Activity },
    { path: '/docs', label: 'API Docs', icon: FileText },
  ];
};

export const DesktopNavLinks = ({ userRole }) => {
  const location = useLocation();
  const navLinks = getNavLinks(userRole);

  return (
    <nav
      className="desktop-nav"
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {navLinks.map((link) => {
        const active = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              color: active ? '#ffffff' : 'var(--text-secondary)',
              background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: active ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 500,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {React.createElement(link.icon, {
              size: 16,
              color: active ? 'var(--accent-primary)' : 'currentColor',
            })}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
