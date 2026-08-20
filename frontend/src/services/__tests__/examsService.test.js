/**
 * Unit tests for examsService data access layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { examsService } from '../examsService';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-exam-123' }),
  getDocs: vi.fn().mockResolvedValue({
    docs: [
      { id: 'exam-1', data: () => ({ title: 'Math 101', subject: 'Mathematics' }) },
      { id: 'exam-2', data: () => ({ title: 'Physics Final', subject: 'Physics' }) },
    ],
  }),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn().mockReturnValue('MOCK_TIMESTAMP'),
}));

vi.mock('../../firebase', () => ({
  db: {},
}));

describe('examsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createPaper adds paper to exams collection and returns created doc', async () => {
    const paperData = {
      title: 'Chemistry Exam',
      subject: 'Science',
      questions: [{ text: 'What is H2O?', type: 'mcq' }],
    };

    const result = await examsService.createPaper(paperData, 'admin-user-1');

    expect(result.id).toBe('mock-exam-123');
    expect(result.title).toBe('Chemistry Exam');
    expect(result.totalQuestions).toBe(1);
    expect(result.createdBy).toBe('admin-user-1');
  });

  it('fetchPapers returns mapped list of papers', async () => {
    const papers = await examsService.fetchPapers();

    expect(papers).toHaveLength(2);
    expect(papers[0].id).toBe('exam-1');
    expect(papers[0].title).toBe('Math 101');
  });

  it('fetchStudents returns students list', async () => {
    const students = await examsService.fetchStudents();

    expect(students).toHaveLength(2);
  });

  it('assignExam handles successful bulk creation', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessions: [{ id: 'sess-1' }, { id: 'sess-2' }] }),
    });

    const bulkData = {
      studentIds: ['s1', 's2'],
      examId: 'exam-1',
      examTitle: 'Math 101',
      exam_type: 'University',
      duration_minutes: 45,
    };

    const result = await examsService.assignExam(bulkData);

    expect(result.sessions).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/sessions/bulk'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('assignExam throws error when server returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Invalid student list' }),
    });

    await expect(examsService.assignExam({ studentIds: [] })).rejects.toThrow('Invalid student list');
  });
});
