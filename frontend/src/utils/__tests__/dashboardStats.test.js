/**
 * Unit tests for dashboardStats calculation functions.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDashboardStats,
  computeStatusChartData,
  computePerformanceDistribution,
} from '../dashboardStats';

describe('calculateDashboardStats', () => {
  it('returns default zero stats for empty sessions array', () => {
    const stats = calculateDashboardStats([]);
    expect(stats.active).toBe(0);
    expect(stats.flagged).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.total_students).toBe(0);
    expect(stats.avg_trust).toBe(100);
  });

  it('accurately counts statuses and computes averages', () => {
    const mockSessions = [
      { id: '1', status: 'Completed', student_id: 's1', exam_id: 'e1', score: 8, total: 10, trust_score: 100 },
      { id: '2', status: 'Active', student_id: 's2', exam_id: 'e1', score: null, trust_score: 90 },
      { id: '3', status: 'Flagged', student_id: 's1', exam_id: 'e2', score: 4, total: 10, trust_score: 60 },
      { id: '4', status: 'Terminated', student_id: 's3', exam_id: 'e2', score: 0, total: 10, trust_score: 0 },
    ];

    const stats = calculateDashboardStats(mockSessions);
    expect(stats.completed).toBe(1);
    expect(stats.active).toBe(1);
    expect(stats.flagged).toBe(1);
    expect(stats.terminated).toBe(1);
    expect(stats.total_students).toBe(3); // s1, s2, s3
    expect(stats.total_exams).toBe(2); // e1, e2
    expect(stats.avg_score).toBe(4); // (8 + 4 + 0) / 3 = 4
    expect(stats.avg_trust).toBe(63); // (100+90+60+0)/4 = 62.5 -> 63
  });
});

describe('computeStatusChartData', () => {
  it('formats data array for Recharts pie chart', () => {
    const mockSessions = [
      { status: 'Completed' },
      { status: 'Active' },
      { status: 'Flagged' },
    ];

    const chartData = computeStatusChartData(mockSessions);
    expect(chartData).toHaveLength(3);
    expect(chartData.find((d) => d.name === 'Completed').value).toBe(1);
    expect(chartData.find((d) => d.name === 'Active').value).toBe(1);
  });
});

describe('computePerformanceDistribution', () => {
  it('categorizes scores into performance ranges', () => {
    const mockSessions = [
      { score: 9.5, total: 10, percentage: 95 },
      { score: 8, total: 10, percentage: 80 },
      { score: 6, total: 10, percentage: 60 },
      { score: 3, total: 10, percentage: 30 },
    ];

    const dist = computePerformanceDistribution(mockSessions);
    expect(dist.find((d) => d.range === '90-100%').count).toBe(1);
    expect(dist.find((d) => d.range === '75-89%').count).toBe(1);
    expect(dist.find((d) => d.range === '50-74%').count).toBe(1);
    expect(dist.find((d) => d.range === '<50%').count).toBe(1);
  });
});
