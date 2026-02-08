import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    School,
    Building2,
    GraduationCap,
    Settings,
    Activity,
    Eye,
    FileText
} from 'lucide-react';
import { Logo } from '../Common/Logo';

export const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    // Helper to check if link is active
    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/create-paper', label: 'Create Paper', icon: FileText }, // Updated to new page
        { path: '/admin/assign-exam', label: 'Assign Exam', icon: School }, // Added for easy access

        // { path: '/student', label: 'Student Portal', icon: GraduationCap }, // Removed per request
        { path: '/institutions', label: 'Institutions', icon: Building2 },
        { path: '/corporate', label: 'Corporate', icon: Building2 },
        { path: '/exams', label: 'Competitive Exams', icon: GraduationCap },
        { path: '/reports', label: 'Reports', icon: Activity },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            />

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <Logo />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose && onClose()} // Close on click (mobile)
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            style={{
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: isActive(item.path) ? 600 : 400
                            }}
                        >
                            <item.icon size={20} style={{ marginRight: '12px', opacity: isActive(item.path) ? 1 : 0.7 }} />
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div className="glass-card" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                        <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--accent-success)' }}>System Status</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--accent-success)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-success)' }}></div>
                            Operational
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
