/**
 * Unit tests for Logo component.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '../Logo';

describe('Logo', () => {
  it('renders SecureEval logo title', () => {
    render(<Logo />);
    expect(screen.getByText('SecureEval')).toBeInTheDocument();
  });
});
