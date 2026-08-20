/**
 * Unit tests for AboutPage component.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AboutPage } from '../AboutPage';

describe('AboutPage', () => {
  it('renders about page content and mission statement', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/EXAM INTEGRITY/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Behavioral Forensics/i).length).toBeGreaterThan(0);
  });
});
