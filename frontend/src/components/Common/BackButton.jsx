/**
 * Reusable BackButton component with consistent styling, hover animations, and accessibility labels.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton = ({ to, label = 'Back to Dashboard', style = {} }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-secondary, #94a3b8)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 500,
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        ...style,
      }}
      className="btn-back-hover"
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
};
