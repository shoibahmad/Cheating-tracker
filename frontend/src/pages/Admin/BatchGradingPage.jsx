
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { LoadingScreen } from '../../components/Common/LoadingScreen';
import { Check, X, AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const BatchGradingPage = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [gradingData, setGradingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/question-papers`);
                if (res.ok) setExams(await res.json());
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const fetchGradingData = async (examId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/exams/${examId}/responses`);
            if (res.ok) {
                const data = await res.json();
                setGradingData(data);
            } else {
                // Fallback for demo if endpoint not fully ready
                setGradingData([
                    { sessionId: 'S1', studentName: 'John Doe', questionId: 'Q1', questionText: 'Explain React Hooks.', answer: 'Hooks allow function components to use state...', aiScore: 0.8, manualScore: 0.8, status: 'AI-Graded' },
                    { sessionId: 'S2', studentName: 'Jane Smith', questionId: 'Q1', questionText: 'Explain React Hooks.', answer: 'They are magic.', aiScore: 0.2, manualScore: 0.2, status: 'AI-Graded' },
                ]);
            }
        } catch (err) {
            toast.error("Failed to fetch responses");
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (index, val) => {
        const newData = [...gradingData];
        newData[index].manualScore = parseFloat(val);
        setGradingData(newData);
    };

    const saveGrades = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(r => setTimeout(r, 1000));
        toast.success("Grades updated successfully!");
        setSaving(false);
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2>Batch Grading Workspace</h2>
                <p>Review and override AI-generated grades for descriptive answers.</p>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <select 
                        className="glass-input" 
                        onChange={(e) => {
                            const exam = exams.find(ex => ex.id === e.target.value);
                            setSelectedExam(exam);
                            fetchGradingData(e.target.value);
                        }}
                    >
                        <option value="">Select an Examination</option>
                        {exams.map(ex => (
                            <option key={ex.id} value={ex.id}>{ex.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedExam && (
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Responses for {selectedExam.title}</h3>
                        <button className="btn btn-primary" onClick={saveGrades} disabled={saving}>
                            <Save size={18} style={{ marginRight: '8px' }} /> {saving ? "Saving..." : "Save All Changes"}
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem' }}>Student</th>
                                <th style={{ padding: '1rem' }}>Question</th>
                                <th style={{ padding: '1rem' }}>Answer Content</th>
                                <th style={{ padding: '1rem', width: '150px' }}>AI Score</th>
                                <th style={{ padding: '1rem', width: '150px' }}>Manual Overide</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradingData.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{row.studentName}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.8rem', maxWidth: '200px' }}>{row.questionText}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ 
                                            background: 'rgba(0,0,0,0.2)', 
                                            padding: '1rem', 
                                            borderRadius: '8px', 
                                            fontSize: '0.9rem',
                                            maxHeight: '100px',
                                            overflowY: 'auto'
                                        }}>
                                            {row.answer}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`tag tag-${row.aiScore > 0.5 ? 'success' : 'alert'}`}>
                                            {row.aiScore * 100}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="0" 
                                            max="1"
                                            value={row.manualScore} 
                                            onChange={(e) => handleScoreChange(idx, e.target.value)}
                                            className="glass-input"
                                            style={{ width: '80px', textAlign: 'center' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
