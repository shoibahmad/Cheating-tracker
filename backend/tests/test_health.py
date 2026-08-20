"""
Tests for health check endpoints.

Covers: GET /health, GET /api/health, database connection statuses, uptime.
"""



class TestHealthCheck:
    """Tests for health check endpoints."""

    def test_root_health_endpoint(self, client):
        """Test GET /health returns 200 and expected health metadata."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["ok", "degraded"]
        assert "version" in data
        assert "uptime_seconds" in data
        assert "timestamp" in data
        assert "services" in data
        assert data["services"]["api"] == "healthy"

    def test_api_health_endpoint(self, client):
        """Test GET /api/health returns 200 and identical schema."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["ok", "degraded"]
        assert data["version"] == "2.5.0"

    def test_health_with_connected_db(self, client, mock_db):
        """Test health returns status 'ok' when database is connected."""
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "ok"
        assert data["services"]["database"] == "connected"

    def test_health_with_disconnected_db(self, client):
        """Test health returns status 'degraded' when database is None."""
        from backend.app.dependencies import get_firestore_db
        from backend.main import app

        app.dependency_overrides[get_firestore_db] = lambda: None

        response = client.get("/health")
        data = response.json()
        assert data["status"] == "degraded"
        assert data["services"]["database"] == "disconnected"

        app.dependency_overrides.clear()
