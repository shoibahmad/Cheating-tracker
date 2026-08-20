/**
 * Unit tests for useExamSession hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExamSession } from '../useExamSession';

const mockSession = {
  id: 'session-001',
  student_name: 'Alice',
  exam_title: 'Math Final',
  duration_minutes: 45,
  status: 'Active',
  trust_score: 95,
  questions: [
    { id: 0, text: '2+2?', type: 'mcq', options: ['3', '4', '5'], correct_answer: 1 },
  ],
};

describe('useExamSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/sessions/session-001/status')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'Active',
              trust_score: 95,
              latest_message: null,
              is_message_read: true,
            }),
        });
      }
      if (url.includes('/api/sessions/session-001')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSession),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('fetches and initializes exam session data', async () => {
    const { result } = renderHook(() => useExamSession('session-001', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.examTitle).toBe('Math Final');
    expect(result.current.questions).toHaveLength(1);
    expect(result.current.timeLeft).toBe(45 * 60);
  });

  it('updates answer map on handleAnswerChange', async () => {
    const { result } = renderHook(() => useExamSession('session-001', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAnswerChange(0, 1);
    });

    expect(result.current.answers[0]).toBe(1);
  });

  it('handles unlockExam token validation', async () => {
    const { result } = renderHook(() => useExamSession('session-001', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success;
    act(() => {
      success = result.current.unlockExam('valid-token');
    });

    expect(result.current.isLocked).toBe(false);
  });
});
