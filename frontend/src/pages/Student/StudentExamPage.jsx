import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { LoadingScreen } from '../../components/Common/LoadingScreen';

export const StudentExamPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [warning, setWarning] = useState(null);
    const [terminated, setTerminated] = useState(false);
    const [terminationReason, setTerminationReason] = useState("");

    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                // 1. Get Session Details
                const sessionRes = await fetch(`${API_BASE_URL}/api/sessions/${id}`);
                if (!sessionRes.ok) throw new Error("Session not found");
                const sessionData = await sessionRes.json();

                if (sessionData.question_paper_id) {
                    // 2. Get Question Paper
                    // Ideally we'd have a specific endpoint, but fetching all for now (MVP)
                    const papersRes = await fetch(`${API_BASE_URL}/api/question-papers`);
                    const papersData = await papersRes.json();
                    const paper = papersData.find(p => p.id === sessionData.question_paper_id);

                    if (paper) {
                        setQuestions(paper.questions || []);
                    }
                }
            } catch (err) {
                console.error("Error loading exam:", err);
            }
        };
        fetchExamData();
    }, [id]);

    const [answers, setAnswers] = useState({});

    // Start Camera & Monitoring
    useEffect(() => {
        let intervalId;
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setLoading(false);

                        // Start polling for analysis
                        intervalId = setInterval(captureAndAnalyze, 3000);
                    }
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Camera access required for exam.");
                setLoading(false); // Should probably block access
            }
        };
        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

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
                body: JSON.stringify({
                    session_id: id,
                    image: imageBase64
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'Terminated') {
                    setTerminated(true);
                    setTerminationReason(data.reason);
                } else if (data.status === 'Active' && data.face_count === 0) {
                    // Could implement soft warning here before termination logic handles it
                }
            }
        } catch (e) {
            console.error("Monitor error", e);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Exam Submitted Successfully!");
        navigate('/student');
    };

    // Termination Overlay - Takes precedence
    if (terminated) {
        return (
            <div className="animate-fade-in" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', border: '1px solid var(--accent-alert)', boxShadow: '0 0 50px rgba(220, 38, 38, 0.3)' }}>
                    <div style={{ color: 'var(--accent-alert)', marginBottom: '1rem' }}>
                        <AlertTriangle size={64} style={{ margin: '0 auto' }} />
                    </div>
                    <h2 style={{ color: 'var(--accent-alert)', marginBottom: '1rem', fontSize: '2rem' }}>SESSION TERMINATED</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                        The system has detected a critical violation of exam protocols.
                    </p>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Reason</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{terminationReason}</p>
                    </div>

                    <button className="btn btn-secondary" onClick={() => navigate('/student')} style={{ width: '100%', padding: '1rem' }}>Return to Dashboard</button>
                </div>
            </div>
        );
    }


    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)', position: 'relative' }}>

            {/* Loading Overlay */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 50,
                    backgroundColor: 'var(--bg-primary)', // Matches background to hide content
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <LoadingScreen />
                </div>
            )}

            {/* Main Exam Area */}
            <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>University Final Examination</h2>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Session ID: {id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <Clock size={18} /> Time Left: 58:20
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {questions.map((q, i) => (
                        <div key={q.id} style={{ marginBottom: '2rem' }}>
                            <p style={{ fontWeight: 500, marginBottom: '1rem' }}>{i + 1}. {q.text}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {q.options?.map(opt => (
                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name={`q${q.id}`}
                                            onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                                        />
                                        <span style={{ opacity: 0.8 }}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit Exam</button>
                </form>
            </div>

            {/* Sidebar Monitoring Preview */}
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--accent-error)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                            Live Proctoring
                        </h4>
                    </div>
                    <div style={{ height: '200px', background: '#000', position: 'relative' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                        />
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '4px 8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', fontSize: '0.7rem' }}>
                            Status: Active
                        </div>
                    </div>
                    <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <p style={{ margin: 0 }}>• Keep face within frame</p>
                        <p style={{ margin: 0 }}>• No other persons allowed</p>
                        <p style={{ margin: 0 }}>• Audio is being recorded</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
