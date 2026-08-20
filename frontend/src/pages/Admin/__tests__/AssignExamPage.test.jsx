/**
 * Unit & Integration tests for AssignExamPage component.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AssignExamPage } from '../AssignExamPage';
import { examsService } from '../../../services/examsService';

vi.mock('../../../services/examsService', () => ({
  examsService: {
    fetchPapers: vi.fn(),
    fetchStudents: vi.fn(),
    assignExam: vi.fn(),
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

describe('AssignExamPage', () => {
  const mockPapers = [
    { id: 'paper-1', title: 'Data Structures Final', subject: 'CS', totalQuestions: 20 },
    { id: 'paper-2', title: 'Calculus Midterm', subject: 'Math', totalQuestions: 15 },
  ];

  const mockStudents = [
    { id: 'st-1', full_name: 'Alice Johnson', email: 'alice@test.com', institution: 'MIT' },
    { id: 'st-2', full_name: 'Bob Smith', email: 'bob@test.com', institution: 'Harvard' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders papers and students on load', async () => {
    examsService.fetchPapers.mockResolvedValue(mockPapers);
    examsService.fetchStudents.mockResolvedValue(mockStudents);

    render(
      <MemoryRouter>
        <AssignExamPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });
  });

  it('allows selecting students and paper and assigning exam', async () => {
    examsService.fetchPapers.mockResolvedValue(mockPapers);
    examsService.fetchStudents.mockResolvedValue(mockStudents);
    examsService.assignExam.mockResolvedValue({
      sessions: [
        { id: 'sess-101', student_name: 'Alice Johnson', unlock_token: 'TOK123', email: 'alice@test.com' },
      ],
    });

    const { container } = render(
      <MemoryRouter>
        <AssignExamPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    // Click student card to select
    const studentCard = screen.getByText('Alice Johnson');
    fireEvent.click(studentCard);

    // Select paper
    const paperSelect = container.querySelector('select[required]');
    if (paperSelect) {
      fireEvent.change(paperSelect, { target: { value: 'paper-1' } });
    }

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Generate Session ID/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(examsService.assignExam).toHaveBeenCalledWith(
        expect.objectContaining({
          examId: 'paper-1',
          studentIds: ['st-1'],
        })
      );
      expect(screen.getByText(/Exams Assigned Successfully/i)).toBeInTheDocument();
    });
  });
});
