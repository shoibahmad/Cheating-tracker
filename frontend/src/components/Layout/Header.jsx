import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileDrawer } from './ProfileDrawer';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Common/Logo';
import { DesktopNavLinks, getNavLinks } from './NavLinks';
import { UserActionButtons } from './UserActionButtons';

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  const mobileNavLinks = getNavLinks(userRole);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 2rem',
            width: '100%',
            maxWidth: '1600px',
            gap: '2rem',
          }}
        >
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <DesktopNavLinks userRole={userRole} />

          {/* User Auth Buttons / Profile Trigger */}
          <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center' }}>
            <UserActionButtons
              currentUser={currentUser}
              userRole={userRole}
              loading={loading}
              onOpenDrawer={() => setIsDrawerOpen(true)}
            />
          </div>

          {/* Mobile Menu Trigger */}
          <div className="mobile-toggle" style={{ display: 'none' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-icon"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px',
                borderRadius: '8px',
                color: 'white',
              }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-panel animate-fade-in"
          style={{
            position: 'fixed',
            top: '65px',
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {mobileNavLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {React.createElement(link.icon, { size: 18 })}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Profile Side Drawer */}
      <ProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
