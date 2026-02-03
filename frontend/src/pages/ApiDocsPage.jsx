import React from 'react';
import { Share2, Globe, Code } from 'lucide-react';

export const ApiDocsPage = () => {
    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Sidebar Navigation for Docs (Mock) */}
                <div className="glass-panel" style={{ width: '250px', padding: '1.5rem', height: 'fit-content' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Documentation</h4>
                    <div className="nav-item active">Introduction</div>
                    <div className="nav-item">Authentication</div>
                    <div className="nav-item">Endpoints</div>
                    <div className="nav-item">Webhooks</div>
                    <div className="nav-item">SDKs</div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1 }}>
                    <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem' }}>
                        <h1 style={{ marginBottom: '1rem' }}>API Reference</h1>
                        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Integrate our secure evaluation monitoring directly into your LMS or testing platform securely and efficiently.
                        </p>

                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Authentication</h2>
                            <p>All API requests must be authenticated using a Bearer Token in the header.</p>
                            <div className="glass-card" style={{ background: 'rgba(0,0,0,0.3)', fontFamily: 'monospace', padding: '1rem' }}>
                                Authorization: Bearer YOUR_API_KEY
                            </div>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Start a Session</h2>
                            <p>Initiate a new monitoring session for a candidate.</p>
                            <div className="glass-card" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                    <span className="badge badge-active" style={{ background: 'var(--accent-primary)', color: 'white' }}>POST</span>
                                    <span style={{ fontFamily: 'monospace' }}>/api/v1/sessions/start</span>
                                </div>
                                <pre style={{ color: 'var(--text-secondary)', overflowX: 'auto' }}>
                                    {`{
  "exam_id": "EX_12345",
  "candidate_id": "C_98765",
  "duration_minutes": 90,
  "features": ["face_detection", "screen_lock"]
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
