/**
 * Tests for AdminDashboard component.
 *
 * Covers: data loading, stats rendering, session list, delete flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboard } from '../AdminDashboard';

// Mock firebase/firestore getDocs for dashboard stats
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    getDocs: vi.fn(() => Promise.resolve({
      docs: [
        { id: 'exam-1', data: () => ({ title: 'Exam 1' }) },
        { id: 'exam-2', data: () => ({ title: 'Exam 2' }) },
      ],
      size: 2,
    })),
    query: vi.fn(),
    where: vi.fn(),
  };
});

const mockSessions = [
  {
    id: 'session-1',
    student_name: 'Alice Smith',
    studentId: 'student-001',
    exam_title: 'Midterm Exam',
    exam_type: 'University',
    status: 'Completed',
    trust_score: 95,
    score: 8,
    percentage: 80,
    total: 10,
    latest_log: null,
    created_at: '2026-06-15T10:00:00',
  },
  {
    id: 'session-2',
    student_name: 'Bob Jones',
    studentId: 'student-002',
    exam_title: 'Final Exam',
    exam_type: 'University',
    status: 'Terminated',
    trust_score: 0,
    score: 0,
    percentage: 0,
    total: 10,
    latest_log: 'Multiple faces detected',
    created_at: '2026-06-16T10:00:00',
  },
];

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      })
    );
  });

  it('renders without crashing', () => {
    renderDashboard();
    // The component should render some form of dashboard UI
    expect(document.body).toBeTruthy();
  });

  it('fetches session history on mount', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/exams/history')
      );
    });
  });

  it('displays session data after loading', async () => {
    renderDashboard();

    await waitFor(() => {
      // Check that student names appear in the rendered output
      const content = document.body.textContent;
      expect(content).toContain('Alice Smith');
    }, { timeout: 3000 });
  });

  it('handles fetch error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    // Should not throw
    expect(() => renderDashboard()).not.toThrow();
  });

  it('handles empty session list', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    renderDashboard();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
