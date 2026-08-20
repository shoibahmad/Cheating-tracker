import React from 'react';
import { Database, MousePointer2, Terminal } from 'lucide-react';

const ArchLayer = ({ title, icon, desc, color, highlight }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      padding: '2rem',
      borderRadius: '20px',
      background: highlight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.03)',
      border: highlight ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
      transition: 'all 0.3s ease',
      zIndex: 1,
    }}
  >
    <div
      style={{
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        background: `${color}20`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <h4 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 0.4rem 0', color }}>{title}</h4>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{desc}</p>
    </div>
  </div>
);

const LayerConnector = () => (
  <div style={{ display: 'flex', justifyContent: 'center', margin: '-1rem 0', zIndex: 0 }}>
    <div style={{ width: '2px', height: '2rem', background: 'rgba(255,255,255,0.1)' }} />
  </div>
);

export const ArchitectureDiagram = () => (
  <div style={{ marginBottom: '6rem' }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
        padding: '3rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ArchLayer
        title="Presentation Layer (React 19)"
        icon={<MousePointer2 size={24} />}
        desc="Real-time live proctoring dashboard, student kiosk, and MediaPipe face tracking"
        color="#61DAFB"
      />
      <LayerConnector />
      <ArchLayer
        title="Application & AI Layer (FastAPI)"
        icon={<Terminal size={24} />}
        desc="REST endpoints, Pydantic data models, Haar cascades, and Gemini AI grading engine"
        color="#009688"
        highlight
      />
      <LayerConnector />
      <ArchLayer
        title="Data & Auth Layer (Firebase Firestore)"
        icon={<Database size={24} />}
        desc="Cloud Firestore real-time session state, role isolation, and security tokens"
        color="#FFCA28"
      />
    </div>
  </div>
);
