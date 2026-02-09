import React, { useState } from 'react';
import { Menu, Bell, X, LayoutDashboard, FileText, School, Building2, GraduationCap, Activity, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileDrawer } from './ProfileDrawer';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Common/Logo';

export const Header = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser, userRole } = useAuth();
    const location = useLocation();

    // Fallback name
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

    // Helper to check if link is active
    const isActive = (path) => location.pathname === path;

    // Define Navigation Links
    const commonLinks = [
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/create-paper', label: 'Create Paper', icon: FileText },
        { path: '/admin/assign-exam', label: 'Assign Exam', icon: School },
        { path: '/institutions', label: 'Institutions', icon: Building2 },
    ];

    const studentLinks = [
        { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/exams', label: 'Exams', icon: GraduationCap },
        { path: '/reports', label: 'My Reports', icon: Activity },
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
            { path: '/about', label: 'About', icon: Activity }
        ];
    }

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--glass-border)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                {/* Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <Logo />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                textDecoration: 'none',
                                color: isActive(link.path) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontWeight: isActive(link.path) ? 600 : 400,
                                transition: 'all 0.2s',
                                fontSize: '0.95rem'
                            }}
                        >
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {currentUser && (
                        <>
                            <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                                <Bell size={20} />
                            </button>

                            <button
                                onClick={() => setIsDrawerOpen(true)}
                                className="btn btn-secondary glass-panel"
                                style={{ borderRadius: '50px', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                <span className="desktop-only" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{userName}</span>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 'bold'
                                }}>
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            </button>
                            {/* Role Badge */}
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: userRole === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: userRole === 'admin' ? '#ef4444' : '#10b981',
                                border: `1px solid ${userRole === 'admin' ? '#ef4444' : '#10b981'}`,
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {userRole}
                            </span>
                        </>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ display: 'none', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="mobile-menu glass-panel animate-fade-in" style={{
                    position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0,
                    zIndex: 99, padding: '2rem', background: '#0f172a',
                    display: 'flex', flexDirection: 'column', gap: '1.5rem'
                }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                textDecoration: 'none',
                                color: isActive(link.path) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontSize: '1.1rem', padding: '0.5rem'
                            }}
                        >
                            <link.icon size={24} />
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}

            <ProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
};
