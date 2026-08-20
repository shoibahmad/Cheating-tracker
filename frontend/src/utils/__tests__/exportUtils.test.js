/**
 * Unit tests for exportUtils helper.
 */

import { describe, it, expect } from 'vitest';
import { convertSessionsToCSV } from '../exportUtils';

describe('convertSessionsToCSV', () => {
  it('returns header row when sessions array is empty', () => {
    const csv = convertSessionsToCSV([]);
    expect(csv).toContain('Session ID,Student Name,Exam Title,Status,Trust Score,Score');
  });

  it('formats sessions as comma-separated values', () => {
    const mockSessions = [
      {
        id: 'sess-123',
        student_name: 'John Doe',
        exam_title: 'Math Final',
        status: 'Completed',
        trust_score: 95,
        score: 8.5,
      },
    ];

    const csv = convertSessionsToCSV(mockSessions);
    expect(csv).toContain('"sess-123"');
    expect(csv).toContain('"John Doe"');
    expect(csv).toContain('"Math Final"');
    expect(csv).toContain('95');
    expect(csv).toContain('8.5');
  });
});
