/**
 * Unit tests for BackButton component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BackButton } from '../BackButton';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BackButton', () => {
  it('renders default label and navigates back on click', () => {
    render(
      <BrowserRouter>
        <BackButton />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /Back to Dashboard/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('navigates to custom route when `to` prop is specified', () => {
    render(
      <BrowserRouter>
        <BackButton to="/admin/papers" label="Back to Papers" />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /Back to Papers/i });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/papers');
  });
});
