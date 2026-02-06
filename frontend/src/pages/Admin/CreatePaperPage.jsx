
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';
import {
    Plus,
    Trash2,
    Save,
    FileText,
    CheckCircle,
    Circle,
    BookOpen,
    ArrowLeft
} from 'lucide-react';

export const CreatePaperPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [questions, setQuestions] = useState([
        { id: 'q1', text: '', options: ['', '', '', ''], correct_answer: 0 }
    ]);

    const addQuestion = () => {
        const newId = `q${questions.length + 1}`;
        setQuestions([...questions, { id: newId, text: '', options: ['', '', '', ''], correct_answer: 0 }]);
    };

    const removeQuestion = (index) => {
        if (questions.length === 1) {
            toast.error("At least one question is required");
            return;
        }
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!title.trim() || !subject.trim()) {
            toast.error("Please fill in paper details");
            return;
        }

        const paper = {
            title,
            subject,
            questions: questions.map(q => ({
                text: q.text,
                options: q.options,
                correct_answer: q.correct_answer
            }))
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/question-papers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paper)
            });
            if (res.ok) {
                toast.success('Question Paper Created Successfully!');
                navigate('/admin/dashboard');
            } else {
                toast.error('Failed to create paper');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error creating paper');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
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
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Question Paper</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Design a new exam paper for students</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Paper Details Card */}
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                            <FileText size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Paper Details</h3>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Paper Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="glass-input"
                                required
                                placeholder="e.g. Mid-Term Physics 2024"
                                style={{ fontSize: '1rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Subject / Course</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="glass-input"
                                required
                                placeholder="e.g. Physics 101"
                                style={{ fontSize: '1rem' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className="glass-card" style={{ marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--accent-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Auto-Import Questions (OCR)</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>Upload an image or PDF of a question paper to extract questions automatically.</p>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        const toastId = toast.loading("Scanning paper...");
                                        const formData = new FormData();
                                        formData.append('file', file);

                                        try {
                                            const res = await fetch(`${API_BASE_URL}/api/ocr/upload`, {
                                                method: 'POST',
                                                body: formData
                                            });
                                            if (res.ok) {
                                                const data = await res.json();
                                                if (data.questions && data.questions.length > 0) {
                                                    setQuestions(prev => [...prev, ...data.questions]);
                                                    toast.success(`Imported ${data.questions.length} questions!`, { id: toastId });
                                                } else {
                                                    toast.error("No questions found in image", { id: toastId });
                                                }
                                            } else {
                                                toast.error("OCR Failed", { id: toastId });
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("Error uploading file", { id: toastId });
                                        }
                                    }}
                                    style={{
                                        position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0
                                    }}
                                />
                                <button type="button" className="btn btn-secondary">
                                    <BookOpen size={16} style={{ marginRight: '8px' }} /> Upload Scan
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

                        <h3 style={{ fontSize: '1.5rem' }}>Questions ({questions.length})</h3>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="btn btn-secondary"
                            style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--accent-success)',
                                borderColor: 'rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            <Plus size={18} /> Add Question
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {questions.map((q, qIndex) => (
                            <div key={q.id} className="glass-card" style={{ position: 'relative', borderLeft: '4px solid var(--accent-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '28px', height: '28px',
                                            borderRadius: '50%',
                                            background: 'var(--bg-tertiary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)'
                                        }}>
                                            {qIndex + 1}
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Question Text</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            opacity: 0.7,
                                            transition: 'opacity 0.2s',
                                            padding: '4px'
                                        }}
                                        title="Remove Question"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                        className="glass-input"
                                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                                        required
                                        placeholder="Type your question here..."
                                    />
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                className="glass-input"
                                                placeholder={`Option ${oIndex + 1}`}
                                                required
                                                style={{
                                                    paddingRight: '40px',
                                                    borderColor: q.correct_answer === oIndex ? 'var(--accent-success)' : 'var(--glass-border)'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: q.correct_answer === oIndex ? 'var(--accent-success)' : 'var(--text-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Mark as Correct Answer"
                                            >
                                                {q.correct_answer === oIndex ? <CheckCircle size={18} fill="rgba(16, 185, 129, 0.2)" /> : <Circle size={18} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sticky Footer Action */}
                <div style={{
                    position: 'sticky',
                    bottom: '2rem',
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '2rem'
                }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            padding: '1rem 3rem',
                            fontSize: '1.1rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        <Save size={20} /> Save Question Paper
                    </button>
                </div>
            </form>
        </div>
    );
};
