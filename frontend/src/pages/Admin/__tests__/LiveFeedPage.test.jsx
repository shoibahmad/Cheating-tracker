/**
 * Unit & Integration tests for LiveFeedPage component.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LiveFeedPage } from '../LiveFeedPage';
import { examsService } from '../../../services/examsService';

vi.mock('../../../services/examsService', () => ({
  examsService: {
    getSessions: vi.fn(),
    terminateSession: vi.fn(),
    getSessionLogs: vi.fn(),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LiveFeedPage', () => {
  const mockSessions = [
    {
      id: 'sess-001',
      student_name: 'Alice Johnson',
      trust_score: 95,
      status: 'Active',
      latest_log: 'Face centered',
    },
    {
      id: 'sess-002',
      student_name: 'Bob Smith',
      trust_score: 35,
      status: 'Flagged',
      latest_log: 'Multiple faces detected',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially and then displays session cards', async () => {
    examsService.getSessions.mockResolvedValue(mockSessions);

    render(
      <MemoryRouter>
        <LiveFeedPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/INITIALIZING SYSTEM/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText(/FLAGGED/i)).toBeInTheDocument();
    });
  });

  it('filters sessions based on search input', async () => {
    examsService.getSessions.mockResolvedValue(mockSessions);

    render(
      <MemoryRouter>
        <LiveFeedPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search student.../i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
  });

  it('opens confirmation modal and terminates session on confirm', async () => {
    examsService.getSessions.mockResolvedValue(mockSessions);
    examsService.terminateSession.mockResolvedValue({ status: 'Terminated' });

    render(
      <MemoryRouter>
        <LiveFeedPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const terminateBtns = screen.getAllByRole('button', { name: /Terminate Exam/i });
    fireEvent.click(terminateBtns[0]);

    // Confirm modal opens
    expect(screen.getByText(/Terminate Exam\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Confirm Terminate/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(examsService.terminateSession).toHaveBeenCalledWith('sess-001');
    });
  });

  it('opens activity logs modal when clicking View Activity Logs', async () => {
    examsService.getSessions.mockResolvedValue(mockSessions);
    examsService.getSessionLogs.mockResolvedValue([
      { message: 'Tab switched', timestamp: '2026-08-20T10:00:00Z', type: 'warning' },
    ]);

    render(
      <MemoryRouter>
        <LiveFeedPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const logButtons = screen.getAllByRole('button', { name: /View Activity Logs/i });
    fireEvent.click(logButtons[0]);

    await waitFor(() => {
      expect(examsService.getSessionLogs).toHaveBeenCalledWith('sess-001');
      expect(screen.getByText(/Invocation Logs/i)).toBeInTheDocument();
      expect(screen.getByText(/Tab switched/i)).toBeInTheDocument();
    });
  });
});
