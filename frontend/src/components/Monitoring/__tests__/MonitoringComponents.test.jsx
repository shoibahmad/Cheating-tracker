/**
 * Unit tests for monitoring subcomponents (WebcamFeed, AlertLogFeed, TerminationModal).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminationModal } from '../TerminationModal';
import { AlertLogFeed } from '../AlertLogFeed';
import { WebcamFeed } from '../WebcamFeed';

describe('TerminationModal', () => {
  it('does not render when show is false', () => {
    const { container } = render(<TerminationModal show={false} reason="Cheat" onBack={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders termination reason and back button when show is true', () => {
    const onBack = vi.fn();
    render(<TerminationModal show={true} reason="Multiple faces detected" onBack={onBack} />);

    expect(screen.getByText('SESSION TERMINATED')).toBeInTheDocument();
    expect(screen.getByText('Multiple faces detected')).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /Return to Dashboard/i });
    fireEvent.click(btn);
    expect(onBack).toHaveBeenCalled();
  });
});

describe('AlertLogFeed', () => {
  it('renders trust score and alerts list', () => {
    render(<AlertLogFeed score={85} logs={['Multiple faces', 'Looking away']} onSimulateCheat={vi.fn()} />);

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Multiple faces')).toBeInTheDocument();
    expect(screen.getByText('Looking away')).toBeInTheDocument();
  });

  it('triggers onSimulateCheat when button clicked', () => {
    const onSim = vi.fn();
    render(<AlertLogFeed score={100} logs={[]} onSimulateCheat={onSim} />);

    const btn = screen.getByRole('button', { name: /Test Violation Trigger/i });
    fireEvent.click(btn);
    expect(onSim).toHaveBeenCalled();
  });
});

describe('WebcamFeed', () => {
  it('renders candidate overlay and handles alertState', () => {
    const fakeRef = { current: null };
    const session = { student_name: 'John Doe', id: 'sess-123' };

    const { rerender } = render(<WebcamFeed videoRef={fakeRef} alertState={false} session={session} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText(/ANOMALY DETECTED/i)).not.toBeInTheDocument();

    rerender(<WebcamFeed videoRef={fakeRef} alertState={true} session={session} />);
    expect(screen.getByText(/ANOMALY DETECTED/i)).toBeInTheDocument();
  });
});
