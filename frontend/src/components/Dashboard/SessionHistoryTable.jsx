/**
 * SessionHistoryTable component rendering the searchable/filterable session records.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, MessageSquare, Zap, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export const SessionHistoryTable = ({
  sessions = [],
  onDeleteSession,
  onOpenMessageModal,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '1rem',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <CheckCircle size={12} /> Completed
          </span>
        );
      case 'Terminated':
      case 'Flagged':
        return (
          <span
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '1rem',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <ShieldAlert size={12} /> {status}
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '1rem',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Clock size={12} /> Active
          </span>
        );
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div
        data-testid="empty-sessions"
        className="glass-panel"
        style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', color: 'var(--text-secondary)' }}
      >
        No exam sessions recorded yet.
      </div>
    );
  }

  return (
    <div
      data-testid="session-history-table"
      className="glass-panel"
      style={{ borderRadius: '1rem', overflow: 'hidden' }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Student</th>
              <th style={{ padding: '1rem 1.25rem' }}>Exam</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem' }}>Trust Score</th>
              <th style={{ padding: '1rem 1.25rem' }}>Score</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr
                key={session.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td style={{ padding: '1rem 1.25rem', fontWeight: 'bold' }}>
                  {session.student_name || 'Unknown'}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    {session.studentId || session.student_id || 'N/A'}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>{session.exam_title || 'General Exam'}</td>
                <td style={{ padding: '1rem 1.25rem' }}>{getStatusBadge(session.status)}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span
                    style={{
                      color:
                        (session.trust_score ?? 100) >= 80
                          ? '#34d399'
                          : (session.trust_score ?? 100) >= 50
                          ? '#fbbf24'
                          : '#f87171',
                      fontWeight: 'bold',
                    }}
                  >
                    {session.trust_score ?? 100}%
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  {session.score !== undefined ? `${session.score}/${session.total ?? 10}` : '—'}
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    {onOpenMessageModal && session.status === 'Active' && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem' }}
                        onClick={() => onOpenMessageModal(session.id)}
                        title="Send Message"
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
                    {onDeleteSession && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', color: '#ef4444' }}
                        onClick={() => onDeleteSession(session.id)}
                        title="Delete Session"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
