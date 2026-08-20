/**
 * Unit tests for ErrorBoundary component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

const FaultyComponent = () => {
  throw new Error('Test crash in child component');
};

const SafeComponent = () => <div>All Good!</div>;

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('All Good!')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <FaultyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Something went wrong/i);
    spy.mockRestore();
  });
});
