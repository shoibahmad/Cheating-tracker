"""
Tests for security authentication, authorization claims, and role isolation.

Covers: Firebase Auth claim verification, role restriction, student access guards.
"""

from unittest.mock import MagicMock, patch


class TestAuthAndRoleSecurity:
    """Security tests for authentication and role isolation."""

    @patch("backend.app.routes.admin_routes.auth")
    def test_student_role_claim_assigned_on_creation(self, mock_auth, client):
        """Verify custom claims 'role: student' are assigned upon account creation."""
        mock_user = MagicMock()
        mock_user.uid = "student-claim-uid"
        mock_auth.create_user.return_value = mock_user

        response = client.post(
            "/api/admin/students",
            json={
                "full_name": "Verified Role Student",
                "email": "role_check@test.com",
                "password": "strongPassword123!",
                "role": "student",
                "institution": "Tech Institute",
            },
        )

        assert response.status_code == 200
        mock_auth.set_custom_user_claims.assert_called_once_with("student-claim-uid", {"role": "student"})

    @patch("backend.app.routes.admin_routes.auth")
    def test_auth_rejection_on_invalid_email(self, mock_auth, client):
        """Verify auth rejects malformed email strings."""
        mock_auth.create_user.side_effect = ValueError("Invalid email format")

        response = client.post(
            "/api/admin/students",
            json={"full_name": "Bad Email", "email": "invalid-email-string", "password": "password", "role": "student"},
        )

        assert response.status_code == 400

    @patch("backend.app.routes.admin_routes.auth")
    def test_update_student_claims(self, mock_auth, client, mock_db):
        """Verify updating a student's record updates custom claims."""
        mock_db.collection("students").document("update-uid").set(
            {"full_name": "Original Name", "email": "update@test.com", "role": "student"}
        )

        response = client.put(
            "/api/admin/students/update-uid",
            json={"full_name": "Updated Name", "email": "update@test.com", "role": "student"},
        )

        assert response.status_code == 200
        mock_auth.set_custom_user_claims.assert_called_once_with("update-uid", {"role": "student"})
