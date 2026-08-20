"""
Anomaly detection and proctoring analytics module for SecureEval.

Calculates violation rates, trust velocity decay, and integrity risk levels.
"""

from datetime import UTC, datetime
from typing import Any


def calculate_trust_velocity(logs: list[dict[str, Any]], time_window_seconds: int = 60) -> float:
    """
    Calculate the rate of trust score drop per minute over the most recent time window.
    Returns negative or zero float representing trust point drop per minute.
    """
    if not logs or len(logs) < 2:
        return 0.0

    # Sort logs by timestamp
    valid_logs = []
    for log in logs:
        ts = log.get("timestamp")
        trust = log.get("trust_score")
        if ts is not None and trust is not None:
            if isinstance(ts, str):
                try:
                    ts_dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                except ValueError:
                    continue
            elif isinstance(ts, (int, float)):
                ts_dt = datetime.fromtimestamp(ts, tz=UTC)
            else:
                continue
            valid_logs.append((ts_dt, float(trust)))

    if len(valid_logs) < 2:
        return 0.0

    valid_logs.sort(key=lambda x: x[0])
    first_time, first_trust = valid_logs[0]
    last_time, last_trust = valid_logs[-1]

    duration_seconds = max((last_time - first_time).total_seconds(), 1.0)
    trust_delta = last_trust - first_trust  # typically negative if dropping

    rate_per_minute = (trust_delta / duration_seconds) * 60.0
    return round(rate_per_minute, 2)


def detect_burst_violations(
    logs: list[dict[str, Any]],
    burst_threshold: int = 3,
    window_seconds: int = 30
) -> bool:
    """
    Detect if multiple violations occurred in a very short time window.
    """
    if not logs or len(logs) < burst_threshold:
        return False

    timestamps = []
    for log in logs:
        ts = log.get("timestamp")
        if ts:
            if isinstance(ts, str):
                try:
                    ts_val = datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
                    timestamps.append(ts_val)
                except ValueError:
                    continue
            elif isinstance(ts, (int, float)):
                timestamps.append(float(ts))

    timestamps.sort()
    for i in range(len(timestamps) - burst_threshold + 1):
        if timestamps[i + burst_threshold - 1] - timestamps[i] <= window_seconds:
            return True

    return False


def compute_session_integrity_summary(
    session_data: dict[str, Any],
    logs: list[dict[str, Any]]
) -> dict[str, Any]:
    """
    Produce an automated integrity assessment based on trust score, logs, and velocity.
    """
    trust_score = float(session_data.get("trust_score", 100))
    violation_count = len(logs)
    has_burst = detect_burst_violations(logs)
    velocity = calculate_trust_velocity(logs)

    if trust_score < 40 or (has_burst and trust_score < 60):
        risk_level = "CRITICAL"
        recommendation = "Manual proctor audit required before grade certification."
    elif trust_score < 70 or violation_count >= 5:
        risk_level = "HIGH"
        recommendation = "Review recorded violation timestamps."
    elif trust_score < 85 or violation_count >= 2:
        risk_level = "MODERATE"
        recommendation = "Minor anomalies observed. Safe for automatic release if answers match."
    else:
        risk_level = "LOW"
        recommendation = "High exam integrity. No suspicious behavioral patterns."

    return {
        "risk_level": risk_level,
        "trust_score": trust_score,
        "violation_count": violation_count,
        "burst_violations_detected": has_burst,
        "trust_velocity_per_min": velocity,
        "recommendation": recommendation
    }
