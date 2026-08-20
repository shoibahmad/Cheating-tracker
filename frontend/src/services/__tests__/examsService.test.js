/**
 * Unit tests for examsService data access and API client layer.
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

  describe('Firestore Helpers', () => {
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
  });

  describe('Session Management Endpoints', () => {
    it('getSessions fetches active sessions list', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'sess-1', student_name: 'Alice' }],
      });

      const data = await examsService.getSessions();
      expect(data).toHaveLength(1);
      expect(data[0].student_name).toBe('Alice');
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/sessions'));
    });

    it('getSession fetches single session details', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'sess-100', status: 'Active' }),
      });

      const session = await examsService.getSession('sess-100');
      expect(session.id).toBe('sess-100');
      expect(session.status).toBe('Active');
    });

    it('terminateSession posts termination request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Terminated' }),
      });

      const res = await examsService.terminateSession('sess-1');
      expect(res.status).toBe('Terminated');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions/sess-1/terminate'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('getSessionLogs fetches activity logs', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'log-1', message: 'Tab switched' }],
      });

      const logs = await examsService.getSessionLogs('sess-1');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Tab switched');
    });

    it('getSessionStatus fetches current status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Active', is_message_read: true }),
      });

      const status = await examsService.getSessionStatus('sess-1');
      expect(status.status).toBe('Active');
    });

    it('sendMessage posts admin message to session', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Message sent' }),
      });

      const res = await examsService.sendMessage('sess-1', 'Please look at the camera');
      expect(res.status).toBe('Message sent');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions/sess-1/message'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ message: 'Please look at the camera' }),
        })
      );
    });

    it('markMessageRead acknowledges session message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
      });

      const res = await examsService.markMessageRead('sess-1');
      expect(res.status).toBe('success');
    });

    it('deleteSession sends DELETE request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'deleted' }),
      });

      const res = await examsService.deleteSession('sess-1');
      expect(res.status).toBe('deleted');
    });

    it('submitExam posts student answers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Completed', score: 95 }),
      });

      const result = await examsService.submitExam('sess-1', { '0': '0' });
      expect(result.score).toBe(95);
    });

    it('logViolation logs proctoring incident', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'logged' }),
      });

      const result = await examsService.logViolation('sess-1', 'Multiple faces detected');
      expect(result.status).toBe('logged');
    });
  });

  describe('Student Management Endpoints', () => {
    it('getAdminStudents fetches student list', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'st-1', full_name: 'John Doe' }],
      });

      const students = await examsService.getAdminStudents();
      expect(students).toHaveLength(1);
      expect(students[0].full_name).toBe('John Doe');
    });

    it('createAdminStudent posts new student data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'st-new', full_name: 'Jane Doe' }),
      });

      const student = await examsService.createAdminStudent({ full_name: 'Jane Doe', email: 'jane@test.com' });
      expect(student.id).toBe('st-new');
    });

    it('updateAdminStudent sends PUT request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'st-1', full_name: 'Jane Updated' }),
      });

      const student = await examsService.updateAdminStudent('st-1', { full_name: 'Jane Updated' });
      expect(student.full_name).toBe('Jane Updated');
    });

    it('deleteAdminStudent sends DELETE request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'deleted' }),
      });

      const res = await examsService.deleteAdminStudent('st-1');
      expect(res.status).toBe('deleted');
    });
  });

  describe('AI & Question Papers', () => {
    it('getQuestionPapers fetches all papers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'qp-1', title: 'Biology Midterm' }],
      });

      const papers = await examsService.getQuestionPapers();
      expect(papers).toHaveLength(1);
      expect(papers[0].title).toBe('Biology Midterm');
    });

    it('generateQuestionsFromContent calls AI generation endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [{ text: 'Sample Question' }] }),
      });

      const res = await examsService.generateQuestionsFromContent('Photosynthesis text');
      expect(res.questions).toHaveLength(1);
    });

    it('handles non-ok API responses by throwing descriptive error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'Service Temporarily Unavailable' }),
      });

      await expect(examsService.getSessions()).rejects.toThrow('Service Temporarily Unavailable');
    });
  });
});
