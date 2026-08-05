"""End-to-end auth flow: envelope shape, token lifecycle, error codes."""

import uuid


def _envelope_keys(body: dict) -> set[str]:
    return set(body.keys())


def test_register_returns_envelope_with_token_pair(client, user_factory):
    user = user_factory()
    assert user["token"]
    assert user["refresh"]


def test_register_duplicate_email_conflicts(client):
    email = None
    for _ in range(2):
        email = email or f"dup.{uuid.uuid4().hex[:8]}@example.com"
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "password": "Str0ng!Pass1",
                "full_name": "Dup User",
                "phone": f"+1555{uuid.uuid4().hex[:6]}",
            },
        )
        status, body = response.status_code, response.json()
        if status == 200:
            assert {"success", "message", "data", "request_id", "timestamp"} <= set(body)
        else:
            assert {"success", "message", "error_code", "details", "request_id", "timestamp"} <= set(body)
        if status == 409:
            assert body["error_code"] == "email_already_registered"
            return
        assert status == 200
    raise AssertionError("duplicate email did not produce a 409 conflict")


def test_login_success_and_wrong_password(client, user_factory):
    user = user_factory()
    ok = client.post(
        "/api/v1/auth/login",
        json={"email": user["email"], "password": user["password"]},
    )
    assert ok.status_code == 200
    assert ok.json()["data"]["token"]["access_token"]

    bad = client.post(
        "/api/v1/auth/login",
        json={"email": user["email"], "password": "wrong-pass"},
    )
    assert bad.status_code == 401
    assert bad.json()["error_code"] == "invalid_credentials"


def test_refresh_token_rotates_and_old_becomes_invalid(client, user_factory):
    user = user_factory()
    first = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": user["refresh"]}
    )
    assert first.status_code == 200
    new_refresh = first.json()["data"]["token"]["refresh_token"]
    assert new_refresh and new_refresh != user["refresh"]

    replay = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": user["refresh"]}
    )
    assert replay.status_code == 401
    assert replay.json()["error_code"] == "invalid_refresh_token"


def test_logout_revokes_refresh_token(client, user_factory):
    user = user_factory()
    headers = {"Authorization": f"Bearer {user['token']}"}
    logout = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": user["refresh"]},
        headers=headers,
    )
    assert logout.status_code == 200
    assert logout.json()["data"]["revoked"] == 1

    reuse = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": user["refresh"]}
    )
    assert reuse.status_code == 401


def test_me_requires_auth_and_returns_profile(client, user_factory):
    user = user_factory()
    anon = client.get("/api/v1/users/me")
    assert anon.status_code == 401
    assert anon.json()["error_code"] == "authentication_required"

    authed = client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {user['token']}"}
    )
    assert authed.status_code == 200
    assert authed.json()["success"] is True
    assert authed.json()["data"]["email"] == user["email"]


def test_validation_error_returns_envelope(client):
    response = client.post(
        "/api/v1/auth/register", json={"email": "not-an-email"}
    )
    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert body["error_code"] == "validation_error"
    assert "errors" in body["details"]
