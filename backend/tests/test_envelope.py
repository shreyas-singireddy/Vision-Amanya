"""Every GET endpoint must respond in the standard envelope — success or error.

Iterates the OpenAPI schema so new routes are covered automatically. Path
parameters are filled with placeholders; regardless of whether the request
succeeds (200), is denied (403), missing (404) or invalid (422), the body
must still carry the envelope keys.
"""

import re
import uuid

from main import app

REQUIRED = {"success", "message", "data", "request_id", "timestamp"}
REQUIRED_ERROR = {"success", "message", "error_code", "request_id", "timestamp"}

_UUID_PARAM_NAMES = ("id", "user_id", "project_id", "property_id", "enquiry_id",
                     "lead_id", "booking_id", "review_id", "notification_id")


def _fill(path: str) -> str:
    def _value(name: str) -> str:
        if name in _UUID_PARAM_NAMES:
            return str(uuid.uuid4())
        if "booking_number" in name:
            return "BK-NOPE"
        return "test"

    return re.sub(r"\{(\w+)\}", lambda m: _value(m.group(1)), path)


def _get_paths_and_methods() -> list[tuple[str, str]]:
    schema = app.openapi()
    return [
        (path, "GET")
        for path, methods in schema["paths"].items()
        if any(method.upper() == "GET" for method in methods)
    ]


def test_all_get_routes_use_envelope(client, user_factory):
    user = user_factory(role="customer")
    headers = {"Authorization": f"Bearer {user['token']}"}
    routes = _get_paths_and_methods()
    assert len(routes) >= 30, f"expected many GET routes, found {len(routes)}"

    for path, _ in routes:
        url = _fill(path)
        response = client.get(url, headers=headers)
        body = response.json()
        keys = set(body.keys())
        if response.status_code >= 400:
            assert keys >= REQUIRED_ERROR, f"{response.status_code} {path}: missing error envelope keys: {sorted(REQUIRED_ERROR - keys)}"
        else:
            assert keys >= REQUIRED, f"{path}: missing success envelope keys: {sorted(REQUIRED - keys)}"
        assert "success" in keys
