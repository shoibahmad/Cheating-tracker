import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MonitorView } from '../components/Monitoring/MonitorView';
import { LoadingScreen } from '../components/Common/LoadingScreen';

export const MonitorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch session details
        const fetchSession = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/sessions/${id}`);
                if (!response.ok) throw new Error("Session not found");
                const data = await response.json();
                setSession(data);
            } catch (err) {
                console.error(err);
                // Fallback for demo if backend fails
                const mockSession = {
                    id: id,
                    student_name: "Mock Student (Offline)",
                    trust_score: 88,
                    alerts: ["System Offline Mode"]
                };
                setSession(mockSession);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    if (loading) return <LoadingScreen />;
    if (!session) return <div>Session not found</div>;

    return <MonitorView session={session} onBack={() => navigate('/dashboard')} />;
};
