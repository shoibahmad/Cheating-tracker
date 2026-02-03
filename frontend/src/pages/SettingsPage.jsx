import React, { useState } from 'react';
import { Bell, Lock, User, Monitor, Save } from 'lucide-react';

export const SettingsPage = () => {
    const [toggles, setToggles] = useState(() => {
        const saved = localStorage.getItem('appSettings');
        return saved ? JSON.parse(saved) : {
            notifications: true,
            emailReports: false,
            strictMode: true,
            audioMonitoring: true,
            screenRecording: true
        };
    });

    const handleToggle = (key) => setToggles(p => ({ ...p, [key]: !p[key] }));

    const saveSettings = () => {
        localStorage.setItem('appSettings', JSON.stringify(toggles));
        alert('Settings saved successfully!');
    };

    const Toggle = ({ active, onClick }) => (
        <div
            onClick={onClick}
            style={{
                width: '50px',
                height: '26px',
                background: active ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                borderRadius: '13px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s'
            }}
        >
            <div style={{
                width: '20px',
                height: '20px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: active ? '27px' : '3px',
                transition: 'left 0.3s'
            }} />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>System Settings</h2>
                <p>Configure global monitoring parameters and account preferences.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 md:grid-cols-1" style={{ gap: '2rem' }}>
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Lock size={24} style={{ color: 'var(--accent-secondary)' }} />
                        <h3>Monitoring Sensitivity</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>Strict Mode</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Flag minor deviations immediately</div>
                            </div>
                            <Toggle active={toggles.strictMode} onClick={() => handleToggle('strictMode')} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>Audio Analysis</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Detect background speech</div>
                            </div>
                            <Toggle active={toggles.audioMonitoring} onClick={() => handleToggle('audioMonitoring')} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>Full Screen Recording</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Archive session video for review</div>
                            </div>
                            <Toggle active={toggles.screenRecording} onClick={() => handleToggle('screenRecording')} />
                        </div>
                    </div>
                </div>

                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Bell size={24} style={{ color: 'var(--accent-primary)' }} />
                        <h3>Notifications</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>Real-time Alerts</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Push notifications to dashboard</div>
                            </div>
                            <Toggle active={toggles.notifications} onClick={() => handleToggle('notifications')} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>Email Reports</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Daily summary via email</div>
                            </div>
                            <Toggle active={toggles.emailReports} onClick={() => handleToggle('emailReports')} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={saveSettings}><Save size={18} style={{ marginRight: '8px' }} /> Save Changes</button>
            </div>
        </div>
    );
};
