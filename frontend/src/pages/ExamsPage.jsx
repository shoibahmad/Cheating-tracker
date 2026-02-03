import React from 'react';
import { GraduationCap, Clock, Calendar } from 'lucide-react';

import { CreateExamForm } from '../components/Forms/CreateExamForm';
import { useState } from 'react';

export const ExamsPage = () => {
    const [showSchedule, setShowSchedule] = useState(false);
    const exams = [
        { id: 1, name: "JEE Mains 2026", date: "2026-04-15", duration: "3 Hours", candidates: 1200000, status: "Upcoming" },
        { id: 2, name: "NEET UG 2026", date: "2026-05-05", duration: "3 Hours", candidates: 1500000, status: "Upcoming" },
        { id: 3, name: "GATE 2026", date: "2026-02-12", duration: "3 Hours", candidates: 800000, status: "Active" },
        { id: 4, name: "CAT 2025", date: "2025-11-24", duration: "2 Hours", candidates: 250000, status: "Completed" },
    ];

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Competitive Exams</h2>
                    <p style={{ margin: 0 }}>Schedule and monitor large-scale competitive examinations.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowSchedule(!showSchedule)}
                >
                    {showSchedule ? 'Close Scheduler' : 'Schedule New Exam'}
                </button>
            </div>

            {showSchedule && (
                <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
                    <CreateExamForm defaultType="Competitive" onSuccess={() => window.location.href = '/monitor'} />
                </div>
            )}

            <div className="grid grid-cols-1">
                {exams.map(exam => (
                    <div key={exam.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '60px', height: '60px',
                                background: exam.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
                                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: exam.status === 'Active' ? 'var(--accent-success)' : 'var(--text-secondary)'
                            }}>
                                <GraduationCap size={32} />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>{exam.name}</h3>
                                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {exam.date}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {exam.duration}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{exam.candidates.toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Candidates</div>
                            </div>
                            <span className={`badge ${exam.status === 'Active' ? 'badge-active' : ''}`} style={{
                                background: exam.status === 'Completed' ? 'rgba(255,255,255,0.1)' : undefined,
                                color: exam.status === 'Upcoming' ? 'var(--accent-primary)' : undefined
                            }}>
                                {exam.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
