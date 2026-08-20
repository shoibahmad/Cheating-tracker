/**
 * Unit tests for MobileRestriction component.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileRestriction } from '../MobileRestriction';

describe('MobileRestriction', () => {
  it('renders mobile restriction message explaining desktop requirement', () => {
    render(
      <BrowserRouter>
        <MobileRestriction />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Laptop or Tablet Required/i);
    expect(screen.getByText(/Why is this restricted/i)).toBeInTheDocument();
  });
});
