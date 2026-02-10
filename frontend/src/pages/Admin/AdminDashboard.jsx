
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '../../firebase';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Users,
    ShieldAlert,
    FileText,
    TrendingUp,
    Activity,
    CheckCircle,
    Edit
} from 'lucide-react';

export const AdminDashboard = () => {
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({
        active: 0,
        flagged: 0,
        total_students: 0,
        avg_score: 0,
        total_exams: 0
    });

    // Mock data for charts (since backend history API isn't fully ready for trends)
    const activityData = [
        { name: 'Mon', exams: 12, alerts: 2 },
        { name: 'Tue', exams: 19, alerts: 4 },
        { name: 'Wed', exams: 15, alerts: 1 },
        { name: 'Thu', exams: 22, alerts: 5 },
        { name: 'Fri', exams: 28, alerts: 3 },
        { name: 'Sat', exams: 8, alerts: 0 },
        { name: 'Sun', exams: 5, alerts: 1 },
    ];

    const COLORS = ['#10b981', '#f43f5e', '#6366f1']; // Green, Red, Indigo

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch stats from Firestore collections directly
                // 1. Sessions
                const sessionsSnapshot = await getDocs(collection(db, "sessions"));
                const sessionsList = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 2. Students (Users with role='student')
                const usersSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
                const totalStudents = usersSnapshot.size;

                // Calculate Stats
                const active = sessionsList.filter(s => s.status === 'Active').length;
                const flagged = sessionsList.filter(s => s.status === 'Flagged').length;
                const totalExams = sessionsList.length;

                // Calculate Average Score (only from Completed sessions with scores)
                const completedSessions = sessionsList.filter(s => s.score !== undefined);
                const avgScore = completedSessions.length > 0
                    ? Math.round(completedSessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedSessions.length)
                    : 0;

                setSessions(sessionsList); // For the table
                setStats({
                    active,
                    flagged,
                    total_students: totalStudents,
                    avg_score: avgScore,
                    total_exams: totalExams
                });
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            }
        };
        loadData();
    }, []);

    const statusData = [
        { name: 'Active', value: stats.active },
        { name: 'Flagged', value: stats.flagged },
        { name: 'Completed', value: stats.total_exams - stats.active - stats.flagged } // Derived
    ];

    return (
        <div className="container" style={{ paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Overview of system performance and exam integrity</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/admin/create-paper" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                        <FileText size={18} /> Create Paper
                    </Link>
                    <Link to="/admin/assign-exam" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
                        <Users size={18} /> Assign Exam
                    </Link>
                    <Link to="/admin/students" className="btn btn-secondary" style={{ gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <Edit size={18} /> Manage Students
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard
                    label="Total Sessions"
                    value={stats.total_exams}
                    icon={Activity}
                    color="var(--accent-primary)"
                    bg="rgba(99, 102, 241, 0.1)"
                />
                <StatCard
                    label="Active Exams"
                    value={stats.active}
                    icon={TrendingUp}
                    color="var(--accent-success)"
                    bg="rgba(16, 185, 129, 0.1)"
                />
                <StatCard
                    label="Trust Score Avg"
                    value={`${stats.avg_score}%`}
                    icon={CheckCircle}
                    color="#8b5cf6"
                    bg="rgba(139, 92, 246, 0.1)"
                />
                <StatCard
                    label="Flagged Incidents"
                    value={stats.flagged}
                    icon={ShieldAlert}
                    color="var(--accent-alert)"
                    bg="rgba(244, 63, 94, 0.1)"
                />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Activity Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Weekly Exam Activity</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Bar dataKey="exams" name="Exams Conducted" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="alerts" name="Alerts Triggered" fill="var(--accent-alert)" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Pie Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Exam Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Sessions Table */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Recent Sessions</h3>
                    <button className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>View All</button>
                </div>

                {sessions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <p>No active sessions found.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Session ID</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Candidate</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Exam Type</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Score</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Trust Score</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Latest Alert</th>

                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(session => (
                                    <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-row">
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', opacity: 0.7 }}>{session.id.substring(0, 8)}...</td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {(session.student_name || session.studentName || '?').charAt(0)}
                                                </div>
                                                {session.student_name || session.studentName || 'Unknown'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', opacity: 0.8 }}>{session.exam_type}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                background: session.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : session.status === 'Flagged' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                color: session.status === 'Active' ? 'var(--accent-success)' : session.status === 'Flagged' ? 'var(--accent-alert)' : 'var(--accent-primary)',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem'
                                            }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                                {session.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                            {session.score !== undefined ? `${session.score}%` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', width: '80px' }}>
                                                    <div style={{
                                                        width: `${session.trust_score !== undefined ? session.trust_score : 100}%`,
                                                        height: '100%',
                                                        borderRadius: '3px',
                                                        background: (session.trust_score !== undefined ? session.trust_score : 100) > 80 ? 'var(--accent-success)' : (session.trust_score || 100) > 50 ? 'var(--accent-warning)' : 'var(--accent-alert)'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{session.trust_score !== undefined ? session.trust_score : 100}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', maxWidth: '200px' }}>
                                            {session.latest_log ? (
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--accent-alert)',
                                                    background: 'rgba(244, 63, 94, 0.1)',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%'
                                                }} title={session.latest_log}>
                                                    ⚠ {session.latest_log}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>-</span>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--glass-border)' }}>
        <div style={{
            width: '48px', height: '48px',
            borderRadius: '12px',
            background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color
        }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{label}</div>
        </div>
    </div>
);
