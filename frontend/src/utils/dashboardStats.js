/**
 * Pure utility functions for calculating Admin Dashboard metrics and chart datasets.
 */

export const calculateDashboardStats = (sessions = []) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      active: 0,
      flagged: 0,
      completed: 0,
      terminated: 0,
      total_students: 0,
      avg_score: 0,
      avg_trust: 100,
      total_exams: 0,
    };
  }

  let activeCount = 0;
  let flaggedCount = 0;
  let completedCount = 0;
  let terminatedCount = 0;
  let totalScoreSum = 0;
  let totalTrustSum = 0;
  let scoreCount = 0;

  const studentSet = new Set();
  const examSet = new Set();

  sessions.forEach((s) => {
    if (s.status === 'Active') activeCount++;
    if (s.status === 'Flagged') flaggedCount++;
    if (s.status === 'Completed') completedCount++;
    if (s.status === 'Terminated') terminatedCount++;

    if (s.studentId || s.student_id) {
      studentSet.add(s.studentId || s.student_id);
    }
    if (s.examId || s.exam_id) {
      examSet.add(s.examId || s.exam_id);
    }

    if (s.score !== undefined && s.score !== null) {
      totalScoreSum += Number(s.score);
      scoreCount++;
    }

    totalTrustSum += Number(s.trust_score ?? 100);
  });

  return {
    active: activeCount,
    flagged: flaggedCount,
    completed: completedCount,
    terminated: terminatedCount,
    total_students: studentSet.size,
    avg_score: scoreCount > 0 ? Math.round((totalScoreSum / scoreCount) * 10) / 10 : 0,
    avg_trust: sessions.length > 0 ? Math.round(totalTrustSum / sessions.length) : 100,
    total_exams: examSet.size,
  };
};

export const computeStatusChartData = (sessions = []) => {
  const stats = calculateDashboardStats(sessions);
  return [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Active', value: stats.active, color: '#3b82f6' },
    { name: 'Flagged / Terminated', value: stats.flagged + stats.terminated, color: '#ef4444' },
  ];
};

export const computePerformanceDistribution = (sessions = []) => {
  const buckets = {
    '90-100%': 0,
    '75-89%': 0,
    '50-74%': 0,
    '<50%': 0,
  };

  sessions.forEach((s) => {
    const percentage = s.percentage ?? (s.total > 0 ? (s.score / s.total) * 100 : null);
    if (percentage === null) return;

    if (percentage >= 90) buckets['90-100%']++;
    else if (percentage >= 75) buckets['75-89%']++;
    else if (percentage >= 50) buckets['50-74%']++;
    else buckets['<50%']++;
  });

  return Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
  }));
};
