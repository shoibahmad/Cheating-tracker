/**
 * AlertLogFeed.jsx - Right sidebar component for violation log display and integrity meter.
 */

import React from 'react';
import { Eye, AlertTriangle } from 'lucide-react';

export const AlertLogFeed = ({ score, logs, onSimulateCheat }) => {
  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.5rem',
        borderRadius: '16px',
      }}
    >
      {/* Integrity Score Meter */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Trust Score</span>
        <div
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: score > 75 ? 'var(--accent-success, #10b981)' : score > 40 ? 'var(--accent-warning, #f59e0b)' : 'var(--accent-alert, #ef4444)',
          }}
        >
          {score}%
        </div>
      </div>

      {/* Action: Simulate Anomaly */}
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onSimulateCheat}
        style={{
          width: '100%',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.85rem',
        }}
      >
        <Eye size={16} /> Test Violation Trigger
      </button>

      {/* Log Feed */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Live Alert Stream</h4>
        {logs.length === 0 ? (
          <p style={{ fontSize: '0.85rem', opacity: 0.6, fontStyle: 'italic' }}>No anomalies detected yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {logs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderLeft: '3px solid var(--accent-alert, #ef4444)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                }}
              >
                {typeof log === 'string' ? log : log.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
