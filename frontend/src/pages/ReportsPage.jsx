import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { BarChart, PieChart, Activity, Download } from 'lucide-react';
import { LoadingScreen } from '../components/Common/LoadingScreen';

export const ReportsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            // Simulate network delay for effect
            await new Promise(r => setTimeout(r, 800));
            try {
                const res = await fetch(`${API_BASE_URL}/api/reports`);
                if (res.ok) setData(await res.json());
                else throw new Error("Failed");
            } catch (e) {
                console.error("Backend offline, using fallback");
                setData({
                    malpractice_trends: [40, 65, 30, 80, 50, 20, 45],
                    alert_distribution: [
                        { label: "Face Not Found", value: 33, color: "alert" },
                        { label: "Tab Switching", value: 33, color: "primary" },
                        { label: "Audio Detected", value: 33, color: "success" },
                    ],
                    recent_incidents: [
                        { id: "1", desc: "Suspicious Eye Movement", student: "EX-101", time: "2 mins ago" },
                        { id: "2", desc: "Face Not Visible", student: "EX-102", time: "5 mins ago" },
                        { id: "3", desc: "Multiple Voices", student: "EX-103", time: "12 mins ago" },
                    ],
                    integrity_heatmap: [
                        { time: '0m', level: 10 }, { time: '5m', level: 15 }, { time: '10m', level: 40 }, 
                        { time: '15m', level: 20 }, { time: '20m', level: 80 }, { time: '25m', level: 30 }
                    ],
                    difficulty_analytics: [
                        { q: 'Q1', time: 45, difficulty: 'Easy' },
                        { q: 'Q2', time: 120, difficulty: 'Hard' },
                        { q: 'Q3', time: 80, difficulty: 'Medium' },
                        { q: 'Q4', time: 150, difficulty: 'Hard' },
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) return <LoadingScreen />;

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Analytics Reports</h2>
                    <p style={{ margin: 0 }}>Deep insights into examination integrity and performance.</p>
                </div>
                <button className="btn btn-secondary"><Download size={18} style={{ marginRight: '8px' }} /> Export PDF</button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 md:grid-cols-1" style={{ gap: '2rem' }}>
                {/* Malpractice Trends Chart */}
                <div className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Malpractice Trends</h3>
                        <BarChart size={20} style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem' }}>
                        {data.malpractice_trends.map((h, i) => (
                            <div key={i} style={{
                                flex: 1,
                                background: `rgba(99, 102, 241, ${0.4 + (i * 0.1)})`,
                                height: `${h}%`,
                                borderRadius: '4px 4px 0 0',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', bottom: '-25px', left: '0', right: '0', textAlign: 'center', fontSize: '0.75rem', opacity: 0.7 }}>
                                    Day {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alert Distribution Chart */}
                <div className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Alert Distribution</h3>
                        <PieChart size={20} style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                            width: '150px', height: '150px',
                            borderRadius: '50%',
                            background: 'conic-gradient(var(--accent-alert) 0deg 120deg, var(--accent-primary) 120deg 240deg, var(--accent-success) 240deg 360deg)',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', inset: '20px', background: 'var(--bg-primary)', borderRadius: '50%', opacity: 0.8 }}></div>
                        </div>
                        <div style={{ marginLeft: '2rem' }}>
                            {data.alert_distribution.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ width: '10px', height: '10px', background: `var(--accent-${item.color})`, borderRadius: '50%' }}></div>
                                    <span>{item.label} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 md:grid-cols-1" style={{ gap: '2rem', marginTop: '2rem' }}>
                {/* Integrity Heatmap */}
                <div className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Integrity Heatmap (Suspicion Level)</h3>
                        <Activity size={20} style={{ color: 'var(--accent-alert)' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        {data.integrity_heatmap.map((point, i) => (
                            <div key={i} style={{
                                flex: 1,
                                height: `${point.level}%`,
                                background: point.level > 50 ? 'var(--accent-alert)' : 'var(--accent-primary)',
                                borderRadius: '4px',
                                opacity: 0.6 + (point.level / 200)
                            }}></div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '8px', opacity: 0.5 }}>
                        <span>Start</span>
                        <span>Mid-Exam</span>
                        <span>Submit</span>
                    </div>
                </div>

                {/* Difficulty Analytics */}
                <div className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Question Difficulty Index</h3>
                        <BarChart size={20} style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {data.difficulty_analytics.map((item, i) => (
                            <div key={i} style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                    <span>{item.q} ({item.difficulty})</span>
                                    <span>Avg: {item.time}s</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: `${(item.time / 180) * 100}%`, 
                                        height: '100%', 
                                        background: item.difficulty === 'Hard' ? 'var(--accent-alert)' : 'var(--accent-success)' 
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ marginTop: '2rem' }}>
                <h3>Recent Incidents</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.recent_incidents.map(inc => (
                        <div key={inc.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: 'var(--accent-alert)' }}>
                                    <Activity size={16} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{inc.desc}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Student: {inc.student} • {inc.time}</div>
                                </div>
                            </div>
                            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Review</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
