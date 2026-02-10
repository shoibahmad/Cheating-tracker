import React from 'react';
import { School, MapPin, Users } from 'lucide-react';

import { CreateExamForm } from '../components/Forms/CreateExamForm';
import { useState } from 'react';

export const InstitutionsPage = () => {
    const [showSchedule, setShowSchedule] = useState(false);
    const institutions = [
        { id: 1, name: "Integral University", location: "Lucknow, India", active_exams: 12, students: 4500 },
        { id: 2, name: "Jamia Hamdard University", location: "New Delhi, India", active_exams: 8, students: 3200 },
    ];

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ marginBottom: '1rem' }}>Registered Institutions</h2>
                    <p>Manage and monitor educational institutions using the SecureEval platform.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowSchedule(!showSchedule)}
                >
                    {showSchedule ? 'Close Scheduler' : 'Schedule University Exam'}
                </button>
            </div>

            {showSchedule && (
                <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
                    <CreateExamForm defaultType="University" onSuccess={() => window.location.href = '/monitor'} />
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-1">
                {institutions.map(inst => (
                    <div key={inst.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '10px', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                                    <School size={24} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{inst.name}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14} /> {inst.location}</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>{inst.active_exams}</span>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Active Exams</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{inst.students.toLocaleString()}</span>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Students</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
