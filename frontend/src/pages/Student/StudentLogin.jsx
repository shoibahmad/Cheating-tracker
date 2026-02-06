import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

import { LogIn, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentLogin = () => {
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        // In a real app, verify session ID with backend
        // For now, we assume valid if not empty
        try {
            // Check if session exists (optional, reusing existing endpoint)
            const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
            if (res.ok) {
                toast.success('Joined exam session successfully');
                navigate(`/student/exam/${sessionId}`);
            } else {
                toast.error("Invalid Session ID. Please contact your proctor.");
            }
        } catch (e) {
            console.error("Error verifying session", e);
            // Fallback for demo if backend offline or simple test
            toast.success('Joined demo session');
            navigate(`/student/exam/${sessionId || 'EX-DEMO'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            height: 'calc(100vh - 100px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        background: 'var(--accent-primary)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                    }}>
                        <LogIn size={32} color="white" />
                    </div>
                    <h2>Student Portal</h2>
                    <p style={{ opacity: 0.7 }}>Enter your Exam Session ID to begin.</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Session ID</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                                <Key size={18} />
                            </div>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="e.g. EX-101"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 0.8rem 0.8rem 2.5rem',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                value={sessionId}
                                onChange={e => setSessionId(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ padding: '0.8rem', fontSize: '1rem', justifyContent: 'center' }}
                    >
                        {loading ? 'Verifying...' : 'Enter Exam Room'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.5 }}>
                    <p>SecureEval Anti-Cheating System Protected</p>
                </div>
            </div>
        </div>
    );
};
