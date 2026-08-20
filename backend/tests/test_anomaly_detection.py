"""
Unit tests for the proctoring anomaly detection module.
"""

from backend.app.anomaly_detection import (
    calculate_trust_velocity,
    compute_session_integrity_summary,
    detect_burst_violations,
)


class TestAnomalyDetection:
    """Tests for anomaly detection and trust decay analytics."""

    def test_trust_velocity_empty_or_single_log(self):
        assert calculate_trust_velocity([]) == 0.0
        assert calculate_trust_velocity([{"timestamp": "2026-02-01T10:00:00Z", "trust_score": 100}]) == 0.0

    def test_trust_velocity_steady_decay(self):
        logs = [
            {"timestamp": "2026-02-01T10:00:00Z", "trust_score": 100},
            {"timestamp": "2026-02-01T10:01:00Z", "trust_score": 80},  # 20 points drop in 60s
        ]
        velocity = calculate_trust_velocity(logs)
        assert velocity == -20.0

    def test_trust_velocity_with_numeric_timestamps(self):
        logs = [
            {"timestamp": 1700000000, "trust_score": 100},
            {"timestamp": 1700000030, "trust_score": 90},  # 10 drop in 30s -> -20/min
        ]
        velocity = calculate_trust_velocity(logs)
        assert velocity == -20.0

    def test_burst_violations_empty(self):
        assert not detect_burst_violations([])
        assert not detect_burst_violations([{"timestamp": "2026-02-01T10:00:00Z"}])

    def test_burst_violations_detected(self):
        logs = [
            {"timestamp": "2026-02-01T10:00:00Z"},
            {"timestamp": "2026-02-01T10:00:05Z"},
            {"timestamp": "2026-02-01T10:00:10Z"},
        ]
        assert detect_burst_violations(logs, burst_threshold=3, window_seconds=15) is True

    def test_burst_violations_spaced_out(self):
        logs = [
            {"timestamp": "2026-02-01T10:00:00Z"},
            {"timestamp": "2026-02-01T10:02:00Z"},
            {"timestamp": "2026-02-01T10:04:00Z"},
        ]
        assert detect_burst_violations(logs, burst_threshold=3, window_seconds=30) is False

    def test_integrity_summary_low_risk(self):
        summary = compute_session_integrity_summary(
            {"trust_score": 98},
            [{"timestamp": "2026-02-01T10:00:00Z", "trust_score": 98}]
        )
        assert summary["risk_level"] == "LOW"
        assert summary["burst_violations_detected"] is False

    def test_integrity_summary_moderate_risk(self):
        summary = compute_session_integrity_summary(
            {"trust_score": 80},
            [
                {"timestamp": "2026-02-01T10:00:00Z", "trust_score": 90},
                {"timestamp": "2026-02-01T10:05:00Z", "trust_score": 80},
            ]
        )
        assert summary["risk_level"] == "MODERATE"

    def test_integrity_summary_critical_risk(self):
        summary = compute_session_integrity_summary(
            {"trust_score": 30},
            [
                {"timestamp": "2026-02-01T10:00:00Z", "trust_score": 70},
                {"timestamp": "2026-02-01T10:00:05Z", "trust_score": 50},
                {"timestamp": "2026-02-01T10:00:10Z", "trust_score": 30},
            ]
        )
        assert summary["risk_level"] == "CRITICAL"
        assert "Manual proctor audit required" in summary["recommendation"]
