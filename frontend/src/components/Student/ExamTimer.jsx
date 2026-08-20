/**
 * Visual countdown timer component with color thresholds for warning and critical states.
 */

import React from 'react';
import { Clock } from 'lucide-react';

export const ExamTimer = ({ timeLeft, totalDuration = 1800 }) => {
  if (timeLeft === null || timeLeft === undefined) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isWarning = timeLeft <= 300; // < 5 minutes
  const isCritical = timeLeft <= 60; // < 1 minute

  const colorStyle = isCritical
    ? { color: '#ef4444', borderColor: '#ef4444' }
    : isWarning
    ? { color: '#f59e0b', borderColor: '#f59e0b' }
    : { color: 'var(--text-primary)', borderColor: 'rgba(255,255,255,0.1)' };

  return (
    <div
      data-testid="exam-timer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '0.5rem',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid',
        fontFamily: 'monospace',
        fontSize: '1rem',
        fontWeight: 'bold',
        ...colorStyle,
      }}
    >
      <Clock size={18} />
      <span>{formattedTime}</span>
    </div>
  );
};
