import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, BarChart2, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export const StudentReportsPage = () => {
    const { currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            if (currentUser?.uid) {
                try {
                    const q = query(collection(db, "sessions"), where("studentId", "==", currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // Filter for Completed exams
                    const completed = sessions.filter(s => s.status === 'Completed');
                    // Sort by most recent (assuming finishedAt exists, or use createdAt as fallback)
                    // completed.sort((a, b) => b.finishedAt - a.finishedAt); 
                    setReports(completed);
                } catch (err) {
                    console.error("Error fetching reports:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchReports();
    }, [currentUser]);

    const [selectedReport, setSelectedReport] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);

    const handleViewAnalysis = async (session) => {
        if (session.ai_report) {
            setSelectedReport({ ...session, report: session.ai_report });
            return;
        }

        setAnalysisLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/sessions/${session.id}/generate-report`, {
                method: 'POST'
            });
            if (res.ok) {
                const report = await res.json();
                setSelectedReport({ ...session, report });
                // Optimistically update local state
                setReports(prev => prev.map(p => p.id === session.id ? { ...p, ai_report: report } : p));
            } else {
                alert("Failed to generate report");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server");
        } finally {
            setAnalysisLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
            {/* Analysis Modal */}
            {selectedReport && (
                <div className="animate-fade-in" style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', pading: '2rem'
                }} onClick={() => setSelectedReport(null)}>
                    <div className="glass-panel" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', margin: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>AI Integrity Analysis</h3>
                            <button onClick={() => setSelectedReport(null)} className="btn btn-secondary">Close</button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>TRUST SCORE</div>
                            <div style={{
                                fontSize: '4rem', fontWeight: '800',
                                color: selectedReport.report.trust_score > 80 ? 'var(--accent-success)' : selectedReport.report.trust_score > 50 ? 'var(--accent-warning)' : 'var(--accent-alert)'
                            }}>
                                {selectedReport.report.trust_score || 0}%
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Session Summary</h4>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                {selectedReport.report.summary || "No summary available."}
                            </p>
                        </div>

                        {selectedReport.feedback && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Question Analysis</h4>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {Object.entries(selectedReport.feedback).map(([qId, data], index) => (
                                        <div key={qId} style={{
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            borderLeft: `4px solid ${data.correct ? 'var(--accent-success)' : 'var(--accent-alert)'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Question {index + 1}</span>
                                                <span style={{
                                                    color: data.correct ? 'var(--accent-success)' : 'var(--accent-alert)',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {data.score} Marks
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{data.remarks}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedReport.report.suspicious_moments && selectedReport.report.suspicious_moments.length > 0 && (
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-alert)' }}>Flagged Incidents</h4>
                                <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {selectedReport.report.suspicious_moments.map((m, i) => (
                                        <li key={i} style={{ color: 'var(--text-primary)' }}>{m}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(analysisLoading) && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div className="glass-panel" style={{ padding: '1rem 2rem' }}>Generating AI Analysis...</div>
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Reports</h2>
                <p style={{ color: 'var(--text-secondary)' }}>View your performance and history.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading reports...</div>
            ) : reports.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
                        <BarChart2 size={48} />
                    </div>
                    <h3>No Reports Available</h3>
                    <p>You haven't completed any exams yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {reports.map(report => (
                        <div key={report.id} className="glass-card" style={{
                            borderLeft: '4px solid var(--accent-success)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{report.examTitle || report.exam_type}</h3>
                                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <CheckCircle size={16} color="var(--accent-success)" /> Completed
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={16} /> {report.finished_at ? new Date(report.finished_at.seconds * 1000).toLocaleDateString() : 'Date N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 'bold' }}>SCORE</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{report.score}%</div>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1rem',
                                borderRadius: '8px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Suspicious Flags</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: report.cheat_score > 0 ? 'var(--accent-alert)' : 'var(--accent-success)' }}>
                                        {report.cheat_score || 0}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Questions Attempted</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {/* Placeholder logic if detailed stats aren't saved */}
                                        {report.total_questions || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Session ID</div>
                                    <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{report.id}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleViewAnalysis(report)}
                                className="btn btn-secondary"
                                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <BarChart2 size={16} /> View AI Analysis & Integrity Report
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
