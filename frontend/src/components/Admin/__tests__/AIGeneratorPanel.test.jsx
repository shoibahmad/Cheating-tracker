/**
 * Unit tests for AIGeneratorPanel component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIGeneratorPanel } from '../AIGeneratorPanel';
import { examsService } from '../../../services/examsService';

vi.mock('../../../services/examsService', () => ({
  examsService: {
    generateQuestionsFromContent: vi.fn(),
  },
}));

describe('AIGeneratorPanel', () => {
  it('renders prompt textarea and generate button', () => {
    render(<AIGeneratorPanel onQuestionsGenerated={vi.fn()} />);

    expect(screen.getByText('AI Question Generator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate with AI/i })).toBeInTheDocument();
  });

  it('triggers onQuestionsGenerated when AI service returns questions', async () => {
    const mockCallback = vi.fn();
    const mockTitleCallback = vi.fn();

    examsService.generateQuestionsFromContent.mockResolvedValueOnce({
      title: 'Generated Physics',
      questions: [{ text: 'What is light?', type: 'mcq', options: ['A', 'B', 'C', 'D'], correct_answer: 0 }],
    });

    render(<AIGeneratorPanel onQuestionsGenerated={mockCallback} onTitleGenerated={mockTitleCallback} />);

    const textarea = screen.getByPlaceholderText(/Paste textbook content/i);
    fireEvent.change(textarea, { target: { value: 'Light is electromagnetic radiation.' } });

    const btn = screen.getByRole('button', { name: /Generate with AI/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
      expect(mockTitleCallback).toHaveBeenCalledWith('Generated Physics');
    });
  });
});
