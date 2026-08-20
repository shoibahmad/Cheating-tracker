"""
Sliding-window in-memory Rate Limiting Middleware for FastAPI.

Protects proctoring endpoints against brute-force attacks and denial-of-service.
Emits standard RFC rate limit headers:
- X-RateLimit-Limit
- X-RateLimit-Remaining
- X-RateLimit-Reset
- Retry-After
"""

import time
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding window in-memory rate limiter based on client IP.
    Default: 120 requests per 60-second window.
    """

    def __init__(self, app, max_requests: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._request_history: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Allow health and metrics checks without rate limiting
        if request.url.path in ("/health", "/api/health", "/docs", "/openapi.json"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        cutoff = now - self.window_seconds

        # Clean old timestamps
        history = [ts for ts in self._request_history[client_ip] if ts > cutoff]
        self._request_history[client_ip] = history

        if len(history) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - history[0])) if history else self.window_seconds
            return JSONResponse(
                status_code=429,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": f"Rate limit of {self.max_requests} requests per minute exceeded.",
                    "retry_after_seconds": max(1, retry_after),
                },
                headers={
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(now + retry_after)),
                    "Retry-After": str(max(1, retry_after)),
                },
            )

        # Record this request
        self._request_history[client_ip].append(now)
        remaining = self.max_requests - len(self._request_history[client_ip])

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        return response
