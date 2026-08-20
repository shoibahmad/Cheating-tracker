/**
 * Unit tests for QuestionEditorForm component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionEditorForm } from '../QuestionEditorForm';

describe('QuestionEditorForm', () => {
  it('renders question items with option inputs', () => {
    const mockQuestions = [
      { id: 'q1', type: 'mcq', text: 'Sample Question', options: ['A', 'B', 'C', 'D'], correct_answer: 0 },
    ];

    render(<QuestionEditorForm questions={mockQuestions} setQuestions={vi.fn()} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sample Question')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
  });

  it('calls setQuestions when adding a new question', () => {
    const setQuestions = vi.fn();
    const mockQuestions = [
      { id: 'q1', type: 'mcq', text: 'Q1', options: ['1', '2', '3', '4'], correct_answer: 0 },
    ];

    render(<QuestionEditorForm questions={mockQuestions} setQuestions={setQuestions} />);

    const addBtn = screen.getByRole('button', { name: /Add Question/i });
    fireEvent.click(addBtn);

    expect(setQuestions).toHaveBeenCalled();
  });
});
