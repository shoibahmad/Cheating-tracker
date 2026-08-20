/**
 * Admin Dashboard Page.
 * Displays overall platform metrics, Recharts visualizers, and session history management.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { DashboardCharts } from '../../components/Dashboard/DashboardCharts';
import { SessionHistoryTable } from '../../components/Dashboard/SessionHistoryTable';
import {
  calculateDashboardStats,
  computeStatusChartData,
  computePerformanceDistribution,
} from '../../utils/dashboardStats';
import { Users, ShieldAlert, FileText, Activity, Zap, MessageSquare } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { logger } from '../../utils/logger';

export const AdminDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageModalSessionId, setMessageModalSessionId] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');

  // --- Fetch Session Data ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/exams/history`);
      if (!res.ok) throw new Error('Failed to load session history');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.error('Error loading dashboard data', err);
      toast.error('Failed to load dashboard data');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Session Deletion ---
  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success('Session deleted');
    } catch (err) {
      logger.error('Error deleting session', err);
      toast.error('Failed to delete session');
    }
  };

  // --- Send Message to Active Session ---
  const handleSendMessage = async () => {
    if (!adminMessage.trim() || !messageModalSessionId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${messageModalSessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: adminMessage }),
      });
      if (!res.ok) throw new Error('Message sending failed');
      toast.success('Message broadcast to student');
      setAdminMessage('');
      setMessageModalSessionId(null);
    } catch (err) {
      logger.error('Error sending message', err);
      toast.error('Failed to send message');
    }
  };

  // --- Compute Stats and Chart Series ---
  const stats = calculateDashboardStats(sessions);
  const statusChartData = computeStatusChartData(sessions);
  const performanceData = computePerformanceDistribution(sessions);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>Proctoring Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Real-time monitoring analytics and examination logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/create-paper" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Create Exam
          </Link>
          <Link to="/admin/live-feed" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="#eab308" /> Live Feeds
          </Link>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Active Sessions</span>
            <Activity size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#60a5fa' }}>
            {stats.active}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Flagged / Terminated</span>
            <ShieldAlert size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#f87171' }}>
            {stats.flagged + stats.terminated}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Total Candidates</span>
            <Users size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#34d399' }}>
            {stats.total_students}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Avg Trust Score</span>
            <Zap size={20} color="#a855f7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#c084fc' }}>
            {stats.avg_trust}%
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts statusData={statusChartData} performanceData={performanceData} />

      {/* Session History Table */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Examination Sessions</h2>
        <SessionHistoryTable
          sessions={sessions}
          onDeleteSession={handleDeleteSession}
          onOpenMessageModal={(id) => setMessageModalSessionId(id)}
        />
      </div>

      {/* Admin Message Modal */}
      {messageModalSessionId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '450px', width: '100%', borderRadius: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} /> Send Proctor Warning
            </h3>
            <textarea
              rows={4}
              placeholder="Type message to display on candidate's screen..."
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                marginBottom: '1rem',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setMessageModalSessionId(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSendMessage}>
                Broadcast Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
