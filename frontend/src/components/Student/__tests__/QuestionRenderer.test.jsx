/**
 * Unit tests for QuestionRenderer component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionRenderer } from '../QuestionRenderer';

const mockMcqQuestion = {
  id: 0,
  text: 'What is FastAPI?',
  type: 'mcq',
  options: ['Web Framework', 'Database', 'Operating System', 'Browser'],
  marks: 2,
};

const mockDescriptiveQuestion = {
  id: 1,
  text: 'Explain dependency injection.',
  type: 'descriptive',
  marks: 5,
};

describe('QuestionRenderer', () => {
  it('renders MCQ question with all options', () => {
    render(
      <QuestionRenderer
        question={mockMcqQuestion}
        index={0}
        totalQuestions={2}
        answer={null}
        onAnswerChange={vi.fn()}
        onNext={vi.fn()}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('What is FastAPI?')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Web Framework')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
  });

  it('triggers onAnswerChange when option is selected', () => {
    const handleAnswer = vi.fn();
    render(
      <QuestionRenderer
        question={mockMcqQuestion}
        index={0}
        totalQuestions={2}
        answer={null}
        onAnswerChange={handleAnswer}
        onNext={vi.fn()}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const firstRadio = screen.getByDisplayValue('0');
    fireEvent.click(firstRadio);

    expect(handleAnswer).toHaveBeenCalledWith(0, 0);
  });

  it('renders textarea for descriptive questions', () => {
    const handleAnswer = vi.fn();
    render(
      <QuestionRenderer
        question={mockDescriptiveQuestion}
        index={1}
        totalQuestions={2}
        answer="Initial answer"
        onAnswerChange={handleAnswer}
        onNext={vi.fn()}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const textarea = screen.getByTestId('descriptive-input');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('Initial answer');

    fireEvent.change(textarea, { target: { value: 'Updated answer' } });
    expect(handleAnswer).toHaveBeenCalledWith(1, 'Updated answer');
  });

  it('renders Submit button on the final question', () => {
    render(
      <QuestionRenderer
        question={mockMcqQuestion}
        index={1}
        totalQuestions={2}
        answer={null}
        onAnswerChange={vi.fn()}
        onNext={vi.fn()}
        onPrev={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Submit Exam')).toBeInTheDocument();
  });
});
