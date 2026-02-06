import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setSent(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '2rem'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '3rem',
                textAlign: 'center'
            }}>
                {!sent ? (
                    <>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Forgot Password?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="glass-input"
                                    required
                                    placeholder="Enter your email"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem', padding: '1rem' }} disabled={loading}>
                                {loading ? 'Sending...' : <>Send Reset Link <Send size={18} /></>}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="animate-fade-in">
                        <div style={{
                            width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                        }}>
                            <CheckCircle size={40} color="var(--accent-success)" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Check Your Email</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            We've sent a password reset link to <strong>{email}</strong>.
                        </p>
                    </div>
                )}

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        margin: '0 auto', fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Login
                </button>
            </div>
        </div>
    );
};
