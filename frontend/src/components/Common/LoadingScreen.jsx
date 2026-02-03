import React from 'react';

export const LoadingScreen = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div className="loader-container" style={{ position: 'relative', width: '100px', height: '100px' }}>
                {/* Outer Ring */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    border: '4px solid transparent',
                    borderTopColor: 'var(--accent-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1.5s linear infinite'
                }} />

                {/* Inner Ring */}
                <div style={{
                    position: 'absolute',
                    inset: '15px',
                    border: '4px solid transparent',
                    borderTopColor: 'var(--accent-secondary)',
                    borderRadius: '50%',
                    animation: 'spin 2s linear infinite reverse'
                }} />

                {/* Center Pulse */}
                <div style={{
                    position: 'absolute',
                    inset: '35px',
                    background: 'var(--accent-primary)',
                    borderRadius: '50%',
                    boxShadow: '0 0 20px var(--accent-primary)',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }} />
            </div>

            <h2 style={{
                marginTop: '2rem',
                fontSize: '1.5rem',
                letterSpacing: '2px',
                background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                INITIALIZING SYSTEM
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Secure Environment Check...</p>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};
