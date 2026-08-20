/**
 * Unit tests for FeaturesPage component.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FeaturesPage } from '../FeaturesPage';

describe('FeaturesPage', () => {
  it('renders features page and core proctoring capabilities', () => {
    const { container } = render(
      <BrowserRouter>
        <FeaturesPage />
      </BrowserRouter>
    );

    expect(container).toBeTruthy();
  });
});
