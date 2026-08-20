import React from 'react';

export const FeatureCard = ({ icon, title, desc, borderColor, glowColor }) => (
  <div
    className="glass-card animate-hover"
    style={{
      padding: '2.5rem',
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: `1px solid ${borderColor}`,
      boxShadow: `0 10px 30px -10px ${glowColor}`,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: glowColor,
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}
    >
      {icon}
    </div>
    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem' }}>{desc}</p>
  </div>
);
