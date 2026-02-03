import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';

export const CreateExamForm = ({ defaultType = "University", onSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        student_name: '',
        exam_type: defaultType,
        id: 'EX-' + Math.floor(100 + Math.random() * 900)
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/monitor');
                }
            } else {
                alert('Failed to schedule exam');
            }
        } catch (error) {
            console.error(error);
            alert('Error connecting to backend');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ padding: '10px', background: 'var(--accent-primary)', borderRadius: '8px', color: 'white' }}>
                    <UserPlus size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>Candidate Details</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>Enter information to generate session ID</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Student Name</label>
                    <input
                        type="text"
                        required
                        className="glass-input"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        value={formData.student_name}
                        onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Exam Type</label>
                    <select
                        className="glass-input"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        value={formData.exam_type}
                        onChange={e => setFormData({ ...formData, exam_type: e.target.value })}
                    >
                        <option value="University">University Exam</option>
                        <option value="Competitive">Competitive Entrance</option>
                        <option value="Corporate">Corporate Assessment</option>
                        <option value="Interview">Remote Interview</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Session ID (Auto-generated)</label>
                    <input
                        type="text"
                        readOnly
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                        value={formData.id}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                    {loading ? 'Scheduling...' : <>Schedule Exam <ArrowRight size={18} /></>}
                </button>
            </form>
        </div>
    );
};
