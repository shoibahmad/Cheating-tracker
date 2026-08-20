/**
 * Unit tests for SignupPage component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignupPage } from '../SignupPage';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    refreshUser: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    refreshUser: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
  }),
}));

describe('SignupPage', () => {
  it('renders student/admin registration form', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });
});
