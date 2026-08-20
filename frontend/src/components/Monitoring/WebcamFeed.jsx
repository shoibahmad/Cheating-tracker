/**
 * WebcamFeed.jsx - Live camera stream component with anomaly overlay.
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const WebcamFeed = ({ videoRef, alertState, session }) => {
  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        borderRadius: '16px',
      }}
    >
      {/* Red Screen Overlay */}
      {alertState && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(239, 68, 68, 0.4)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            border: '4px solid var(--accent-alert)',
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'var(--accent-alert)',
              padding: '1rem 2rem',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--accent-alert)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <AlertTriangle size={32} /> ANOMALY DETECTED
          </div>
        </div>
      )}

      {/* Video Element */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          background: '#000',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
        />

        {/* Candidate Info Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1.5rem',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{session?.student_name || 'Candidate'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {session?.id || 'Active'}</div>
        </div>
      </div>
    </div>
  );
};
