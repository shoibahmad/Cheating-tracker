import React, { useState } from 'react';
import { Menu, Bell, X, LayoutDashboard, FileText, School, Building2, GraduationCap, Activity, Settings, Eye, Zap } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProfileDrawer } from './ProfileDrawer';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Common/Logo';

export const Header = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Fallback name
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

    // Helper to check if link is active
    const isActive = (path) => location.pathname === path;

    // Define Navigation Links
    const commonLinks = [
        { path: '/docs', label: 'API Docs', icon: FileText },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/create-paper', label: 'Create Paper', icon: FileText },
        { path: '/admin/assign-exam', label: 'Assign Exam', icon: School },
        { path: '/admin/live-feed', label: 'Live Feed', icon: Eye },
        { path: '/institutions', label: 'Institutions', icon: Building2 },
    ];

    const studentLinks = [
        { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/student/exams', label: 'Exams', icon: GraduationCap },
        { path: '/student/reports', label: 'My Reports', icon: Activity },
    ];

    let navLinks = [];
    if (userRole === 'admin') {
        navLinks = [...adminLinks, ...commonLinks];
    } else if (userRole === 'student') {
        navLinks = [...studentLinks, ...commonLinks];
    } else {
        // Public / Guest
        navLinks = [
            { path: '/', label: 'Home', icon: LayoutDashboard },
            { path: '/about', label: 'About', icon: Activity },
            { path: '/docs', label: 'API Docs', icon: FileText }
        ];
    }

    return (
        <>
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                width: '100%',
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 2rem',
                    width: '100%',
                    maxWidth: '1600px',
                    gap: '2rem'
                }}>
                    {/* Logo Section */}
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <Logo />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav" style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        alignItems: 'center',
                        flex: 1,
                        justifyContent: 'center',
                        overflowX: 'auto',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        {navLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    style={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        textDecoration: 'none',
                                        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        transition: 'var(--transition-smooth)',
                                        fontSize: '0.85rem',
                                        background: active ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        border: active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <link.icon size={16} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                        {loading ? (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Syncing...</div>
                        ) : currentUser ? (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-primary)',
                                    boxShadow: '0 0 10px var(--accent-primary)',
                                    animation: 'pulse 2s infinite'
                                }} />

                                <button
                                    onClick={() => setIsDrawerOpen(true)}
                                    style={{ 
                                        borderRadius: '12px', 
                                        padding: '0.4rem 0.75rem', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        transition: 'var(--transition-smooth)'
                                    }}
                                >
                                    <span className="desktop-only" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{userName}</span>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 'bold', fontSize: '0.7rem'
                                    }}>
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                                
                                <span style={{
                                    fontSize: '0.65rem',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: userRole === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    color: userRole === 'admin' ? '#f87171' : '#34d399',
                                    border: '1px solid currentColor',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>
                                    {userRole}
                                </span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 1rem' }}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(true)}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid var(--glass-border)', 
                                color: 'white', 
                                cursor: 'pointer', 
                                padding: '8px', 
                                borderRadius: '10px'
                            }}
                        >
                            <Menu size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Sidebar */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)', zIndex: 1000,
                        animation: 'fadeIn 0.3s ease'
                    }}
                />
            )}

            <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{
                position: 'fixed', top: '1rem', right: '1rem', bottom: '1rem',
                width: '300px',
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(30px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '32px',
                zIndex: 1001,
                padding: '2.5rem 2rem',
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(120%)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', flexDirection: 'column', gap: '2.5rem',
                boxShadow: '-20px 0 50px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Logo scale={0.8} />
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            border: 'none', 
                            color: 'white', 
                            cursor: 'pointer',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {navLinks.map((link) => {
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    textDecoration: 'none',
                                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    fontSize: '1rem', padding: '0.85rem 1.25rem',
                                    background: active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                                    border: active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                                    borderRadius: '16px',
                                    fontWeight: 600,
                                    transition: 'var(--transition-smooth)'
                                }}
                            >
                                <link.icon size={20} />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    {currentUser ? (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '1.25rem', 
                            padding: '1.5rem', 
                            background: 'rgba(255,255,255,0.03)', 
                            borderRadius: '24px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    background: 'var(--accent-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '1.2rem', color: '#fff'
                                }}>
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{userName}</div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'var(--accent-primary)', 
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>{userRole}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); setIsDrawerOpen(true); }}
                                className="btn btn-secondary"
                                style={{ width: '100%', borderRadius: '14px' }}
                            >
                                <Settings size={18} />
                                Profile Settings
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'center', borderRadius: '16px' }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', borderRadius: '16px' }}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <ProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
};
