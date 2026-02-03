import React from 'react';
import { CreateExamForm } from '../components/Forms/CreateExamForm';

export const ScheduleExamPage = () => {
    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Schedule New Exam</h2>
                <p>Register a candidate for a secured examination session.</p>
            </div>

            <CreateExamForm />
        </div>
    );
};
