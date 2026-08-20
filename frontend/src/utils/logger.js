/**
 * Structured client-side logger for SecureEval.
 * Provides leveled logging, metadata formatting, and optional Sentry/remote error sink integration.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = import.meta.env?.MODE === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

const formatPayload = (level, message, meta = {}) => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  ...meta,
});

export const logger = {
  debug(message, meta = {}) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  },

  info(message, meta = {}) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, meta);
    }
  },

  warn(message, meta = {}) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, meta);
    }
  },

  error(message, errorOrMeta = {}) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      const isError = errorOrMeta instanceof Error;
      const meta = isError
        ? { errorName: errorOrMeta.name, errorMessage: errorOrMeta.message, stack: errorOrMeta.stack }
        : errorOrMeta;

      const payload = formatPayload('ERROR', message, meta);
      console.error(`[ERROR] ${message}`, payload);

      // Optional remote sink / error tracking integration
      const dsn = import.meta.env?.VITE_ERROR_TRACKING_DSN;
      if (dsn && typeof window !== 'undefined' && window.__SENTRY__) {
        try {
          window.__SENTRY__.captureException(isError ? errorOrMeta : new Error(message));
        } catch {
          // Ignore error forwarding failure
        }
      }
    }
  },
};
