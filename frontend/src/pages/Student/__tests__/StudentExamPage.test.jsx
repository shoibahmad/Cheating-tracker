/**
 * Unit & Integration tests for StudentExamPage component.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StudentExamPage } from '../StudentExamPage';
import { useExamSession } from '../../../hooks/useExamSession';

vi.mock('../../../hooks/useExamSession', () => ({
  useExamSession: vi.fn(),
}));

vi.mock('../../../components/Student/ProctoringMonitor', () => ({
  ProctoringMonitor: () => <div data-testid="proctoring-monitor">Proctoring Monitor</div>,
}));

vi.mock('../../../components/Student/PreCheckOverlay', () => ({
  PreCheckOverlay: ({ onStart, examTitle }) => (
    <div data-testid="precheck-overlay">
      <h2>PreCheck: {examTitle}</h2>
      <button onClick={() => onStart(null)}>Start Exam Now</button>
    </div>
  ),
}));

describe('StudentExamPage', () => {
  const mockQuestions = [
    {
      id: 'q1',
      text: 'What is React?',
      type: 'mcq',
      options: ['A library', 'A framework', 'A database', 'An OS'],
    },
    {
      id: 'q2',
      text: 'Explain Virtual DOM',
      type: 'descriptive',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when exam session is loading', () => {
    useExamSession.mockReturnValue({
      loading: true,
    });

    render(
      <MemoryRouter initialEntries={['/exam/sess-123']}>
        <Routes>
          <Route path="/exam/:id" element={<StudentExamPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/INITIALIZING SYSTEM/i)).toBeInTheDocument();
  });

  it('shows pre-check overlay before exam starts', () => {
    useExamSession.mockReturnValue({
      loading: false,
      examTitle: 'JavaScript Assessment',
      questions: mockQuestions,
      answers: {},
      timeLeft: 1800,
      terminated: false,
      result: null,
      handleAnswerChange: vi.fn(),
      executeSubmit: vi.fn(),
      handleViolation: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/exam/sess-123']}>
        <Routes>
          <Route path="/exam/:id" element={<StudentExamPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('precheck-overlay')).toBeInTheDocument();
    expect(screen.getByText('PreCheck: JavaScript Assessment')).toBeInTheDocument();
  });

  it('navigates to questions after pre-check passes', async () => {
    const handleAnswerChange = vi.fn();
    const executeSubmit = vi.fn();

    useExamSession.mockReturnValue({
      loading: false,
      examTitle: 'JavaScript Assessment',
      questions: mockQuestions,
      answers: {},
      timeLeft: 1800,
      terminated: false,
      result: null,
      handleAnswerChange,
      executeSubmit,
      handleViolation: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/exam/sess-123']}>
        <Routes>
          <Route path="/exam/:id" element={<StudentExamPage />} />
        </Routes>
      </MemoryRouter>
    );

    const startBtn = screen.getByRole('button', { name: /Start Exam Now/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
      expect(screen.getByTestId('proctoring-monitor')).toBeInTheDocument();
    });
  });

  it('renders terminated screen when session is terminated', () => {
    useExamSession.mockReturnValue({
      loading: false,
      examTitle: 'JavaScript Assessment',
      terminated: true,
      terminationReason: 'Multiple unauthorized objects detected',
      result: null,
    });

    render(
      <MemoryRouter initialEntries={['/exam/sess-123']}>
        <Routes>
          <Route path="/exam/:id" element={<StudentExamPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Exam Terminated/i)).toBeInTheDocument();
    expect(screen.getByText(/Multiple unauthorized objects detected/i)).toBeInTheDocument();
  });
});
