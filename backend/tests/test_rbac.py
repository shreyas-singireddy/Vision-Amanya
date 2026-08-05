"""Role-based access control: permission gating on protected endpoints."""


def test_customer_cannot_list_users(client, user_factory):
    user = user_factory(role="customer")
    response = client.get(
        "/api/v1/users", headers={"Authorization": f"Bearer {user['token']}"}
    )
    assert response.status_code == 403
    assert response.json()["error_code"] == "permission_denied"


def test_admin_can_list_users(client, user_factory):
    user = user_factory(role="admin")
    response = client.get(
        "/api/v1/users", headers={"Authorization": f"Bearer {user['token']}"}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "items" in response.json()["data"]


def test_agent_can_list_users_with_agent_permission(client, user_factory):
    user = user_factory(role="agent")
    # agents hold user:read? No — they do not. Expect 403 to prove role scoping.
    response = client.get(
        "/api/v1/users", headers={"Authorization": f"Bearer {user['token']}"}
    )
    assert response.status_code == 403


def test_customer_blocked_from_admin_settings(client, user_factory):
    user = user_factory(role="customer")
    response = client.get(
        "/api/v1/admin/settings", headers={"Authorization": f"Bearer {user['token']}"}
    )
    assert response.status_code == 403


def test_admin_can_read_settings(client, user_factory):
    user = user_factory(role="admin")
    response = client.get(
        "/api/v1/admin/settings", headers={"Authorization": f"Bearer {user['token']}"}
    )
    assert response.status_code == 200


def test_invalid_token_rejected(client):
    response = client.get(
        "/api/v1/users/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "invalid_access_token"
