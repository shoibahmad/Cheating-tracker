import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export const MobileRestriction = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '500px',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                    marginBottom: '1rem'
                }}>
                    <Smartphone size={40} style={{ color: 'var(--accent-alert)', position: 'absolute' }} />
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '2px',
                        background: 'var(--accent-alert)',
                        transform: 'rotate(-45deg)'
                    }} />
                </div>

                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>Laptop Required</h2>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    The Student Portal and Examination System are restricted to **Laptop or Desktop** devices only.
                </p>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    width: '100%',
                    textAlign: 'left',
                    border: '1px solid var(--glass-border)'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Monitor size={18} /> Why is this restricted?
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li>Ensure stable Proctoring & AI Monitoring.</li>
                        <li>Better visibility of complex exam questions.</li>
                        <li>Prevent accidental tab switching on mobile devices.</li>
                    </ul>
                </div>

                <p style={{ marginTop: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    Please log in via a Computer to continue.
                </p>

                <div style={{
                    marginTop: '2rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    opacity: 0.6
                }}>
                    SecureEval Tracking System &copy; 2026
                </div>
            </div>
        </div>
    );
};
