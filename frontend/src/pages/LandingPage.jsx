import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Activity, ChevronRight } from 'lucide-react';

export const LandingPage = () => {
    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <div className="animate-fade-in">
                    <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Secure Evaluation <br />
                        <span style={{ color: 'var(--accent-primary)', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Intelligence System
                        </span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem', opacity: 0.8 }}>
                        Advanced AI-powered monitoring for tracking and analytics.
                        Ensure integrity with our state-of-the-art surveillance ecosystem.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                            Get Started <ChevronRight size={20} />
                        </Link>
                        <Link to="/about" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 md:grid-cols-2" style={{ gap: '2rem' }}>
                <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.2)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                        <Shield size={28} />
                    </div>
                    <h3>Fraud Detection</h3>
                    <p>Real-time AI analysis to detect anomalous behavior and prevent unauthorized activities during evaluations.</p>
                </div>

                <div className="glass-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div style={{ background: 'rgba(168, 85, 247, 0.2)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-secondary)' }}>
                        <Lock size={28} />
                    </div>
                    <h3>Secure Environment</h3>
                    <p>Locked-down browser environments and secure data transmission to ensure complete system integrity.</p>
                </div>

                <div className="glass-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-success)' }}>
                        <Activity size={28} />
                    </div>
                    <h3>Live Monitoring</h3>
                    <p>Comprehensive dashboard for proctors to monitor multiple sessions simultaneously with real-time alerts.</p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="glass-panel" style={{ marginTop: '6rem', padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '3rem' }}>Trusted by Leading Institutions</h2>
                <div className="grid grid-cols-4 md:grid-cols-2" style={{ gap: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>99.9%</div>
                        <div style={{ opacity: 0.7 }}>Uptime</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>10k+</div>
                        <div style={{ opacity: 0.7 }}>Exams Monitored</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-alert)' }}>0%</div>
                        <div style={{ opacity: 0.7 }}>False Positives</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>24/7</div>
                        <div style={{ opacity: 0.7 }}>Support</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
