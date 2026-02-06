// Centralized API Configuration
// When deployed (PROD), use relative path to hit the same domain.
// When local (DEV), use the deployed backend URL to ensure reliability if local backend is not running.
// You can change the DEV URL to 'http://localhost:8000' if you want to test with local backend.

export const API_BASE_URL = import.meta.env.PROD
    ? ""
    : "http://localhost:8000";
