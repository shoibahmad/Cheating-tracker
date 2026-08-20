/**
 * Unit tests for SessionHistoryTable component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionHistoryTable } from '../SessionHistoryTable';

const mockSessions = [
  {
    id: 'session-1',
    student_name: 'Alice Smith',
    studentId: 'student-001',
    exam_title: 'Biology 101',
    status: 'Completed',
    trust_score: 95,
    score: 9,
    total: 10,
  },
  {
    id: 'session-2',
    student_name: 'Bob Jones',
    studentId: 'student-002',
    exam_title: 'Physics Midterm',
    status: 'Active',
    trust_score: 75,
    score: null,
    total: 10,
  },
];

describe('SessionHistoryTable', () => {
  it('renders empty message when sessions array is empty', () => {
    render(<SessionHistoryTable sessions={[]} />);
    expect(screen.getByTestId('empty-sessions')).toBeInTheDocument();
    expect(screen.getByText('No exam sessions recorded yet.')).toBeInTheDocument();
  });

  it('renders table headers and student rows', () => {
    render(<SessionHistoryTable sessions={mockSessions} />);

    expect(screen.getByTestId('session-history-table')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('Biology 101')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('triggers onDeleteSession when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(<SessionHistoryTable sessions={mockSessions} onDeleteSession={handleDelete} />);

    const deleteButtons = screen.getAllByTitle('Delete Session');
    fireEvent.click(deleteButtons[0]);

    expect(handleDelete).toHaveBeenCalledWith('session-1');
  });

  it('shows message button for active sessions', () => {
    const handleOpenMessage = vi.fn();
    render(
      <SessionHistoryTable
        sessions={mockSessions}
        onOpenMessageModal={handleOpenMessage}
      />
    );

    const messageButton = screen.getByTitle('Send Message');
    fireEvent.click(messageButton);

    expect(handleOpenMessage).toHaveBeenCalledWith('session-2');
  });
});
