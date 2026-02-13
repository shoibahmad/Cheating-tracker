
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
    Edit,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({
        active: 0,
        flagged: 0,
        total_students: 0,
        avg_score: 0,
        total_exams: 0
    });

    const COLORS = ['#10b981', '#f43f5e', '#6366f1']; // Green, Red, Indigo
    const [chartData, setChartData] = useState([]); // Real chart data
    const [performanceData, setPerformanceData] = useState([]);

    const loadData = async () => {
        try {
            // Fetch stats from Backend
            const res = await fetch(`${API_BASE_URL}/api/admin/exams/history`);
            if (!res.ok) throw new Error("Failed to fetch sessions");
            const sessionsList = await res.json();

            // Fetch Students
            const usersSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
            const totalStudents = usersSnapshot.size;

            // --- Process Data for Stats (Prioritized for Distribution) ---
            let activeCount = 0;
            let flaggedCount = 0;
            let completedCount = 0;

            sessionsList.forEach(s => {
                // Robust check: Status is Terminated/Flagged OR latest_log exists (and is not just whitespace)
                const hasLog = s.latest_log && String(s.latest_log).trim().length > 0;
                const isFlagged = s.status === 'Terminated' || s.status === 'Flagged' || hasLog;

                if (isFlagged) {
                    flaggedCount++;
                } else if (s.status === 'Completed') {
                    completedCount++;
                } else if (s.status === 'Active') {
                    activeCount++;
                }
            });

            // Calculate Average Trust Score (from ALL sessions with trust scores)
            const sessionsWithTrust = sessionsList.filter(s => s.trust_score !== undefined);
            const avgTrustScore = sessionsWithTrust.length > 0
                ? Math.round(sessionsWithTrust.reduce((acc, curr) => acc + (Number(curr.trust_score) || 0), 0) / sessionsWithTrust.length)
                : 100;

            const totalExams = sessionsList.length;

            setSessions(sessionsList);
            setStats({
                active: activeCount,
                flagged: flaggedCount,
                completed: completedCount,
                total_students: totalStudents,
                avg_score: avgTrustScore, // Fix: Use Trust Score for the card
                total_exams: totalExams
            });

            // --- Process Data for Weekly Activity Chart ---
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            const last7Days = [];

            // Initialize last 7 days buckets
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dayName = days[d.getDay()];
                // We'll use local date string for robust comparison 'YYYY-MM-DD'
                const dateKey = d.toISOString().split('T')[0];
                last7Days.push({
                    name: dayName,
                    dateKey: dateKey,
                    exams: 0,
                    alerts: 0
                });
            }

            // Fill buckets
            sessionsList.forEach(session => {
                if (!session.created_at) return;
                // session.created_at is ISO string
                const sessionDate = session.created_at.split('T')[0];

                const dayBucket = last7Days.find(d => d.dateKey === sessionDate);
                if (dayBucket) {
                    dayBucket.exams += 1;
                    if (session.status === 'Flagged' || session.status === 'Terminated' || session.latest_log) {
                        dayBucket.alerts += 1;
                    }
                }
            });

            setChartData(last7Days);

            // --- Process Subject Performance ---
            const performanceMap = {};
            sessionsList.forEach(s => {
                // Include sessions if they have a percentage (or score)
                // Prefer 'percentage' if available (added to backend), else use 'score' (which might be raw)
                const valToUse = s.percentage !== undefined ? s.percentage : s.score;

                if ((s.status === 'Completed' || s.status === 'Flagged' || s.status === 'Terminated') && valToUse !== undefined && valToUse !== null) {
                    const scoreVal = Number(valToUse);
                    if (!isNaN(scoreVal)) {
                        const subject = s.exam_type || 'Unknown';
                        if (!performanceMap[subject]) {
                            performanceMap[subject] = { name: subject, totalScore: 0, count: 0 };
                        }
                        performanceMap[subject].totalScore += scoreVal;
                        performanceMap[subject].count += 1;
                    }
                }
            });

            const performanceData = Object.values(performanceMap).map(item => ({
                name: item.name,
                avgScore: Math.round(item.totalScore / item.count)
            }));
            setPerformanceData(performanceData);

        } catch (err) {
            console.error("Error loading dashboard data:", err);
            toast.error("Failed to load dashboard data");
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (sessionId) => {
        if (!window.confirm("Are you sure you want to delete this session? This cannot be undone.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Session deleted successfully");
                loadData(); // Reload data
            } else {
                toast.error("Failed to delete session");
            }
        } catch (err) {
            console.error("Error deleting session:", err);
            toast.error("Error deleting session");
        }
    };

    const statusData = [
        { name: 'Active', value: stats.active },
        { name: 'Flagged', value: stats.flagged },
        { name: 'Completed', value: stats.completed || 0 }
    ];

    const exportCSV = () => {
        if (!sessions.length) return;

        const headers = ["Session ID", "Candidate", "Exam Type", "Status", "Score", "Trust Score", "Latest Alert", "Date"];
        const csvRows = [headers.join(",")];

        sessions.forEach(s => {
            const row = [
                s.id,
                `"${s.student_name || s.studentName || 'Unknown'}"`,
                `"${s.exam_type || ''}"`,
                s.status,
                s.score || 0,
                s.trust_score || 100,
                `"${s.latest_log || ''}"`,
                s.created_at || ''
            ];
            csvRows.push(row.join(","));
        });

        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Activity Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Weekly Exam Activity</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="#fff" tick={{ fill: '#fff' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#fff" tick={{ fill: '#fff' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Bar dataKey="exams" name="Exams Conducted" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="alerts" name="Alerts Triggered" fill="var(--accent-alert)" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Subject Performance Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Subject Performance (Avg Score)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={performanceData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                            <XAxis type="number" stroke="#fff" tick={{ fill: '#fff' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" stroke="#fff" tick={{ fill: '#fff' }} axisLine={false} tickLine={false} width={100} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="avgScore" name="Average Score" fill="var(--accent-success)" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Distribution (Full Width) */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Overall Status Distribution</h3>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
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
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Suspicious Activity Feed */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-alert)' }}>
                    <ShieldAlert size={20} /> Suspicious Activity & At-Risk Sessions
                </h3>
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    {sessions.filter(s => (s.trust_score !== undefined && s.trust_score < 70) || s.status === 'Flagged' || s.status === 'Terminated' || !!s.latest_log).length > 0 ? (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {sessions
                                .filter(s => (s.trust_score !== undefined && s.trust_score < 70) || s.status === 'Flagged' || s.status === 'Terminated' || !!s.latest_log)
                                .map(session => (
                                    <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-alert)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShieldAlert size={16} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{session.student_name || 'Unknown Student'}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {session.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                background: 'rgba(244, 63, 94, 0.1)',
                                                color: 'var(--accent-alert)',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Trust Score: {session.trust_score !== undefined ? session.trust_score : 100}%
                                            </span>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {session.latest_log || (session.status === 'Terminated' ? 'Exam Terminated' : 'Flagged by System')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={32} style={{ color: 'var(--accent-success)', marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p>No suspicious activity detected.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Sessions Table */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Recent Sessions</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={exportCSV} className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={16} /> Export CSV
                        </button>
                        <button className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>View All</button>
                    </div>
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
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Actions</th>

                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(session => (
                                    <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-row">
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', opacity: 0.7 }}>
                                            {(session.id || "").toString().substring(0, 8)}...
                                        </td>
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
                                                        background: (session.latest_log || session.status === 'Flagged' || session.status === 'Terminated')
                                                            ? 'var(--accent-alert)'
                                                            : (session.trust_score !== undefined ? session.trust_score : 100) > 80 ? 'var(--accent-success)' : (session.trust_score || 100) > 50 ? 'var(--accent-warning)' : 'var(--accent-alert)'
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
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: 'var(--text-secondary)', padding: '0.5rem',
                                                    transition: 'color 0.2s'
                                                }}
                                                title="Delete Session"
                                                className="btn-icon-danger"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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
    <div className="glass-card" style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        background: 'var(--bg-secondary)'
    }}>
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
