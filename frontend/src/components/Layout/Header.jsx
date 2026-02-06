import React, { useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { ProfileDrawer } from './ProfileDrawer';

export const Header = ({ title, onToggleSidebar }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const userName = localStorage.getItem('user_name') || 'Guest';

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                marginTop: '1rem',
                padding: '0 2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary mobile-menu-btn"
                        onClick={onToggleSidebar}
                        style={{ padding: '0.6rem', borderRadius: '8px' }}
                    >
                        <Menu size={24} />
                    </button>
                    <h1 style={{ marginBottom: 0, fontSize: '2rem' }}>{title || 'SecureEval'}</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Notification Icon (Mock) */}
                    <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                        <Bell size={20} />
                    </button>

                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="btn btn-secondary glass-panel"
                        style={{ borderRadius: '50px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{userName}</span>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 'bold'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    </button>
                </div>
            </div>

            <ProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
};
