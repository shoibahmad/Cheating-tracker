import React from 'react';
import { Server, Shield, Database, Code, Terminal, CheckCircle } from 'lucide-react';

export const APIDocsPage = () => {
    return (
        <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent'
                }}>
                    API Documentation
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    Comprehensive guide to the SecureEval Backend API endpoints.
                </p>
            </div>

            {/* Intro Section */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Server size={24} color="var(--accent-primary)" />
                    <h2 style={{ margin: 0 }}>Base URL</h2>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: 'var(--accent-secondary)' }}>
                    https://cheating-tracker.onrender.com
                </div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                    All endpoints are prefixed with the base URL. Use standard HTTP methods (GET, POST, PUT, DELETE).
                </p>
            </div>

            {/* Authentication */}
            <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-success)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Shield size={24} color="var(--accent-success)" />
                    <h2 style={{ margin: 0 }}>Authentication</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Most endpoints require a Firebase ID Token. Pass it in the Authorization header.
                </p>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', marginBottom: '1rem' }}>
                    Authorization: Bearer &lt;YOUR_FIREBASE_TOKEN&gt;
                </div>
            </div>

            {/* Endpoints Grid */}
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={24} /> Core Endpoints
            </h2>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Endpoint Item */}
                <div className="glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>POST</span>
                        <code style={{ fontSize: '1.1rem' }}>/api/ocr/upload</code>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Uploads an exam paper (PDF/Image) and extracts questions using AI.</p>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>POST</span>
                        <code style={{ fontSize: '1.1rem' }}>/api/analyze_frame</code>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Analyzes a webcam frame for face detection and suspicious activity.</p>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>GET</span>
                        <code style={{ fontSize: '1.1rem' }}>/api/sessions/{'{session_id}'}</code>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Retrieves details of a specific exam session.</p>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>GET</span>
                        <code style={{ fontSize: '1.1rem' }}>/api/question-papers/{'{paper_id}'}</code>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Fetches a specific question paper.</p>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>POST</span>
                        <code style={{ fontSize: '1.1rem' }}>/api/sessions/{'{session_id}'}/submit</code>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Submits student answers and calculates the score.</p>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>POST</span>
                        <code style={{ fontSize: '1.1rem' }}>/api/sessions/{'{session_id}'}/terminate</code>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Terminates a session due to protocol violations.</p>
                </div>
            </div>

            {/* Developer Note */}
            <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.6 }}>
                <p>For full schema details, contact the development team.</p>
            </div>
        </div >
    );
};
