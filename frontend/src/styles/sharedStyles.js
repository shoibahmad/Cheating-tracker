/**
 * sharedStyles.js - Shared UI styling objects and design tokens for SecureEval.
 * Reduces inline style object duplication across admin and student pages.
 */

export const sharedStyles = {
  glassCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
    borderRadius: '16px',
    padding: '2rem',
  },

  glassPanel: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
    borderRadius: '12px',
    padding: '1.5rem',
  },

  iconBadge: (bgColor = 'rgba(99, 102, 241, 0.1)', color = 'var(--accent-primary, #6366f1)') => ({
    padding: '0.5rem',
    background: bgColor,
    borderRadius: '8px',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-secondary, #94a3b8)',
  },

  headerContainer: {
    marginBottom: '2rem',
  },

  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },

  subtitle: {
    color: 'var(--text-secondary, #94a3b8)',
    fontSize: '1rem',
  },
};
