import React, { useEffect, useState } from 'react';
import { X, User, LogOut, Settings, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProfileDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { currentUser, userRole, logout } = useAuth();

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Derived state from context
    const name = currentUser?.displayName || 'User';
    const email = currentUser?.email || '';
    const role = userRole || 'Student';

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        try {
            await logout();
            navigate('/login');
            onClose();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setShowLogoutConfirm(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)', zIndex: 998
                    }}
                />
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(15, 23, 42, 0.95)',
                    padding: '2rem',
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    width: '90%',
                    maxWidth: '400px',
                    textAlign: 'center',
                    backdropFilter: 'blur(20px)'
                }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Are you sure?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        You will be logged out of your current session.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="btn"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmLogout}
                            className="btn btn-primary"
                            style={{
                                background: 'var(--accent-alert)',
                                borderColor: 'var(--accent-alert)'
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            )}

            {/* Drawer */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100vh',
                width: '320px',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid var(--glass-border)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 999,
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Profile</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* User Info */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
                    }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                            {name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{email}</p>
                    <div style={{
                        display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px',
                        background: role === 'admin' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: role === 'admin' ? 'var(--accent-success)' : 'var(--accent-primary)',
                        fontSize: '0.8rem', fontWeight: 600, marginTop: '0.5rem'
                    }}>
                        {role.toUpperCase()}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => { navigate('/settings'); onClose(); }}>
                        <Settings size={18} /> Account Settings
                    </button>

                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={handleLogout}
                        className="btn"
                        style={{
                            width: '100%', justifyContent: 'center',
                            background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-alert)',
                            border: '1px solid rgba(244, 63, 94, 0.2)'
                        }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};
