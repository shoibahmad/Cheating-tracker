import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { AlertTriangle, Clock, CheckCircle, Smartphone } from 'lucide-react';
import { LoadingScreen } from '../../components/Common/LoadingScreen';

import { db } from '../../firebase';
import { faceMeshService } from '../../services/FaceMeshService';

export const StudentExamPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const violationProcessed = useRef(false);
    const monitoringActive = useRef(false); // Grace period control
    const [loading, setLoading] = useState(true);
    const [terminated, setTerminated] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false); // Custom Confirm Modal

    const [terminationReason, setTerminationReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [violationReason, setViolationReason] = useState(null); // New state for result display

    // Exam State
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [examTitle, setExamTitle] = useState(""); // Add Title State
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

                // Set Title
                setExamTitle(sessionData.exam_title || sessionData.examTitle || sessionData.exam_type || "Online Examination");

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
                        if (!sessionData.examTitle) setExamTitle(paperData.title || sessionData.exam_type); // Fallback to paper title
                    }
                } else if (sessionData.question_paper_id) {
                    const paperRes = await fetch(`${API_BASE_URL}/api/question-papers/${sessionData.question_paper_id}`);
                    if (paperRes.ok) {
                        const paperData = await paperRes.json();
                        setQuestions(paperData.questions || []);
                        if (!sessionData.examTitle) setExamTitle(paperData.title || sessionData.exam_type);
                    }
                }

                // Restore Progress
                if (sessionData.answers) {
                    setAnswers(sessionData.answers);
                }

                // Ensure loading is stopped
                setLoading(false);
            } catch (err) {
                console.error("Error loading exam:", err);
                setLoading(false); // Enable error UI or fallback
            }
        };
        fetchExamData();
    }, [id]);

    // --- 2. Browser Security & MediaPipe Monitoring ---
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);

    // Browser Security Listeners

    // --- 4. Submission (Moved Up) ---
    const handleAnswerChange = (qId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
    };

    const toggleMarkForReview = (qId) => {
        setMarkedForReview(prev => ({
            ...prev,
            [qId]: !prev[qId]
        }));
    };

    const clearResponse = (qId) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[qId];
            return newAnswers;
        });
    };

    const confirmSubmit = () => {
        executeSubmit(false);
    };

    const executeSubmit = async (isForced = false, reason = "") => {
        // 1. Disable Monitoring IMMEDIATELY to prevent "Exit Fullscreen" violation during teardown
        monitoringActive.current = false;
        setShowSubmitModal(false);

        setSubmitting(true);

        // Artificial delay for UX only if normal submit
        if (!isForced) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

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
                if (isForced) {
                    setViolationReason(reason);
                }
            } else {
                if (!isForced) addWarning("Submission failed. Please try again.");
            }
        } catch (err) {
            if (!isForced) addWarning("Error connecting to server.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setShowSubmitModal(true);
    };

    const reportViolation = async (reason) => {
        try {
            await fetch(`${API_BASE_URL}/api/sessions/${id}/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reason, timestamp: new Date().toISOString() })
            });
        } catch (e) {
            console.error("Failed to report violation", e);
        }
    };

    const handleViolation = (reason) => {
        // Prevent multiple triggerings using Ref (safe against stale closures)
        if (violationProcessed.current) return;

        // Wait! Check if monitoring is active
        if (!monitoringActive.current) return;

        violationProcessed.current = true;

        // Check if we already have a violation reason to avoid overwriting the first one
        setViolationReason(prev => prev || reason);

        reportViolation(reason);
        reportViolation(reason);
        executeSubmit(true, reason); // Force submit
    };
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!monitoringActive.current) return;
            if (document.hidden) {
                setTabSwitches(prev => prev + 1);
                handleViolation("Tab Switching detected");
            }
        };

        const handleFullscreenChange = () => {
            // If we are NOT monitoring yet, don't punish for fullscreen changes
            // (This happens during setup)
            if (!monitoringActive.current) return;

            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                handleViolation("Exited Fullscreen Mode");
            }
        };

        // ... (Keep copy/paste preventions as warnings, as they are blocked actions, not necessarily state violations)
        const preventCopy = (e) => {
            e.preventDefault();
            addWarning("Action Prohibited: Copying content is not allowed.");
        };

        const preventPaste = (e) => {
            e.preventDefault();
            addWarning("Action Prohibited: Pasting content is not allowed.");
        };

        const preventContextMenu = (e) => {
            e.preventDefault();
            addWarning("Action Prohibited: Right-click menu is disabled.");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("copy", preventCopy);
        document.addEventListener("paste", preventPaste);
        document.addEventListener("contextmenu", preventContextMenu);

        // Force Fullscreen on Mount (or require user action)
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("copy", preventCopy);
            document.removeEventListener("paste", preventPaste);
            document.removeEventListener("contextmenu", preventContextMenu);
        };
    }, []);

    // --- Admin Message Polling ---
    useEffect(() => {
        if (loading || result || terminated) return;

        const pollStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/sessions/${id}/status`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.latest_message && !data.is_message_read) {
                        toast((t) => (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <AlertTriangle size={24} color="var(--accent-warning)" />
                                <div>
                                    <b>Proctor Message:</b>
                                    <p style={{ margin: 0 }}>{data.latest_message}</p>
                                </div>
                                <button onClick={() => {
                                    toast.dismiss(t.id);
                                    // Mark as read
                                    fetch(`${API_BASE_URL}/api/sessions/${id}/message/read`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    });
                                }} style={{ marginLeft: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                                    OK
                                </button>
                            </div>
                        ), { duration: 10000, position: 'top-center', style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--accent-warning)', minWidth: '300px' } });
                    }
                }
            } catch (err) {
                console.error("Status poll error", err);
            }
        };

        const interval = setInterval(pollStatus, 5000);
        return () => clearInterval(interval);
    }, [id, loading, result, terminated]);


    // MediaPipe Integration

    // MediaPipe Integration
    const requestRef = useRef(null);

    useEffect(() => {
        if (loading || terminated) return;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: false
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for video to be ready
                    videoRef.current.onloadedmetadata = async () => {
                        try {
                            await videoRef.current.play();

                            // Initialize AI
                            await faceMeshService.initialize((analysis) => {
                                // Check grace period
                                if (!monitoringActive.current) return;

                                if (analysis.status === 'WARNING') {
                                    handleViolation(`Proctoring Flag: ${analysis.message}`);
                                } else if (analysis.status === 'NO_FACE') {
                                    handleViolation("Proctoring Flag: No Face Detected");
                                }
                            });

                            // Start Processing Loop
                            const processFrame = async () => {
                                if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                                    await faceMeshService.send(videoRef.current);
                                }
                                requestRef.current = requestAnimationFrame(processFrame);
                            };
                            requestRef.current = requestAnimationFrame(processFrame);

                        } catch (e) {
                            console.error("Error playing video or init AI", e);
                        }
                    };
                }
            } catch (err) {
                console.error("Camera Access Error:", err);
                alert("Camera access is required for this exam. Please allow camera access.");
            }
        };

        startCamera();

        return () => {
            console.log("Exam Page Logic: Stopping Camera & FaceMesh");
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            faceMeshService.stop();
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [loading, terminated, result]); // Added result to dependencies to trigger stop on submit

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setIsFullscreen(true);
                // Enable monitoring after a short grace period (3 seconds)
                // to allow the browser to settle and user to get ready
                setTimeout(() => {
                    monitoringActive.current = true;
                    addWarning("Exam Started. Monitoring Active.");
                }, 3000);
            }).catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
    };





    // --- 3. Timer Logic (30 mins) ---
    useEffect(() => {
        if (loading || result || terminated) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    clearInterval(timer);
                    executeSubmit(true, "Time Expired"); // Auto-submit
                    return 0;
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

    // --- Navigation & Status State ---
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [markedForReview, setMarkedForReview] = useState({});
    const [visited, setVisited] = useState({});

    // Update visited status when question changes
    useEffect(() => {
        if (!loading && !result && !terminated && questions.length > 0) {
            setVisited(prev => ({ ...prev, [currentQuestionIndex]: true }));
        }
    }, [currentQuestionIndex, loading, result, terminated, questions]);



    // --- Helper for Question Status State ---
    const getQuestionStatus = (q, index) => {
        const qId = q.id || index;
        const isAnswered = answers[qId] !== undefined && answers[qId] !== '';
        const isMarked = markedForReview[qId];
        const isCurrent = currentQuestionIndex === index;
        const isVisited = visited[index];

        if (isCurrent) return 'current';
        if (isMarked) return 'marked';
        if (isAnswered) return 'answered';
        if (isVisited) return 'unattended';
        return 'not-visited';
    };

    // --- Renders ---

    // 1. Fullscreen / Security Check
    if (!isFullscreen && !terminated && !result && !loading) {
        return (
            <div className="animate-fade-in" style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
            }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Secure Exam Environment</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                        To proceed, you must enter fullscreen mode. <br />
                        <b>Note:</b> Exiting fullscreen, switching tabs, or looking away will be flagged as violations.
                    </p>
                    <button className="btn btn-primary" onClick={enterFullscreen} style={{ padding: '1rem 2rem' }}>
                        Enter Fullscreen & Start Exam
                    </button>
                </div>
            </div>
        );
    }

    // 2. Terminated State
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

    // 2. Result State
    if (result) {
        return (
            <div className="animate-fade-in" style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                    {violationReason ? (
                        <div style={{ marginBottom: '2rem', border: '1px solid var(--accent-alert)', padding: '1rem', borderRadius: '8px', background: 'rgba(255,0,0,0.1)' }}>
                            <AlertTriangle size={48} style={{ color: 'var(--accent-alert)', margin: '0 auto 1rem' }} />
                            <h2 style={{ color: 'var(--accent-alert)', marginBottom: '0.5rem' }}>Exam Terminated</h2>
                            <p>Violation: <b>{violationReason}</b></p>
                        </div>
                    ) : (
                        <CheckCircle size={64} style={{ color: 'var(--accent-success)', margin: '0 auto 1.5rem' }} />
                    )}

                    <h2 style={{ marginBottom: '1rem' }}>Exam Completed</h2>
                    <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>Score: <b>{result.score} / {result.total}</b> ({result.percentage}%)</p>

                    {/* Basic AI Feedback Summary if available, full report button recommended */}
                    <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Detailed analysis and AI insights are available in your reports.</p>
                        <button className="btn btn-secondary" onClick={() => navigate('/student/reports')} style={{ width: '100%', fontSize: '0.9rem' }}>View Detailed Report</button>
                    </div>

                    <button className="btn btn-primary" onClick={() => navigate('/student')} style={{ width: '100%', padding: '1rem' }}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    // 3. Pre-Exam / Security Check State
    if (!isFullscreen && !terminated && !loading) {
        return (
            <div className="animate-fade-in" style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
            }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Secure Exam Environment</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                        To proceed, you must enter fullscreen mode. <br />
                        <b>Note:</b> Exiting fullscreen, switching tabs, or looking away will be flagged as violations.
                    </p>
                    <button className="btn btn-primary" onClick={enterFullscreen} style={{ padding: '1rem 2rem' }}>
                        Enter Fullscreen & Start Exam
                    </button>
                </div>
            </div>
        );
    }

    // 4. Loading State
    if (loading) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <LoadingScreen />
            </div>
        );
    }

    // 5. Main Exam UI (TCS iON Style)
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return <div>Loading Question...</div>;

    const qId = currentQ.id || currentQuestionIndex;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Top Header */}
            <div style={{
                height: '60px',
                background: 'rgba(0,0,0,0.3)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem'
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{examTitle || "University Online Examination"}</div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Time Left:</span>
                        <span style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: timeLeft < 300 ? 'var(--accent-alert)' : 'white',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '4px 12px',
                            borderRadius: '4px'
                        }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sub-Header / Guidelines Banner */}
            <div style={{
                background: 'var(--accent-primary)',
                color: 'white',
                padding: '0.5rem 2rem',
                fontSize: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>Ensure your face is visible at all times. Do not switch tabs.</span>
                <span style={{ opacity: 0.8 }}>Session ID: {id}</span>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Left: Question Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', overflowY: 'auto' }}>

                    {/* New Legend Placement: Above Question */}
                    <div style={{
                        padding: '0.8rem 1.2rem',
                        display: 'flex',
                        gap: '20px',
                        fontSize: '0.85rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        border: '1px solid var(--glass-border)',
                        width: 'fit-content'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'var(--accent-success)' }}></div> Answered
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '2px solid var(--accent-success)', background: 'transparent' }}></div> Marked for Review
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'var(--accent-alert)' }}></div> Not Attended
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '2px solid var(--accent-primary)', background: 'rgba(255,255,255,0.1)' }}></div> Current
                        </div>
                    </div>

                    {/* Question Header */}
                    <div style={{
                        marginBottom: '1.5rem',
                        borderBottom: '1px solid var(--glass-border)',
                        paddingBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0 }}>Question {currentQuestionIndex + 1}</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                +1.0 Marks
                            </span>
                            <span style={{ fontSize: '0.9rem', background: 'rgba(255,0,0,0.1)', padding: '4px 8px', borderRadius: '4px', color: '#ffaaaa' }}>
                                -0.0 Neg
                            </span>
                        </div>
                    </div>

                    {/* Question Text */}
                    <div style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>
                        {currentQ.text}
                    </div>

                    {/* Options / Input */}
                    <div style={{ marginBottom: '2rem' }}>
                        {currentQ.type === 'descriptive' ? (
                            <textarea
                                value={answers[qId] || ''}
                                onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                className="glass-input"
                                rows={8}
                                placeholder="Type your answer here..."
                                style={{
                                    width: '100%',
                                    resize: 'vertical',
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '1rem',
                                    lineHeight: '1.6'
                                }}
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentQ.options?.map((opt, optIdx) => (
                                    <label key={optIdx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        cursor: 'pointer',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        background: answers[qId] === optIdx ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: answers[qId] === optIdx ? '1px solid var(--accent-success)' : '1px solid rgba(255,255,255,0.1)',
                                        transition: 'all 0.2s ease',
                                    }}>
                                        <input
                                            type="radio"
                                            name={`q_${qId}`}
                                            onChange={() => handleAnswerChange(qId, optIdx)}
                                            checked={answers[qId] === optIdx}
                                            style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontSize: '1rem' }}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => clearResponse(qId)}
                                disabled={answers[qId] === undefined}
                            >
                                Clear Response
                            </button>
                            <button
                                className="btn"
                                style={{
                                    background: markedForReview[qId] ? 'var(--accent-warning)' : 'rgba(255,255,255,0.1)',
                                    color: markedForReview[qId] ? 'black' : 'white'
                                }}
                                onClick={() => toggleMarkForReview(qId)}
                            >
                                {markedForReview[qId] ? 'Unmark Review' : 'Mark for Review'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                                Save & Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar / Palette */}
                <div style={{
                    width: '320px',
                    background: 'rgba(0,0,0,0.2)',
                    borderLeft: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* User Profile / Cam */}
                    <div style={{
                        height: '180px',
                        background: '#000',
                        position: 'relative',
                        borderBottom: '1px solid var(--glass-border)'
                    }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                        <div style={{ position: 'absolute', bottom: '5px', left: '5px', fontSize: '0.7rem', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                            Proctoring Active
                        </div>
                    </div>

                    {/* Legend (Removed from here as requested, moved above question area) */}

                    {/* Question Grid */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', opacity: 0.8 }}>Questions Overview</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                            {questions.map((q, idx) => {
                                const status = getQuestionStatus(q, idx);

                                let bg = 'rgba(255,255,255,0.05)';
                                let border = '1px solid transparent';
                                let color = 'var(--text-secondary)';

                                if (status === 'answered') {
                                    bg = 'var(--accent-success)';
                                    color = '#fff';
                                } else if (status === 'marked') {
                                    border = '2px solid var(--accent-success)';
                                    bg = 'transparent';
                                    color = 'var(--text-primary)';
                                } else if (status === 'unattended') {
                                    bg = 'var(--accent-alert)';
                                    color = '#fff';
                                }

                                if (status === 'current') {
                                    border = '2px solid var(--accent-primary)';
                                    color = 'white';
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '1',
                                            borderRadius: '6px',
                                            background: bg,
                                            border: border,
                                            color: color,
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Button Area */}
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
                        <button
                            onClick={handleSubmit}
                            className="btn"
                            style={{
                                width: '100%',
                                background: 'var(--accent-success)',
                                color: 'white',
                                padding: '0.8rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Submit Exam
                        </button>
                    </div>

                </div>
            </div>

            {/* Submitting Overlay */}
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

            {/* Custom Submit Confirmation Modal */}
            {showSubmitModal && (
                <div className="animate-fade-in" style={{
                    position: 'fixed', inset: 0, zIndex: 10000,
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>Submit Exam?</h3>
                        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
                            Are you sure you want to finish the exam? You cannot change your answers after submission.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowSubmitModal(false)}
                                style={{ minWidth: '100px' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={confirmSubmit}
                                style={{ minWidth: '100px', background: 'var(--accent-success)' }}
                            >
                                Confirm Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
