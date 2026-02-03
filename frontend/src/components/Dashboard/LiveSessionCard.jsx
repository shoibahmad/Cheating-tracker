import React from 'react';

export const LiveSessionCard = ({ session, onSelect }) => (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{session.student_name.charAt(0)}</span>
                </div>
                <div>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', display: 'block' }}>{session.student_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {session.id}</span>
                </div>
            </div>
            <span className={`badge ${session.status === 'Active' ? 'badge-active' : 'badge-flagged'}`}>
                {session.status}
            </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            <span>{session.exam_type}</span>
            <span style={{ color: session.trust_score > 70 ? 'var(--accent-success)' : 'var(--accent-alert)', fontWeight: 'bold' }}>
                {session.trust_score}% Trust
            </span>
        </div>

        <div style={{
            width: '100%',
            height: '6px',
            background: 'var(--bg-tertiary)',
            borderRadius: '3px',
            overflow: 'hidden'
        }}>
            <div style={{
                width: `${session.trust_score}%`,
                height: '100%',
                background: session.trust_score > 70 ? 'var(--accent-success)' : 'var(--accent-alert)',
                transition: 'width 0.5s ease',
                boxShadow: `0 0 10px ${session.trust_score > 70 ? 'var(--accent-success)' : 'var(--accent-alert)'}`
            }} />
        </div>

        <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.875rem', marginTop: '0.5rem' }} onClick={() => onSelect(session)}>
            View Live Feed
        </button>
    </div>
);
