import React, { useState } from 'react';
import { Menu, Bell, X, LayoutDashboard, FileText, School, Building2, GraduationCap, Activity, Settings, Eye } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProfileDrawer } from './ProfileDrawer';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Common/Logo';

export const Header = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser, userRole } = useAuth();
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
                    {currentUser ? (
                        <div className="desktop-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                            <span className="role-badge" style={{
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
                        </div>
                    ) : (
                        <div className="desktop-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative', zIndex: 1001 }}>
                            <button
                                onClick={() => {
                                    console.log("Navigating to login");
                                    navigate('/login');
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', cursor: 'pointer', position: 'relative', zIndex: 1002 }}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    console.log("Navigating to signup");
                                    navigate('/signup');
                                }}
                                className="btn btn-primary"
                                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', cursor: 'pointer', position: 'relative', zIndex: 1002 }}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(true)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Sidebar (Right) */}
            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)', zIndex: 1000
                    }}
                />
            )}

            {/* Sidebar */}
            <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '280px',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid var(--glass-border)',
                zIndex: 1001,
                padding: '2rem',
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', flexDirection: 'column', gap: '2rem',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Menu</h3>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {currentUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'var(--accent-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '1.2rem', color: '#fff'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600 }}>{userName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{userRole}</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1002 }}>
                        <Link
                            to="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            Sign Up
                        </Link>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                textDecoration: 'none',
                                color: isActive(link.path) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontSize: '1.1rem', padding: '0.75rem',
                                background: isActive(link.path) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                borderRadius: '8px'
                            }}
                        >
                            <link.icon size={20} />
                            {link.label}
                        </Link>
                    ))}

                    <hr style={{ borderColor: 'var(--glass-border)', opacity: 0.3 }} />

                    {/* Add Settings/Profile links here specifically for mobile if needed */}
                    <button
                        onClick={() => { setIsMobileMenuOpen(false); setIsDrawerOpen(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            textDecoration: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '1.1rem', padding: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <Settings size={20} />
                        Profile Settings
                    </button>
                </div>
            </div>

            <ProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
};
