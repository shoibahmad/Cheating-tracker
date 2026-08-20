/**
 * Unit tests for Sidebar and Footer layout components.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Footer } from '../Footer';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'u1', email: 'test@admin.com' },
    role: 'admin',
    logout: vi.fn(),
  }),
}));

describe('Sidebar', () => {
  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('renders footer copyright and links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const matches = screen.getAllByText(/SecureEval/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
