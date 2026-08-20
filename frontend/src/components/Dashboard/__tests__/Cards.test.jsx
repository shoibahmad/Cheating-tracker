/**
 * Unit tests for StatCard and LiveSessionCard components.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { LiveSessionCard } from '../LiveSessionCard';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Active Students" value="128" icon={Users} color="green" />);

    expect(screen.getByText('Active Students')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
  });
});

describe('LiveSessionCard', () => {
  it('renders session details, exam type, and trust score', () => {
    const onSelect = vi.fn();
    const session = {
      id: 'sess-card-1',
      student_name: 'Alice Smith',
      exam_type: 'University Exam',
      trust_score: 92,
      status: 'Active',
    };

    render(<LiveSessionCard session={session} onSelect={onSelect} />);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('University Exam')).toBeInTheDocument();
    expect(screen.getByText(/92% Trust/i)).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /View Live Feed/i });
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalled();
  });
});
