/**
 * ProctoringMonitor component displaying webcam video and proctoring status badge.
 */

import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const ProctoringMonitor = ({
  videoRef,
  isMonitoringActive = true,
  status = 'Active',
  trustScore = 100,
}) => {
  return (
    <div
      data-testid="proctoring-monitor"
      className="glass-panel"
      style={{
        position: 'relative',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '4/3',
          objectFit: 'cover',
          display: 'block',
          transform: 'scaleX(-1)', // Mirror video
        }}
      />

      {/* Proctoring Overlay Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '0.5rem',
          right: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.35rem 0.6rem',
          borderRadius: '0.4rem',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isMonitoringActive ? '#10b981' : '#f59e0b',
              display: 'inline-block',
              animation: isMonitoringActive ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span style={{ fontWeight: 'bold', color: '#fff' }}>
            {isMonitoringActive ? 'AI Proctor Active' : 'Connecting...'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#60a5fa' }}>
          <ShieldCheck size={14} />
          <span>{trustScore}% Trust</span>
        </div>
      </div>
    </div>
  );
};
