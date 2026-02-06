
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';
import {
    User,
    BookOpen,
    FileText,
    ArrowLeft,
    Copy,
    CheckCircle,
    Cpu
} from 'lucide-react';

export const AssignExamPage = () => {
    const navigate = useNavigate();

    const [papers, setPapers] = useState([]);
    const [selectedPaper, setSelectedPaper] = useState('');
    const [studentName, setStudentName] = useState('');
    const [examType, setExamType] = useState('University');
    const [generatedSession, setGeneratedSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        // Fetch Question Papers
        fetch(`${API_BASE_URL}/api/question-papers`)
            .then(res => res.json())
            .then(data => setPapers(data))
            .catch(err => console.error(err));

        // Fetch Students
        fetch(`${API_BASE_URL}/api/students`)
            .then(res => res.json())
            .then(data => setStudents(data))
            .catch(err => console.error(err));
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/assign-exam?student_name=${encodeURIComponent(studentName)}&exam_type=${encodeURIComponent(examType)}&question_paper_id=${selectedPaper}`, {
                method: 'POST'
            });
            const data = await res.json();
            setGeneratedSession(data);
            toast.success("Session ID generated successfully!");
        } catch (err) {
            console.error(err);
            toast.error('Failed to assign exam');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedSession?.session_id) {
            navigator.clipboard.writeText(generatedSession.session_id);
            toast.success("Session ID copied to clipboard");
        }
    };

    return (
        <div className="container" style={{ maxWidth: '700px', paddingBottom: '3rem' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem'
                }}
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Assign Exam</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Generate a unique secure session for a candidate</p>
            </div>

            {!generatedSession ? (
                <form onSubmit={handleAssign} className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            <User size={16} color="var(--accent-primary)" /> Candidate Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', appearance: 'none', padding: '1rem', fontSize: '1rem', cursor: 'pointer' }}
                                required
                            >
                                <option value="" style={{ color: 'black' }}>-- Select Student --</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.full_name} style={{ color: 'black' }}>{s.full_name} ({s.email})</option>
                                ))}
                            </select>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                                ▼
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            <BookOpen size={16} color="var(--accent-secondary)" /> Exam Type
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', appearance: 'none', padding: '1rem', fontSize: '1rem', cursor: 'pointer' }}
                            >
                                <option value="University" style={{ color: 'black' }}>University Exam</option>
                                <option value="Corporate" style={{ color: 'black' }}>Corporate Assessment</option>
                                <option value="Competitive" style={{ color: 'black' }}>Competitive Exam</option>
                            </select>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                                ▼
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            <FileText size={16} color="var(--accent-success)" /> Select Question Paper
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={selectedPaper}
                                onChange={(e) => setSelectedPaper(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', appearance: 'none', padding: '1rem', fontSize: '1rem', cursor: 'pointer' }}
                                required
                            >
                                <option value="" style={{ color: 'black' }}>-- Select Paper --</option>
                                {papers.map(p => (
                                    <option key={p.id} value={p.id} style={{ color: 'black' }}>{p.title} ({p.subject})</option>
                                ))}
                            </select>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                                ▼
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : <><Cpu size={20} /> Generate Session ID</>}
                    </button>
                </form>
            ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderColor: 'var(--accent-primary)', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'var(--accent-success)'
                    }}>
                        <CheckCircle size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Exam Assigned!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Share this Session ID with the candidate to start the exam.</p>

                    <div
                        onClick={copyToClipboard}
                        style={{
                            background: 'rgba(0,0,0,0.4)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '2rem',
                            border: '1px dashed var(--accent-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        className="session-id-box"
                        title="Click to copy"
                    >
                        <span style={{ fontSize: '1.5rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 600 }}>
                            {generatedSession.session_id}
                        </span>
                        <Copy size={20} color="var(--text-secondary)" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
                            Go to Dashboard
                        </button>
                        <button onClick={() => setGeneratedSession(null)} className="btn btn-primary">
                            Assign Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
