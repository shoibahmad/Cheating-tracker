/**
 * Unit tests for structured logger.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('logs info messages to console.info', () => {
    logger.info('User logged in', { userId: '123' });
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] User logged in'),
      expect.objectContaining({ userId: '123' })
    );
  });

  it('logs warnings to console.warn', () => {
    logger.warn('Token expiring soon');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN] Token expiring soon'),
      {}
    );
  });

  it('logs errors with Error object metadata formatting', () => {
    const error = new Error('Database connection failed');
    logger.error('Failed operation', error);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] Failed operation'),
      expect.objectContaining({
        level: 'ERROR',
        message: 'Failed operation',
        errorMessage: 'Database connection failed',
      })
    );
  });
});
