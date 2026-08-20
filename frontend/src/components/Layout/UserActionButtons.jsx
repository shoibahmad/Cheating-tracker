import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Zap } from 'lucide-react';

export const UserActionButtons = ({ currentUser, userRole, loading, onOpenDrawer }) => {
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  if (loading) {
    return (
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }}
      />
    );
  }

  if (currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn-icon"
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              background: 'var(--accent-primary)',
              borderRadius: '50%',
            }}
          />
        </button>

        <div
          onClick={onOpenDrawer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '4px 10px 4px 4px',
            borderRadius: '30px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#ffffff',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userName}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Link
        to="/login"
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#ffffff',
          textDecoration: 'none',
        }}
      >
        Sign In
      </Link>
      <Link
        to="/signup"
        className="btn btn-primary"
        style={{
          padding: '0.5rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Zap size={14} /> Get Started
      </Link>
    </div>
  );
};
