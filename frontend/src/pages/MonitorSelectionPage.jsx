import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { LoadingScreen } from '../components/Common/LoadingScreen';
import { LiveSessionCard } from '../components/Dashboard/LiveSessionCard';

export const MonitorSelectionPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const fetchSessions = async () => {
            // Simulate loading for effect
            await new Promise(r => setTimeout(r, 800));
            try {
                const res = await fetch(`${API_BASE_URL}/api/sessions`);
                if (res.ok) setSessions(await res.json());
                else throw new Error("Backend offline");
            } catch (e) {
                console.error("Backend offline, using mocks");
                setSessions([
                    { id: "1", student_name: "Alice Johnson", exam_type: "University", status: "Active", trust_score: 98, alerts: [] },
                    { id: "2", student_name: "Bob Smith", exam_type: "Competitive", status: "Flagged", trust_score: 45, alerts: ["Face not found"] },
                    { id: "4", student_name: "Diana Prince", exam_type: "University", status: "Active", trust_score: 100, alerts: [] },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const handleSelectSession = (session) => {
        navigate(`/monitor/${session.id}`);
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Active Monitoring Sessions</h2>
                <p>Select a candidate to view their live video feed and analysis.</p>
            </div>

            {sessions.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p>No active sessions found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
                    {sessions.map(session => (
                        <LiveSessionCard key={session.id} session={session} onSelect={() => handleSelectSession(session)} />
                    ))}
                </div>
            )}
        </div>
    );
};
