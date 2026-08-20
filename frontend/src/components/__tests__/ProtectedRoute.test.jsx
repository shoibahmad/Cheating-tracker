/**
 * Tests for ProtectedRoute component.
 *
 * Covers: authenticated access, unauthenticated redirect,
 * and role-based authorization restrictions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

const ProtectedContent = () => <div data-testid="protected-content">Protected Content</div>;
const LoginContent = () => <div data-testid="login-page">Login Page</div>;
const DashboardContent = () => <div data-testid="dashboard-page">Dashboard Page</div>;

const renderWithRouter = (initialRoute = '/protected', allowedRoles = []) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<LoginContent />} />
        <Route path="/dashboard" element={<DashboardContent />} />
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/protected" element={<ProtectedContent />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users (no token) to /login', () => {
    renderWithRouter('/protected');

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders protected route for authenticated users with valid token', () => {
    localStorage.setItem('token', 'mock-valid-jwt-token');
    localStorage.setItem('role', 'student');

    renderWithRouter('/protected');

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('redirects unauthorized role to /dashboard', () => {
    localStorage.setItem('token', 'mock-valid-jwt-token');
    localStorage.setItem('role', 'student');

    renderWithRouter('/protected', ['admin']);

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('allows access when role matches allowedRoles', () => {
    localStorage.setItem('token', 'mock-valid-jwt-token');
    localStorage.setItem('role', 'admin');

    renderWithRouter('/protected', ['admin']);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
