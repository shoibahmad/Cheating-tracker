import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Shield } from 'lucide-react';

export const GetStartedPage = () => {
    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1>Start Monitoring in Minutes</h1>
                <p style={{ fontSize: '1.2rem' }}>Choose the plan that fits your institution's needs.</p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-1" style={{ gap: '2rem' }}>
                {/* Starter Plan */}
                <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Starter</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Free</div>
                    <p style={{ marginBottom: '2rem' }}>Perfect for individual tutors and small trials.</p>
                    <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-success)" /> 50 Exams / month</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-success)" /> Basic AI Monitoring</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-success)" /> Email Support</li>
                    </ul>
                    <Link to="/signup" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>Get Started</Link>
                </div>

                {/* Pro Plan */}
                <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', border: '2px solid var(--accent-primary)', transform: 'scale(1.05)' }}>
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>MOST POPULAR</div>
                    <h3 style={{ marginBottom: '1rem' }}>Institution</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>$299<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/mo</span></div>
                    <p style={{ marginBottom: '2rem' }}>For schools and colleges requiring robust security.</p>
                    <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-primary)" /> Unlimited Exams</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-primary)" /> Advanced Fraud Detection</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-primary)" /> Priority Support</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-primary)" /> API Access</li>
                    </ul>
                    <Link to="/signup" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>Start Trial</Link>
                </div>

                {/* Enterprise Plan */}
                <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Enterprise</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Custom</div>
                    <p style={{ marginBottom: '2rem' }}>Tailored solutions for large-scale operations.</p>
                    <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-success)" /> Dedicated Infrastructure</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-success)" /> Custom AI Models</li>
                        <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}><CheckCircle size={20} color="var(--accent-success)" /> 24/7 SLA Support</li>
                    </ul>
                    <Link to="/contact" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>Contact Sales</Link>
                </div>
            </div>
        </div>
    );
};
