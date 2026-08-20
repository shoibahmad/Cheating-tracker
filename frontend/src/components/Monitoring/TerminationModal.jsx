/**
 * TerminationModal.jsx - Overlay dialog displayed when a session is terminated for integrity violations.
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const TerminationModal = ({ show, reason, onBack }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '500px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--accent-alert)',
          boxShadow: '0 0 50px rgba(239, 68, 68, 0.3)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: 'var(--accent-alert)',
          }}
        >
          <AlertTriangle size={48} />
        </div>
        <h2 style={{ color: 'var(--accent-alert)', marginBottom: '1rem', fontSize: '2rem' }}>
          SESSION TERMINATED
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          The system has detected a critical violation of exam protocols.
        </p>

        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.7, marginBottom: '4px' }}>Reason</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{reason}</div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
          onClick={onBack}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
