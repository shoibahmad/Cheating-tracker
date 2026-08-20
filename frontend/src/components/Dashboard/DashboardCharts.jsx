/**
 * Recharts visualization panel for session status breakdown and performance distribution.
 */

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardCharts = ({ statusData = [], performanceData = [] }) => {
  const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

  return (
    <div
      data-testid="dashboard-charts"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      {/* 1. Status Distribution Pie Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Session Integrity Status
        </h3>
        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem' }}>
          {statusData.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
              <span>
                {d.name}: {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Score Performance Bar Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Score Distribution
        </h3>
        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
