import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';


import { useNavigate } from 'react-router-dom';
import { Eye, AlertTriangle, Shield, User, XCircle, Search } from 'lucide-react';
import { LoadingScreen } from '../../components/Common/LoadingScreen';

export const LiveFeedPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();



    // 2. Real-time Polling
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/sessions`);
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data);
                }
            } catch (err) {
                console.error("Error fetching sessions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
        const interval = setInterval(fetchSessions, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const [confirmModal, setConfirmModal] = useState({ show: false, sessionId: null, studentName: '' });
    const [logsModal, setLogsModal] = useState({ show: false, logs: [] });

    // 3. Terminate Action
    const requestTerminate = (sessionId, studentName) => {
        setConfirmModal({ show: true, sessionId, studentName });
    };

    const confirmTerminate = async () => {
        const { sessionId, studentName } = confirmModal;
        if (!sessionId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/terminate`, {
                method: 'POST'
            });
            if (res.ok) {
                // Optimistic update or wait for poll
                setSessions(prev => prev.filter(s => s.id !== sessionId));
            } else {
                alert("Failed to terminate session");
            }
        } catch (err) {
            console.error("Error terminating:", err);
            alert("Failed to terminate.");
        } finally {
            setConfirmModal({ show: false, sessionId: null, studentName: '' });
        }
    };

    const filteredSessions = sessions.filter(s =>
        (s.student_name || s.studentName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingScreen text="Connecting to Live Feed..." />;

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Eye className="text-accent-primary" /> Live Invigilation Feed
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Monitoring {sessions.length} active exams in real-time.</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 10px 10px 36px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: '#fff',
                            width: '250px'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredSessions.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                        <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No Active Exams</h3>
                        <p>Waiting for students to start sessions...</p>
                    </div>
                ) : (
                    filteredSessions.map(session => (
                        <div key={session.id} className="glass-card" style={{
                            position: 'relative',
                            border: session.status === 'Flagged' ? '1px solid var(--accent-alert)' : '1px solid var(--glass-border)',
                            boxShadow: session.status === 'Flagged' ? '0 0 20px rgba(239, 68, 68, 0.1)' : 'none'
                        }}>
                            {session.status === 'Flagged' && (
                                <div style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-alert)',
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    <AlertTriangle size={12} /> FLAGGED
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{session.student_name || session.studentName || 'Unknown Student'}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {String(session.id).substring(0, 8)}...</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Trust Score</span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: (session.trust_score || 100) > 70 ? 'var(--accent-success)' : (session.trust_score || 100) > 40 ? '#fbbf24' : 'var(--accent-alert)'
                                    }}>
                                        {session.trust_score ?? 100}%
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${session.trust_score ?? 100}%`,
                                        height: '100%',
                                        background: (session.trust_score || 100) > 70 ? 'var(--accent-success)' : (session.trust_score || 100) > 40 ? '#fbbf24' : 'var(--accent-alert)',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`${API_BASE_URL}/api/sessions/${session.id}/logs`);
                                        const logs = await res.json();
                                        setLogsModal({ show: true, logs: logs });
                                    } catch (e) { console.error(e); }
                                }}
                                className="btn btn-secondary"
                                style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem', fontSize: '0.9rem' }}
                            >
                                View Activity Logs
                            </button>

                            {session.latest_log && (
                                <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--accent-alert)', display: 'flex', gap: '8px' }}>
                                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Latest: {session.latest_log}</span>
                                </div>
                            )}

                            <button
                                onClick={() => requestTerminate(session.id, session.student_name || session.studentName)}
                                className="btn"
                                style={{
                                    width: '100%',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--accent-alert)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <XCircle size={18} /> Terminate Exam
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-card animate-scale-in" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid var(--accent-alert)' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-alert)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                        }}>
                            <AlertTriangle size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Terminate Exam?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Are you sure you want to terminate <strong>{confirmModal.studentName}</strong>'s exam? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setConfirmModal({ show: false, sessionId: null, studentName: '' })}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmTerminate}
                                className="btn"
                                style={{
                                    flex: 1,
                                    background: 'var(--accent-alert)',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                Confirm Terminate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logs Modal */}
            {logsModal.show && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-card animate-scale-in" style={{ padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Invocation Logs</h3>
                            <button onClick={() => setLogsModal({ show: false, logs: [] })} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
                            {logsModal.logs && logsModal.logs.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {logsModal.logs.map((log, index) => (
                                        <div key={index} style={{
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderLeft: '3px solid var(--accent-alert)',
                                            borderRadius: '4px'
                                        }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                                            </div>
                                            <div style={{ color: '#fff' }}>{log.message}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    No violation logs recorded yet.
                                </div>
                            )}
                        </div>

                        <button onClick={() => setLogsModal({ show: false, logs: [] })} className="btn btn-secondary" style={{ width: '100%' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
