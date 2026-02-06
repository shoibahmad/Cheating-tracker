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

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)' }}>
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

            <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                ← Back to Dashboard
            </button>

            <div className="monitor-grid">
                <style>{`
                    .monitor-grid {
                        display: grid;
                        grid-template-columns: 2fr 1fr;
                        gap: 1.5rem;
                        height: 100%;
                    }
                    @media (max-width: 768px) {
                        .monitor-grid {
                            grid-template-columns: 1fr;
                            grid-template-rows: 1fr auto;
                            height: auto;
                        }
                    }
                `}</style>


                {/* Left Column: Video Feed */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    <div className="live-feed" style={{ flex: 1, borderRadius: 0, border: 'none', position: 'relative' }}>

                        {/* Red Screen Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(239, 68, 68, 0.4)',
                            zIndex: 20,
                            display: alertState ? 'flex' : 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(2px)',
                            border: '5px solid red'
                        }}>
                            <div style={{ background: 'red', color: 'white', padding: '1rem 2rem', fontWeight: 'bold', fontSize: '1.5rem', borderRadius: '8px' }}>
                                ANOMALY DETECTED
                            </div>
                        </div>

                        <div className="live-badge" style={{ zIndex: 10 }}>
                            <div className={`live-dot ${cameraActive ? '' : 'offline'}`} /> {cameraActive ? 'LIVE' : 'CONNECTING...'}
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
                                    transform: 'scaleX(-1)' // Mirror effect
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
                                    justifyContent: 'center'
                                }}>
                                    <p style={{ color: 'white' }}>Requesting Camera Access...</p>
                                </div>
                            )}

                            {/* Grid Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                                pointerEvents: 'none'
                            }} />
                        </div>

                        {/* Face Box Overlay Simulation (Keep purely decorative for now, or could map to face-api if added) */}
                        <div style={{
                            position: 'absolute',
                            top: '20%',
                            left: '30%',
                            width: '40%',
                            height: '50%',
                            border: `2px solid ${score > 50 ? 'var(--accent-success)' : 'var(--accent-alert)'}`,
                            borderRadius: '8px',
                            transition: 'border-color 0.3s',
                            boxShadow: score > 50 ? '0 0 20px rgba(16, 185, 129, 0.2)' : '0 0 20px rgba(239, 68, 68, 0.2)',
                            pointerEvents: 'none'
                        }}>
                            {/* ... (labels) ... */}
                            <div style={{
                                position: 'absolute',
                                top: '-25px',
                                left: '0',
                                background: score > 50 ? 'var(--accent-success)' : 'var(--accent-alert)',
                                color: 'white',
                                padding: '2px 8px',
                                fontSize: '0.75rem',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {score > 50 ? 'Verified Subject' : 'Suspicious Activity'}
                            </div>
                        </div>
                    </div>

                    {/* Scanning Line */}
                    <div style={{
                        width: '100%',
                        height: '2px',
                        background: score > 50 ? 'var(--accent-success)' : 'var(--accent-alert)',
                        position: 'absolute',
                        top: '0',
                        animation: 'scan 3s ease-in-out infinite',
                        opacity: 0.7,
                        boxShadow: `0 0 10px ${score > 50 ? 'var(--accent-success)' : 'var(--accent-alert)'}`
                    }} />
                    <style>{`
                   @keyframes scan {
                       0% { top: 0%; opacity: 0; }
                       10% { opacity: 1; }
                       90% { opacity: 1; }
                       100% { top: 100%; opacity: 0; }
                   }
               `}</style>
                </div>
            </div>

            {/* Right Column: Analysis & Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>

                {/* Score Card */}
                <div className="glass-card" style={{ flex: '0 0 auto', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Real-time Trust Score</h3>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: '800',
                        color: score > 70 ? 'var(--accent-success)' : score > 40 ? '#fbbf24' : 'var(--accent-alert)',
                        lineHeight: 1
                    }}>
                        {score}%
                    </div>

                    {/* Mini Graph Placeholder */}
                    <div style={{ display: 'flex', alignItems: 'end', height: '40px', gap: '4px', justifyContent: 'center', marginTop: '1rem', opacity: 0.5 }}>
                        {[40, 60, 50, 70, 80, score, score - 5, score + 5, score].map((h, i) => (
                            <div key={i} style={{
                                width: '6px',
                                height: `${h / 2}px`,
                                background: score > 50 ? 'var(--accent-success)' : 'var(--accent-alert)',
                                borderRadius: '3px'
                            }} />
                        ))}
                    </div>
                </div>

                {/* Logs */}
                <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Alert Log</h3>
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        paddingRight: '10px'
                    }}>
                        {logs.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', opacity: 0.6 }}>
                                <Archive size={40} style={{ marginBottom: '1rem' }} />
                                <p>No anomalies detected yet.</p>
                            </div>
                        )}

                        {logs.map((log, i) => (
                            <div className="animate-fade-in" key={i} style={{
                                padding: '12px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '12px',
                                background: 'rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                marginBottom: '8px'
                            }}>
                                <div style={{
                                    marginTop: '2px',
                                    padding: '4px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '4px',
                                    color: 'var(--accent-alert)'
                                }}>
                                    <AlertTriangle size={14} />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{log.split(']')[1]}</div>
                                    <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.7 }}>{log.split(']')[0].replace('[', '')}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
};
