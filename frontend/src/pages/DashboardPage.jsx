import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldAlert,
    Users,
    Activity,
    GraduationCap
} from 'lucide-react';
import { StatCard } from '../components/Dashboard/StatCard';
import { LiveSessionCard } from '../components/Dashboard/LiveSessionCard';
import { LoadingScreen } from '../components/Common/LoadingScreen';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ active_exams: 0, flagged_exams: 0, total_exams_today: 0, average_trust_score: 0 });
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        // Artificial delay for loading screen demo
        const initLoad = async () => {
            await new Promise(r => setTimeout(r, 1000));

            try {
                const statsRes = await fetch('http://localhost:8000/api/dashboard-stats');
                const sessRes = await fetch('http://localhost:8000/api/sessions');
                if (statsRes.ok) setStats(await statsRes.json());
                if (sessRes.ok) setSessions(await sessRes.json());
                else throw new Error("Backend offline");
            } catch (e) {
                console.error("Backend offline, using mocks");
                // Fallback mocks
                setStats({ active_exams: 12, flagged_exams: 2, total_exams_today: 142, average_trust_score: 88 });
                setSessions([
                    { id: "1", student_name: "Alice Johnson", exam_type: "University", status: "Active", trust_score: 98, alerts: [] },
                    { id: "2", student_name: "Bob Smith", exam_type: "Competitive", status: "Flagged", trust_score: 45, alerts: ["Face not found"] },
                    { id: "3", student_name: "Charlie Brown", exam_type: "Corporate", status: "Active", trust_score: 92, alerts: [] },
                    { id: "4", student_name: "David Lee", exam_type: "University", status: "Active", trust_score: 88, alerts: [] },
                    { id: "5", student_name: "Eva Green", exam_type: "Competitive", status: "Active", trust_score: 95, alerts: [] },
                ]);
            } finally {
                setLoading(false);
            }
        };
        initLoad();
    }, []);

    const handleSelectSession = (session) => {
        navigate(`/monitor/${session.id}`);
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4" style={{ marginBottom: '2rem' }}>
                <StatCard label="Active Exams" value={stats.active_exams} icon={Users} color="blue" />
                <StatCard label="Flagged Incidents" value={stats.flagged_exams} icon={ShieldAlert} color="red" />
                <StatCard label="Total Today" value={stats.total_exams_today} icon={Activity} color="green" />
                <StatCard label="Avg Trust Score" value={`${stats.average_trust_score}%`} icon={GraduationCap} color="purple" />
            </div>

            {/* Section Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Live Monitoring Sessions</h3>
                    <p style={{ fontSize: '0.875rem' }}>Real-time surveillance of active examination candidates</p>
                </div>
                <button className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>View All Sessions</button>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map(session => (
                    <LiveSessionCard key={session.id} session={session} onSelect={() => handleSelectSession(session)} />
                ))}
            </div>
        </div>
    );
};
