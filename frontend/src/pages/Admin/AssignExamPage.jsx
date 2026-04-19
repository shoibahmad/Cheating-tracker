
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    User,
    BookOpen,
    FileText,
    ArrowLeft,
    Copy,
    CheckCircle,
    Cpu,
    Clock
} from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from '../../firebase';

export const AssignExamPage = () => {
    const navigate = useNavigate();

    const [papers, setPapers] = useState([]);
    const [selectedPaper, setSelectedPaper] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]); // Array for multi-select
    const [searchTerm, setSearchTerm] = useState(''); // New state for filtering students
    const [examType, setExamType] = useState('University');
    const [duration, setDuration] = useState(30);
    const [generatedSessions, setGeneratedSessions] = useState(null); // Rename to plural
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Question Papers
                const papersSnapshot = await getDocs(collection(db, "exams"));
                const papersList = papersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPapers(papersList);

                // Fetch Students from 'users' collection where role is 'student'
                const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
                const studentsSnapshot = await getDocs(studentsQuery);
                const studentsList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStudents(studentsList);
            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error("Failed to load data");
            }
        };
        fetchData();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (selectedStudentIds.length === 0 || !selectedPaper) {
            toast.error("Please select at least one student and a paper");
            setLoading(false);
            return;
        }

        try {
            const paper = papers.find(p => p.id === selectedPaper);

            const bulkData = {
                studentIds: selectedStudentIds,
                examId: selectedPaper,
                examTitle: paper?.title || 'Untitled Exam',
                exam_type: examType,
                duration_minutes: duration
            };

            const response = await fetch('/api/sessions/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bulkData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create sessions');
            }

            const data = await response.json();
            setGeneratedSessions(data.sessions);
            toast.success(`${data.sessions.length} exams assigned successfully!`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to assign exams: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (id) => {
        setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const selectAllVisible = (filteredStudents) => {
        const visibleIds = filteredStudents.map(s => s.id);
        const allSelected = visibleIds.every(id => selectedStudentIds.includes(id));
        
        if (allSelected) {
            setSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            setSelectedStudentIds(prev => [...new Set([...prev, ...visibleIds])]);
        }
    };

    const copyAllSessions = () => {
        if (!generatedSessions) return;
        const text = generatedSessions.map(s => `${s.student_name}: ${s.session_id}`).join('\n');
        navigator.clipboard.writeText(text);
        toast.success("All session records copied!");
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

            {!generatedSessions ? (
                <form onSubmit={handleAssign} className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                <User size={16} color="var(--accent-primary)" /> Select Candidates ({selectedStudentIds.length} selected)
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                Click student cards to toggle selection
                            </div>
                        </label>

                        {/* Search and Filters */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                            <input 
                                type="text"
                                placeholder="Search by name, course or class..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass-input"
                                style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                            />
                            <button 
                                type="button" 
                                onClick={() => {
                                    const filtered = students.filter(s => 
                                        s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        s.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                    selectAllVisible(filtered);
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '0 1rem', fontSize: '0.85rem', height: 'auto' }}
                            >
                                Toggle All Visible
                            </button>
                        </div>

                        {/* Student List Grid */}
                        <div style={{ 
                            maxHeight: '350px', 
                            overflowY: 'auto', 
                            background: 'rgba(0,0,0,0.2)', 
                            borderRadius: '12px',
                            padding: '0.5rem',
                            border: '1px solid var(--glass-border)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '0.5rem'
                        }}>
                            {students.filter(s => 
                                s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                s.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                s.email?.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map(s => (
                                <div 
                                    key={s.id}
                                    onClick={() => toggleStudent(s.id)}
                                    style={{
                                        padding: '0.75rem',
                                        background: selectedStudentIds.includes(s.id) ? 'rgba(var(--accent-primary-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${selectedStudentIds.includes(s.id) ? 'var(--accent-primary)' : 'transparent'}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: selectedStudentIds.includes(s.id) ? 'var(--accent-primary)' : 'white' }}>
                                            {s.full_name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', opacity: 0.8, fontFamily: 'monospace' }}>
                                            {s.email}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>
                                            {s.institution || s.course} {s.class_name ? ` • ${s.class_name}` : ''}
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '18px', height: '18px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--glass-border)',
                                        background: selectedStudentIds.includes(s.id) ? 'var(--accent-primary)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black'
                                    }}>
                                        {selectedStudentIds.includes(s.id) && <CheckCircle size={12} />}
                                    </div>
                                </div>
                            ))}
                            {students.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5, gridColumn: '1 / -1' }}>
                                    No students found.
                                </div>
                            )}
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
                                <option value="University">University Exam</option>
                                <option value="Corporate">Corporate Assessment</option>
                                <option value="Competitive">Competitive Exam</option>
                            </select>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                                ▼
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            <Clock size={16} color="var(--accent-warning)" /> Exam Duration (Minutes)
                        </label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="glass-input"
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                            min="1"
                            required
                        />
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
                                <option value="">-- Select Paper --</option>
                                {papers.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} ({p.subject})</option>
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
                <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'var(--accent-primary)', animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'var(--accent-success)'
                    }}>
                        <CheckCircle size={30} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Exams Assigned Successfully!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{generatedSessions.length} sessions created. Copy the records below to share with candidates.</p>

                    <div style={{ 
                        background: 'rgba(0,0,0,0.4)', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        marginBottom: '1.5rem',
                        border: '1px solid var(--glass-border)',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        textAlign: 'left'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', opacity: 0.7 }}>
                                    <th style={{ padding: '8px', fontSize: '0.8rem', textAlign: 'left' }}>Candidate</th>
                                    <th style={{ padding: '8px', fontSize: '0.8rem', textAlign: 'left' }}>Session ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {generatedSessions.map((s, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '10px 8px', fontSize: '0.9rem' }}>{s.student_name}</td>
                                        <td style={{ padding: '10px 8px', fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{s.session_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={copyAllSessions} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Copy size={16} /> Copy All Records
                        </button>
                        <button onClick={() => setGeneratedSessions(null)} className="btn btn-primary">
                            Assign More
                        </button>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <button onClick={() => navigate('/admin/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
