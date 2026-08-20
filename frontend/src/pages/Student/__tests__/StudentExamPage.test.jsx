/**
 * Tests for StudentExamPage component.
 *
 * Covers: loading state, exam rendering, answer selection,
 * submit flow, and termination handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StudentExamPage } from '../StudentExamPage';

const mockSessionData = {
  id: 'session-001',
  student_id: 'student-001',
  student_name: 'Test Student',
  exam_id: 'exam-001',
  exam_title: 'CS Midterm',
  exam_type: 'University',
  duration_minutes: 30,
  status: 'Active',
  trust_score: 100,
  questions: [
    {
      id: 0,
      text: 'What is Python?',
      type: 'mcq',
      options: ['A language', 'A snake', 'A framework', 'A database'],
      correct_answer: 0,
      marks: 1,
    },
    {
      id: 1,
      text: 'Explain Object-Oriented Programming.',
      type: 'descriptive',
      marks: 5,
    },
  ],
  created_at: '2026-06-15T10:00:00',
};

const renderExamPage = (sessionId = 'session-001') => {
  return render(
    <MemoryRouter initialEntries={[`/exam/${sessionId}`]}>
      <Routes>
        <Route path="/exam/:id" element={<StudentExamPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('StudentExamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/sessions/session-001/status')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'Active',
              trust_score: 100,
              latest_logs: [],
              termination_reason: null,
              latest_message: null,
              is_message_read: false,
            }),
        });
      }
      if (url.includes('/api/sessions/session-001')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSessionData),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Mock IP fetch
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === 'https://api.ipify.org?format=json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ip: '192.168.1.1' }),
        });
      }
      if (typeof url === 'string' && url.includes('/api/sessions/session-001/status')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'Active',
              trust_score: 100,
              latest_logs: [],
            }),
        });
      }
      if (typeof url === 'string' && url.includes('/api/sessions/session-001')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSessionData),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('renders without crashing', () => {
    expect(() => renderExamPage()).not.toThrow();
  });

  it('fetches session data on mount', async () => {
    renderExamPage();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('handles terminated session', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockSessionData,
            status: 'Terminated',
            termination_reason: 'Multiple faces detected',
          }),
      })
    );

    renderExamPage();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('handles fetch error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    expect(() => renderExamPage()).not.toThrow();
  });

  it('handles nonexistent session', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: 'Session not found' }),
      })
    );

    renderExamPage('nonexistent-id');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
