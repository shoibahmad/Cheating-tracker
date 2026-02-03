import React from 'react';
import { ShieldCheck, Eye, Database, Globe } from 'lucide-react';

export const AboutPage = () => {
    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div className="glass-panel" style={{ padding: '4rem', marginBottom: '3rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>About Us</h1>
                <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', fontSize: '1.2rem', opacity: 0.8 }}>
                    We are dedicated to maintaining the integrity of evaluations through cutting-edge artificial intelligence and secure technologies.
                </p>

                <div className="grid grid-cols-2" style={{ gap: '3rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Our Mission</h2>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                            In an increasingly digital world, the validity of online assessments is paramount.
                            Our mission is to provide institutions and organizations with the tools they need to conduct
                            fair, secure, and reliable evaluations, free from malpractice.
                        </p>
                        <p style={{ lineHeight: '1.8' }}>
                            We believe in privacy-first monitoring that respects the candidate while ensuring strict adherence to examination rules.
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '10px', color: 'var(--accent-primary)' }}><ShieldCheck /></div>
                            <div>
                                <h4 style={{ marginBottom: '0.2rem' }}>Integrity First</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Uncompromised standard of fairness.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ padding: '10px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '10px', color: 'var(--accent-secondary)' }}><Eye /></div>
                            <div>
                                <h4 style={{ marginBottom: '0.2rem' }}>AI Surveillance</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Advanced computer vision algorithms.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '10px', color: 'var(--accent-success)' }}><Database /></div>
                            <div>
                                <h4 style={{ marginBottom: '0.2rem' }}>Secure Data</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>End-to-end encryption for all records.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
