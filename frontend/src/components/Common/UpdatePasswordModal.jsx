import React, { useState } from 'react';
import { X, Lock, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { auth } from '../../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const UpdatePasswordModal = ({ isOpen, onClose }) => {
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        if (newPass.length < 6) {
            setLoading(false);
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user logged in");

            // 1. Re-authenticate
            const credential = EmailAuthProvider.credential(user.email, currentPass);
            await reauthenticateWithCredential(user, credential);

            // 2. Update Password
            await updatePassword(user, newPass);

            setStatus('success');
            setMessage('Password updated successfully!');
            setTimeout(() => {
                onClose();
                setCurrentPass('');
                setNewPass('');
                setStatus(null);
            }, 2000);

        } catch (err) {
            console.error(err);
            setStatus('error');
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setMessage('Incorrect current password');
            } else if (err.code === 'auth/weak-password') {
                setMessage('Password should be at least 6 characters');
            } else if (err.code === 'auth/requires-recent-login') {
                setMessage('Please log out and log in again');
            } else {
                setMessage(err.message || 'Failed to update password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
        }}>
            <div className="glass-panel" style={{
                width: '400px',
                padding: '2rem',
                position: 'relative',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(52, 211, 153, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }}>
                        <Lock size={24} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <h3 style={{ margin: 0 }}>Update Password</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Secure your account with a new password.</p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--accent-primary)' }}>
                        <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
                        <p>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.8 }}>Current Password</label>
                            <input
                                type="password"
                                className="glass-input"
                                style={{ width: '100%' }}
                                value={currentPass}
                                onChange={(e) => setCurrentPass(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.8 }}>New Password</label>
                            <input
                                type="password"
                                className="glass-input"
                                style={{ width: '100%' }}
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                required
                            />
                        </div>

                        {status === 'error' && (
                            <div style={{
                                padding: '0.8rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                padding: '0.8rem',
                                marginTop: '0.5rem',
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Updating...' : 'Confirm Change'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
