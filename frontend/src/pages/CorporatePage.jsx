import React from 'react';
import { Building2, Globe, Users } from 'lucide-react';

import { CreateExamForm } from '../components/Forms/CreateExamForm';
import { useState } from 'react';

export const CorporatePage = () => {
    const [showSchedule, setShowSchedule] = useState(false);
    const clients = [
        { id: 1, name: "Google", sector: "Technology", active_assessments: 5, employees: 15000 },
        { id: 2, name: "Microsoft", sector: "Technology", active_assessments: 8, employees: 12000 },
        { id: 3, name: "Deloitte", sector: "Consulting", active_assessments: 12, employees: 8000 },
        { id: 4, name: "Goldman Sachs", sector: "Finance", active_assessments: 4, employees: 5000 },
    ];

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ marginBottom: '1rem' }}>Corporate Partners</h2>
                    <p>Enterprise assessment and training monitoring.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowSchedule(!showSchedule)}
                >
                    {showSchedule ? 'Close Scheduler' : 'Schedule Assessment'}
                </button>
            </div>

            {showSchedule && (
                <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
                    <CreateExamForm defaultType="Corporate" onSuccess={() => window.location.href = '/monitor'} />
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-1">
                {clients.map(client => (
                    <div key={client.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '10px', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>{client.name}</h3>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{client.sector}</span>
                                </div>
                            </div>
                            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Details</button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{client.active_assessments}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Assessments</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{client.employees.toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Employees</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-success)' }}>99.8%</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Compliance</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
