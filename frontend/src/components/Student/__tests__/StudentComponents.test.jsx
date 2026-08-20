/**
 * Unit tests for PreCheckOverlay component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreCheckOverlay } from '../PreCheckOverlay';

describe('PreCheckOverlay', () => {
  it('renders pre-check verification steps and title', () => {
    render(<PreCheckOverlay examTitle="Final Exam" onStart={vi.fn()} />);

    expect(screen.getByText('Webcam feed')).toBeInTheDocument();
    expect(screen.getByText('System Check')).toBeInTheDocument();
  });
});
