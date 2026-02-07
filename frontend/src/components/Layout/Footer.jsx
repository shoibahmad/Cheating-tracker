import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (

        <footer style={{
            marginTop: 'auto',
            padding: '4rem 2rem 2rem',
            background: 'linear-gradient(to top, #0f172a, transparent)', // Darker blend
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)', // Fixed columns for better spacing if space allows
                gap: '4rem'
            }}>
                {/* Brand Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }} />
                        <h3 style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                            color: 'white'
                        }}>SecureEval</h3>
                    </div>
                    <p style={{
                        opacity: 0.7,
                        lineHeight: '1.6',
                        fontSize: '0.95rem',
                        maxWidth: '320px'
                    }}>
                        Advanced AI-powered proctoring solution for ensuring integrity in remote assessments. Secure, reliable, and intelligent.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{
                        color: 'white',
                        marginBottom: '1.5rem',
                        fontSize: '1.1rem',
                        fontWeight: 600
                    }}>Platform</h4>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        <li><Link to="/about" className="footer-link" style={{ opacity: 0.7, textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }}>About Us</Link></li>
                        <li><Link to="/docs" className="footer-link" style={{ opacity: 0.7, textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }}>API Documentation</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 style={{
                        color: 'white',
                        marginBottom: '1.5rem',
                        fontSize: '1.1rem',
                        fontWeight: 600
                    }}>Project Team</h4>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{
                                color: 'var(--accent-primary)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '0.5rem'
                            }}>Project Leads</p>
                            <p style={{
                                fontWeight: 500,
                                fontSize: '1rem',
                                color: 'white'
                            }}>Nagma Khan & Sonam Chauhan</p>
                        </div>

                        <div style={{
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                Integral University, Lucknow
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                textAlign: 'center',
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.9rem',
                opacity: 0.5
            }}>
                &copy; {new Date().getFullYear()} SecureEval. All rights reserved.
            </div>
        </footer>
    );
};
