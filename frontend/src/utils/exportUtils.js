/**
 * Utility functions for exporting session and exam records to downloadable CSV and JSON.
 */

export const convertSessionsToCSV = (sessions = []) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return 'Session ID,Student Name,Exam Title,Status,Trust Score,Score\n';
  }

  const headers = ['Session ID', 'Student Name', 'Exam Title', 'Status', 'Trust Score', 'Score'];
  const rows = sessions.map((s) => [
    `"${s.id || ''}"`,
    `"${s.student_name || ''}"`,
    `"${s.exam_title || ''}"`,
    `"${s.status || ''}"`,
    s.trust_score ?? 100,
    s.score ?? 0,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

export const downloadBlob = (content, filename, contentType = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
