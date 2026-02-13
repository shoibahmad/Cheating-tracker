import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { FileText, Clock, AlertCircle } from 'lucide-react';

export const StudentExamsPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [assignedExams, setAssignedExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssigned = async () => {
            if (currentUser?.uid) {
                try {
                    const q = query(collection(db, "sessions"), where("studentId", "==", currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // Filter for active or scheduled exams (not completed ones)
                    // Or show all but group them? User wants "Reports" for performance, so maybe this is "Pending Exams"
                    // But standard "Exams" page usually shows upcoming/active.
                    const active = sessions.filter(s => ['Active', 'Scheduled'].includes(s.status));
                    active.sort((a, b) => (a.status === 'Active' ? -1 : 1));
                    setAssignedExams(active);
                } catch (err) {
                    console.error("Error fetching assigned exams:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAssigned();
    }, [currentUser]);

    return (
        <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Exams</h2>
                <p style={{ color: 'var(--text-secondary)' }}>View and start your assigned examinations.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading exams...</div>
            ) : assignedExams.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
                        <FileText size={48} />
                    </div>
                    <h3>No Exams Assigned</h3>
                    <p>You don't have any pending exams at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {assignedExams.map(exam => (
                        <div key={exam.id} className="glass-card" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: '4px solid var(--accent-primary)'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{exam.exam_title || exam.examTitle || exam.exam_type}</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <FileText size={16} /> {exam.exam_type}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={16} /> Status: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{exam.status}</span>
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                                    Session ID: {exam.id}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/student/exam/${exam.id}`)}
                                className="btn btn-primary"
                                style={{ padding: '0.8rem 2rem' }}
                            >
                                Start Exam
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
