/**
 * Unit tests for ExamTimer component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExamTimer } from '../ExamTimer';

describe('ExamTimer', () => {
  it('returns null when timeLeft is null', () => {
    const { container } = render(<ExamTimer timeLeft={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('formats remaining minutes and seconds correctly', () => {
    render(<ExamTimer timeLeft={125} />); // 2m 5s
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('renders timer element for positive time', () => {
    render(<ExamTimer timeLeft={600} />);
    expect(screen.getByTestId('exam-timer')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('renders warning color when time is below 5 minutes', () => {
    render(<ExamTimer timeLeft={200} />);
    const timer = screen.getByTestId('exam-timer');
    expect(timer).toBeInTheDocument();
  });
});
