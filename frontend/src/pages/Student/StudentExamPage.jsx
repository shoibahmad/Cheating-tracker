import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { AlertTriangle, Clock, CheckCircle, Smartphone } from 'lucide-react';
import { LoadingScreen } from '../../components/Common/LoadingScreen';

import { db } from '../../firebase';

export const StudentExamPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [terminated, setTerminated] = useState(false);
    const [terminationReason, setTerminationReason] = useState("");

    // Exam State
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

    // Monitor State
    // const [violationDuration, setViolationDuration] = useState(0); // Removed for strict mode
    // const [lastViolation, setLastViolation] = useState(""); // Removed via strict mode

    // --- 0. Real-time Session Listener (Polling Mode) ---
    useEffect(() => {
        if (!id) return;

        const checkStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/sessions/${id}/status`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'Terminated' && !terminated) {
                        setTerminated(true);
                        setTerminationReason(data.termination_reason || "Exam terminated by administrator.");
                    }
                }
            } catch (err) {
                console.error("Status check failed", err);
            }
        };

        const interval = setInterval(checkStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [id, terminated]);

    // --- 1. Fetch Exam Data ---
    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const sessionRes = await fetch(`${API_BASE_URL}/api/sessions/${id}`);
                if (!sessionRes.ok) throw new Error("Session not found");
                const sessionData = await sessionRes.json();

                // Check for completion/termination immediately
                if (sessionData.status === 'Completed') {
                    setResult({
                        score: sessionData.score,
                        total: sessionData.total_questions || sessionData.questions?.length || 0,
                        percentage: sessionData.percentage
                    });
                    setLoading(false);
                    return;
                }
                if (sessionData.status === 'Terminated') {
                    setTerminated(true);
                    setTerminationReason(sessionData.termination_reason || "Exam terminated.");
                    setLoading(false);
                    return;
                }

                // Load Questions
                if (sessionData.questions && sessionData.questions.length > 0) {
                    setQuestions(sessionData.questions);
                } else if (sessionData.examId) {
                    const paperRes = await fetch(`${API_BASE_URL}/api/question-papers/${sessionData.examId}`);
                    if (paperRes.ok) {
                        const paperData = await paperRes.json();
                        setQuestions(paperData.questions || []);
                    }
                } else if (sessionData.question_paper_id) {
                    const paperRes = await fetch(`${API_BASE_URL}/api/question-papers/${sessionData.question_paper_id}`);
                    if (paperRes.ok) {
                        const paperData = await paperRes.json();
                        setQuestions(paperData.questions || []);
                    }
                }

                // Restore Progress
                if (sessionData.answers) {
                    setAnswers(sessionData.answers);
                }
            } catch (err) {
                console.error("Error loading exam:", err);
            }
        };
        fetchExamData();
    }, [id]);

    // --- 2. Camera & Monitoring ---
    useEffect(() => {
        let intervalId;
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setLoading(false);
                        intervalId = setInterval(captureAndAnalyze, 1000);
                    }
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Camera access is required. Please allow access and refresh.");
                setLoading(false);
            }
        };
        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (intervalId) clearInterval(intervalId);
        };
    }, [terminated]);

    const captureAndAnalyze = async () => {
        if (!videoRef.current || terminated) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.5);

            const res = await fetch(`${API_BASE_URL}/api/analyze_frame`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: id, image: imageBase64 })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'Terminated') {
                    setTerminated(true);
                    setTerminationReason(data.reason);
                }
            }
        } catch (e) {
            console.error("Monitor error", e);
        }
    };



    // --- 4. Timer Logic (30 mins) ---
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (loading || result || terminated) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, result, terminated]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- 5. Submission ---
    const handleAnswerChange = (qId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);

        // Artificial delay for UX
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const res = await fetch(`${API_BASE_URL}/api/sessions/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ answers })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (err) {
            alert("Error connecting to server.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Renders ---

    if (terminated) {
        return (
            <div className="animate-fade-in" style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
            }}>
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', border: '1px solid var(--accent-alert)' }}>
                    <div style={{ color: 'var(--accent-alert)', marginBottom: '1rem' }}><AlertTriangle size={64} style={{ margin: '0 auto' }} /></div>
                    <h2 style={{ color: 'var(--accent-alert)', marginBottom: '1rem', fontSize: '2rem' }}>SESSION TERMINATED</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>The system has detected a critical violation.</p>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>REASON</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{terminationReason}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/student')} style={{ width: '100%', padding: '1rem' }}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="animate-fade-in" style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px' }}>
                    <CheckCircle size={64} style={{ color: 'var(--accent-success)', margin: '0 auto 1.5rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>Exam Completed</h2>
                    <p style={{ marginBottom: '2rem' }}>Score: {result.score} / {result.total} ({result.percentage}%)</p>
                    <button className="btn btn-primary" onClick={() => navigate('/student')} style={{ width: '100%', padding: '1rem' }}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)', position: 'relative' }}>

            {/* Loading / Submitting Overlay */}
            {(loading || submitting) && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                }}>
                    <LoadingScreen />
                    {submitting && <p style={{ marginTop: '2rem', color: 'var(--accent-primary)' }}>Submitting Exam...</p>}
                </div>
            )}



            {/* Main Exam Area */}
            <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>University Final Examination</h2>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Session ID: {id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 'bold', color: timeLeft < 300 ? 'var(--accent-alert)' : 'var(--text-primary)' }}>
                        <Clock size={20} /> {formatTime(timeLeft)}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {questions.length === 0 && !loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>No questions loaded.</div>
                    ) : (
                        questions.map((q, i) => (
                            <div key={q.id} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <p style={{ fontWeight: 500, marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                    <span style={{ color: 'var(--accent-primary)', marginRight: '8px', fontWeight: 'bold' }}>Q{i + 1}.</span>
                                    {q.text}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {q.options?.map((opt, optIdx) => (
                                        <label key={optIdx} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start', // Better for wrapping text
                                            gap: '16px',
                                            cursor: 'pointer',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            background: answers[q.id || i] === optIdx ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                                            border: answers[q.id || i] === optIdx ? '1px solid var(--accent-success)' : '1px solid rgba(255,255,255,0.1)',
                                            transition: 'all 0.2s ease',
                                        }}>
                                            <input
                                                type="radio"
                                                name={`q_${q.id || i}`}
                                                onChange={() => handleAnswerChange(q.id || i, optIdx)}
                                                checked={answers[q.id || i] === optIdx}
                                                style={{ marginTop: '4px', accentColor: 'var(--accent-primary)', width: '16px', height: '16px', flexShrink: 0 }}
                                            />
                                            <span style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.5' }}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}

                    {questions.length > 0 && (
                        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                                Submit Final Exam
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Sidebar Monitoring */}
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--accent-error)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                            Live Proctoring
                        </h4>
                    </div>
                    <div style={{ height: '210px', background: '#000', position: 'relative' }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '4px 8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', fontSize: '0.7rem' }}>Status: Monitoring</div>
                    </div>
                    <div style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}><CheckCircle size={14} color="var(--accent-success)" /> Face visible at all times</div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}><CheckCircle size={14} color="var(--accent-success)" /> No electronic devices</div>
                        <div style={{ display: 'flex', gap: '8px' }}><CheckCircle size={14} color="var(--accent-success)" /> No unauthorized persons</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
