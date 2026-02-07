import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { Archive, Eye, AlertTriangle } from 'lucide-react';

export const MonitorView = ({ session, onBack }) => {
    const [logs, setLogs] = useState(session.alerts || []);
    const [score, setScore] = useState(session.trust_score);

    const videoRef = React.useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [alertState, setAlertState] = useState(false); // New state for red screen effect
    const [showTerminationModal, setShowTerminationModal] = useState(false);
    const [terminationReason, setTerminationReason] = useState("");

    React.useEffect(() => {
        let intervalId;
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setCameraActive(true);

                        // Start polling
                        intervalId = setInterval(captureAndAnalyze, 3000); // Check every 3 seconds
                    }
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };
        startCamera();

        return () => {
            // Cleanup
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const captureAndAnalyze = async () => {
        if (!videoRef.current) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            // Compress to jpg to save bandwidth
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.5);

            const res = await fetch(`${API_BASE_URL}/api/analyze_frame`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: session.id,
                    image: imageBase64
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'Terminated') {
                    setAlertState(true);
                    setScore(0);
                    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${data.reason}`, ...prev]);
                    setTerminationReason(data.reason);
                    setShowTerminationModal(true);
                    // Do NOT call onBack() automatically anymore, let user click the button
                }
            }
        } catch (e) {
            console.error("Analysis failed", e);
        }
    };

    const simulateCheat = () => {
        const alerts = [
            "Face not visible",
            "Multiple people detected",
            "Device detected",
            "Suspicious eye movement",
            "Tab switched"
        ];
        const newAlert = alerts[Math.floor(Math.random() * alerts.length)];
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${newAlert}`, ...prev]);
        setScore(prev => Math.max(0, prev - 10));

        // Trigger Red Screen Effect
        setAlertState(true);
        setTimeout(() => setAlertState(false), 2000); // Effect lasts 2 seconds

        // In real app, send to backend here
        fetch(`${API_BASE_URL}/api/alert?session_id=${session.id}&alert_message=${encodeURIComponent(newAlert)}`, {
            method: 'POST'
        }).catch(console.error);
    };

    // ... handleTerminate ...

    // ... handleTerminate ...

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', padding: '1rem' }}>
            {/* Custom Termination Modal Overlay */}
            {showTerminationModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s'
                }}>
                    <div className="glass-card" style={{
                        width: '500px',
                        padding: '3rem',
                        textAlign: 'center',
                        border: '1px solid var(--accent-alert)',
                        boxShadow: '0 0 50px rgba(239, 68, 68, 0.3)'
                    }}>
                        <div style={{
                            width: '80px', height: '80px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto',
                            color: 'var(--accent-alert)'
                        }}>
                            <AlertTriangle size={48} />
                        </div>
                        <h2 style={{ color: 'var(--accent-alert)', marginBottom: '1rem', fontSize: '2rem' }}>SESSION TERMINATED</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                            The system has detected a critical violation of exam protocols.
                        </p>

                        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.7, marginBottom: '4px' }}>Reason</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{terminationReason}</div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
                            onClick={onBack}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <button onClick={onBack} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Archive size={16} /> Back to Dashboard
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className={`live-dot ${cameraActive ? '' : 'offline'}`} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cameraActive ? 'LIVE MONITORING' : 'CONNECTING...'}</span>
                    </div>
                </div>
            </div>

            <div className="monitor-grid">
                <style>{`
                    .monitor-grid {
                        display: grid;
                        grid-template-columns: 2fr 1fr;
                        gap: 1.5rem;
                        height: calc(100% - 60px);
                    }
                    @media (max-width: 900px) {
                        .monitor-grid {
                            grid-template-columns: 1fr;
                            grid-template-rows: 1fr auto;
                            height: auto;
                        }
                    }
                    .glass-panel {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        backdrop-filter: blur(10px);
                        border-radius: 16px;
                    }
                `}</style>


                {/* Left Column: Video Feed */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>

                    {/* Red Screen Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(239, 68, 68, 0.4)',
                        zIndex: 20,
                        display: alertState ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                        border: '4px solid var(--accent-alert)'
                    }}>
                        <div style={{
                            background: 'rgba(0,0,0,0.8)',
                            color: 'var(--accent-alert)',
                            padding: '1rem 2rem',
                            fontWeight: 'bold',
                            fontSize: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--accent-alert)',
                            display: 'flex', alignItems: 'center', gap: '1rem'
                        }}>
                            <AlertTriangle size={32} /> ANOMALY DETECTED
                        </div>
                    </div>

                    {/* Video Element */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#000',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)', // Mirror effect
                                opacity: cameraActive ? 1 : 0.5
                            }}
                        />

                        {/* Fallback pattern if camera fails or loading */}
                        {!cameraActive && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'linear-gradient(45deg, #0f172a, #1e293b)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                <div className="spinner" />
                                <p style={{ color: 'var(--text-secondary)' }}>Initializing Secure Feed...</p>
                            </div>
                        )}

                        {/* Grid Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                            backgroundSize: '50px 50px',
                            pointerEvents: 'none'
                        }} />

                        {/* HUD overlay elements */}
                        <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '10px' }}>
                            <div style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-success)' }}>
                                REC ●
                            </div>
                            <div style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                720p HD
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analysis & Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>

                    {/* Score Card */}
                    <div className="glass-panel" style={{ flex: '0 0 auto', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', fontWeight: 600 }}>Trust Score</h3>
                        <div style={{
                            fontSize: '4.5rem',
                            fontWeight: '800',
                            color: score > 70 ? 'var(--accent-success)' : score > 40 ? '#fbbf24' : 'var(--accent-alert)',
                            lineHeight: 1,
                            textShadow: `0 0 30px ${score > 70 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}>
                            {score}%
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: score > 70 ? 'var(--accent-success)' : 'var(--accent-alert)' }}>
                            {score > 70 ? 'Session Secure' : 'High Risk Detected'}
                        </div>

                        {/* Mini Graph Placeholder */}
                        <div style={{ display: 'flex', alignItems: 'end', height: '30px', gap: '6px', justifyContent: 'center', marginTop: '1.5rem', opacity: 0.3 }}>
                            {[40, 60, 50, 70, 80, 85, 60, 90, score].map((h, i) => (
                                <div key={i} style={{
                                    width: '4px',
                                    height: `${h / 3}px`,
                                    background: 'white',
                                    borderRadius: '2px'
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Activity Log</h3>
                            <button onClick={simulateCheat} style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}>Test Alert</button>
                        </div>

                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            paddingRight: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            {logs.length === 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', opacity: 0.5 }}>
                                    <Eye size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                    <p style={{ fontSize: '0.9rem' }}>Monitoring started...</p>
                                </div>
                            )}

                            {logs.map((log, i) => (
                                <div className="animate-fade-in" key={i} style={{
                                    padding: '10px 14px',
                                    borderLeft: '3px solid var(--accent-alert)',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.05), transparent)',
                                    borderRadius: '0 8px 8px 0',
                                }}>
                                    <AlertTriangle size={16} color="var(--accent-alert)" />
                                    <div>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '500', marginRight: '8px' }}>{log.split(']')[1]}</span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{log.split(']')[0].replace('[', '')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
