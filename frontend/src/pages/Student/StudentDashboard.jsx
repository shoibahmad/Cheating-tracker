import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

export const StudentDashboard = () => {
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState('');
    const [papers, setPapers] = useState([]);
    const studentName = localStorage.getItem('user_name') || 'Student';

    useEffect(() => {
        // Fetch valid papers for "Sample" section
        fetch(`${API_BASE_URL}/api/question-papers`)
            .then(res => res.json())
            .then(data => setPapers(data))
            .catch(err => console.error(err));
    }, []);

    const handleStartExam = (e) => {
        e.preventDefault();
        if (sessionId) {
            navigate(`/student/exam/${sessionId}`);
        }
    };


    const [assignedExams, setAssignedExams] = useState([]);

    // Auto-fetch assigned exams
    useEffect(() => {
        if (studentName) {
            fetch(`${API_BASE_URL}/api/sessions?student_name=${encodeURIComponent(studentName)}`)
                .then(res => res.json())
                .then(data => {
                    // Filter for Active exams that haven't been taken/terminated (logic can be refined)
                    const active = data.filter(s => s.status === 'Active');
                    setAssignedExams(active);
                })
                .catch(err => console.error("Error fetching assigned exams:", err));
        }
    }, [studentName]);

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2>Student Portal</h2>
                <p>Welcome back, <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{studentName}</span></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Assigned Exams Section */}
                    <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--accent-primary)' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>My Assigned Exams</h3>
                        {assignedExams.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No exams currently assigned to you.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {assignedExams.map(exam => (
                                    <div key={exam.id} style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid var(--accent-primary)'
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>{exam.exam_type}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>Session ID: {exam.id}</div>
                                        <button
                                            onClick={() => navigate(`/student/exam/${exam.id}`)}
                                            className="btn btn-primary"
                                            style={{ width: '100%', padding: '0.6rem' }}
                                        >
                                            Start Exam
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Enter Exam Section (Fallback) */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Enter Session ID</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Have a manual code? Enter it here.
                        </p>
                        <form onSubmit={handleStartExam}>
                            <input
                                type="text"
                                placeholder="Paste Session ID..."
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                className="input-field"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                required
                            />
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                                Join Session
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sample Papers Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Sample Question Papers</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Practice with available question papers. (Note: This will not record a session)
                    </p>
                    {papers.length === 0 ? (
                        <p>No papers available.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {papers.map(p => (
                                <div key={p.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{p.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.subject} • {p.questions?.length || 0} Questions</div>
                                    </div>
                                    {/* For now, just a view button or similar, or create a mock session to practice */}
                                    <button className="btn-text" disabled title="Practice Mode Coming Soon">Practice</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
