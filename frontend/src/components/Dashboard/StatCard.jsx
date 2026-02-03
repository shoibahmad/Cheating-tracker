import React from 'react';

export const StatCard = ({ label, value, icon: Icon, color }) => {

    const getColor = () => {
        switch (color) {
            case 'blue': return 'var(--accent-primary)';
            case 'red': return 'var(--accent-alert)';
            case 'green': return 'var(--accent-success)';
            case 'purple': return 'var(--accent-secondary)';
            default: return 'var(--accent-primary)';
        }
    }

    const themeColor = getColor();

    return (
        <div className="glass-card stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: themeColor,
                opacity: 0.1,
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: `rgba(${color === 'blue' ? '59, 130, 246' : color === 'red' ? '239, 68, 68' : '16, 185, 129'}, 0.1)`,
                    color: themeColor,
                    border: `1px solid rgba(${color === 'blue' ? '59, 130, 246' : color === 'red' ? '239, 68, 68' : '16, 185, 129'}, 0.2)`
                }}>
                    <Icon size={24} />
                </div>
                <span style={{ color: 'var(--accent-success)', fontSize: '0.875rem', fontWeight: 'bold' }}>+12%</span>
            </div>
            <span className="stat-value" style={{ position: 'relative', zIndex: 1, marginBottom: '0.25rem' }}>{value}</span>
            <span className="stat-label" style={{ position: 'relative', zIndex: 1 }}>{label}</span>

        </div>
    );
};
