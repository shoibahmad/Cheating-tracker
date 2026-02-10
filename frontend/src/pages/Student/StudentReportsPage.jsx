import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, BarChart2, Calendar } from 'lucide-react';

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

    return (
        <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
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
                                gap: '1rem'
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
