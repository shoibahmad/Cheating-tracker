/**
 * Unit tests for DashboardPage component.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';

describe('DashboardPage', () => {
  it('renders student dashboard overview', () => {
    const { container } = render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(container).toBeTruthy();
  });
});
