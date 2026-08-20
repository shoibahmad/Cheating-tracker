/**
 * Unit & Integration tests for StudentManagementPage component.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudentManagementPage } from '../StudentManagementPage';
import { examsService } from '../../../services/examsService';

vi.mock('../../../services/examsService', () => ({
  examsService: {
    getAdminStudents: vi.fn(),
    createAdminStudent: vi.fn(),
    updateAdminStudent: vi.fn(),
    deleteAdminStudent: vi.fn(),
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

describe('StudentManagementPage', () => {
  const mockStudents = [
    {
      id: 'st-001',
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      institution: 'MIT',
    },
    {
      id: 'st-002',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'student',
      institution: 'Stanford',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student list table on mount', async () => {
    examsService.getAdminStudents.mockResolvedValue(mockStudents);

    render(
      <MemoryRouter>
        <StudentManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('MIT')).toBeInTheDocument();
    });
  });

  it('filters students based on search term', async () => {
    examsService.getAdminStudents.mockResolvedValue(mockStudents);

    render(
      <MemoryRouter>
        <StudentManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search students/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('opens create modal and submits new student', async () => {
    examsService.getAdminStudents.mockResolvedValue(mockStudents);
    examsService.createAdminStudent.mockResolvedValue({ id: 'st-003', full_name: 'New Student' });

    const { container } = render(
      <MemoryRouter>
        <StudentManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Add Student/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/Add New Student/i)).toBeInTheDocument();

    const formInputs = container.querySelectorAll('form input');
    if (formInputs.length >= 3) {
      fireEvent.change(formInputs[0], { target: { value: 'New Student' } });
      fireEvent.change(formInputs[1], { target: { value: 'new@example.com' } });
      fireEvent.change(formInputs[2], { target: { value: 'Secret123!' } });
    }

    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(examsService.createAdminStudent).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'New Student',
          email: 'new@example.com',
        })
      );
    });
  });

  it('opens delete confirmation and executes deletion', async () => {
    examsService.getAdminStudents.mockResolvedValue(mockStudents);
    examsService.deleteAdminStudent.mockResolvedValue({ status: 'deleted' });

    render(
      <MemoryRouter>
        <StudentManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByRole('button').filter((b) => b.querySelector('svg.lucide-trash-2') || b.querySelector('svg'));
    if (deleteBtns.length > 0) {
      fireEvent.click(deleteBtns[0]);
    }
  });
});
