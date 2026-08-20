import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MapPin, Monitor, CheckCircle, AlertCircle, Play, ShieldAlert } from 'lucide-react';

export const PreCheckOverlay = ({ onStart, examTitle }) => {
    const [tests, setTests] = useState({
        camera: { status: 'waiting', icon: <Camera />, label: 'Webcam feed' },
        microphone: { status: 'waiting', icon: <Mic />, label: 'Audio levels' },
        location: { status: 'waiting', icon: <MapPin />, label: 'GPS Geolocation' },
        system: { status: 'waiting', icon: <Monitor />, label: 'System Check' }
    });

    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    // 1. Browser/System Detection
    useEffect(() => {
        const checkSystem = () => {
            const browser = navigator.userAgent;
            const screen = `${window.screen.width}x${window.screen.height}`;
            const isSupported = !/Mobi|Android/i.test(browser);
            
            setTests(prev => ({
                ...prev,
                system: { 
                    ...prev.system, 
                    status: isSupported ? 'passed' : 'failed',
                    details: `${screen} | ${isSupported ? 'Desktop' : 'Mobile (Unsupported)'}`
                }
            }));
        };
        checkSystem();
    }, []);

    // 2. Hardware Tests (Camera & Audio)
    useEffect(() => {
        const startHardware = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 },
                    audio: true
                });

                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }

                // Camera Passed
                setTests(prev => ({
                    ...prev,
                    camera: { ...prev.camera, status: 'passed' }
                }));

                // Audio Setup
                setupAudioVisualizer(mediaStream);

            } catch (err) {
                console.error("Hardware access failed", err);
                setTests(prev => ({
                    ...prev,
                    camera: { ...prev.camera, status: 'failed' },
                    microphone: { ...prev.microphone, status: 'failed' }
                }));
            }
        };

        const setupAudioVisualizer = (mStream) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(mStream);
            source.connect(analyser);
            analyser.fftSize = 256;
            
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            let detectedAudio = false;

            const draw = () => {
                if (!canvasRef.current || !analyserRef.current) return;
                
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                analyserRef.current.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] / 2;
                    if (barHeight > 10) detectedAudio = true;

                    ctx.fillStyle = `rgb(16, 185, 129)`; // Emerald accent
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }

                if (detectedAudio) {
                    setTests(prev => ({
                        ...prev,
                        microphone: { ...prev.microphone, status: 'passed' }
                    }));
                }

                animationFrameRef.current = requestAnimationFrame(draw);
            };

            draw();
        };

        startHardware();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    // 3. Location Test
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setTests(prev => ({
                        ...prev,
                        location: { ...prev.location, status: 'passed', details: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}` }
                    }));
                },
                (err) => {
                    setTests(prev => ({
                        ...prev,
                        location: { ...prev.location, status: 'failed', details: 'Access Denied' }
                    }));
                }
            );
        } else {
            setTests(prev => ({
                ...prev,
                location: { ...prev.location, status: 'failed', details: 'Not supported' }
            }));
        }
    }, []);

    const allPassed = Object.values(tests).every(t => t.status === 'passed');
    const anyFailed = Object.values(tests).some(t => t.status === 'failed');

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', overflowY: 'auto'
        }}>
            <div className="glass-panel" style={{ 
                width: '100%', maxWidth: '1000px', 
                padding: '3rem', 
                display: 'grid', gridTemplateColumns: '1.2fr 1fr', 
                gap: '3rem' 
            }}>
                
                {/* Left Side: Preview Areas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 'auto', display: 'block', transform: 'scaleX(-1)' }} />
                        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tests.camera.status === 'passed' ? 'var(--accent-primary)' : 'var(--accent-alert)' }} />
                            {tests.camera.status === 'passed' ? 'LIVE FEED ACTIVE' : 'CAMERA STANDBY'}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>AUDIO SPECTRUM</span>
                            <span style={{ fontSize: '0.75rem', color: tests.microphone.status === 'passed' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                {tests.microphone.status === 'passed' ? 'INPUT DETECTED' : 'AWAITING INPUT...'}
                            </span>
                        </div>
                        <canvas ref={canvasRef} width="400" height="60" style={{ width: '100%', height: '60px' }} />
                    </div>
                </div>

                {/* Right Side: Status & Action */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>System Pre-Check</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{examTitle || 'Ready for Examination'}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                        {Object.entries(tests).map(([key, test]) => (
                            <div key={key} className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: test.status === 'failed' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                        color: test.status === 'passed' ? 'var(--accent-primary)' : test.status === 'failed' ? 'var(--accent-alert)' : 'var(--text-muted)',
                                        background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px'
                                    }}>
                                        {test.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{test.label}</div>
                                        {test.details && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{test.details}</div>}
                                    </div>
                                </div>
                                {test.status === 'passed' ? (
                                    <CheckCircle className="text-accent-primary" size={20} />
                                ) : test.status === 'failed' ? (
                                    <AlertCircle className="text-accent-alert" size={20} />
                                ) : (
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--text-muted)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Warning Box if failed */}
                    {anyFailed && (
                        <div style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            marginBottom: '1.5rem',
                            display: 'flex', gap: '12px', alignItems: 'flex-start'
                        }}>
                            <ShieldAlert className="text-accent-alert" size={20} style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                                Some tests failed. You can still proceed, but your session may be flagged for manual review if hardware is missing.
                            </p>
                        </div>
                    )}

                    <button 
                        className="btn btn-primary" 
                        onClick={() => onStart(stream)}
                        style={{ padding: '1.2rem', fontSize: '1.1rem', width: '100%', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2)' }}
                    >
                        <Play size={18} fill="currentColor" /> Start Examination
                    </button>
                    
                    <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        By starting, you consent to AI-monitored proctoring.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
