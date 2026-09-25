"""
Iteration 5 - Advanced Wallet & Payment Management admin endpoints.
Covers: gateway CRUD, payment monitoring + refund, wallet adjust + report, authz.
"""
import os
import uuid
import pytest
import requests

BASE = os.environ.get('REACT_APP_BACKEND_URL', 'https://shahcode-review.preview.emergentagent.com').rstrip('/')
API = f"{BASE}/api"

ADMIN = {"identifier": "rajavai247@gmail.com", "password": "Amijanina7799@@"}
BUYER = {"identifier": "qabuyer@example.com", "password": "NewPass456!"}
SELLER = {"identifier": "qaseller@example.com", "password": "Password123!"}


def _h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def _login(cred):
    r = requests.post(f"{API}/auth/login", json=cred, timeout=20)
    assert r.status_code == 200, f"{cred['identifier']}: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN)


@pytest.fixture(scope="module")
def buyer_token():
    return _login(BUYER)


@pytest.fixture(scope="module")
def seller_token():
    return _login(SELLER)


@pytest.fixture(scope="module")
def buyer_id(admin_token):
    r = requests.get(f"{API}/admin/users?q=qabuyer", headers=_h(admin_token), timeout=15)
    assert r.status_code == 200, r.text
    users = r.json() if isinstance(r.json(), list) else r.json().get('users', [])
    for u in users:
        if u.get('email') == 'qabuyer@example.com':
            return u['id']
    pytest.skip("qabuyer not found via /admin/users")


# ---------------- AUTHZ ----------------
NEW_ENDPOINTS = [
    ("GET", "/admin/payments/gateways"),
    ("GET", "/admin/payments/transactions"),
    ("POST", "/admin/wallet/adjust"),
    ("GET", "/admin/wallet/report"),
]


@pytest.mark.parametrize("method,path", NEW_ENDPOINTS)
def test_authz_unauthenticated(method, path):
    r = requests.request(method, f"{API}{path}", json={}, timeout=15)
    assert r.status_code in (401, 403), f"{method} {path} => {r.status_code}"


@pytest.mark.parametrize("method,path", NEW_ENDPOINTS)
def test_authz_buyer_forbidden(buyer_token, method, path):
    r = requests.request(method, f"{API}{path}", headers=_h(buyer_token), json={}, timeout=15)
    assert r.status_code == 403, f"buyer {method} {path} => {r.status_code}"


@pytest.mark.parametrize("method,path", NEW_ENDPOINTS)
def test_authz_seller_forbidden(seller_token, method, path):
    r = requests.request(method, f"{API}{path}", headers=_h(seller_token), json={}, timeout=15)
    assert r.status_code == 403, f"seller {method} {path} => {r.status_code}"


# ---------------- Gateway CRUD ----------------
def test_gateway_crud(admin_token):
    # invalid provider
    bad = requests.post(f"{API}/admin/payments/gateways", headers=_h(admin_token),
                        json={"provider": "paypal"}, timeout=15)
    assert bad.status_code == 400

    # create cryptomus
    payload = {
        "provider": "cryptomus",
        "merchantId": f"m_{uuid.uuid4().hex[:6]}",
        "apiKey": "ak_test",
        "secretKey": "sk_test",
        "webhookUrl": "https://example.com/hook",
        "enabled": False,
    }
    r = requests.post(f"{API}/admin/payments/gateways", headers=_h(admin_token), json=payload, timeout=15)
    assert r.status_code == 200, r.text
    gw = r.json()
    assert gw["provider"] == "cryptomus"
    assert gw["enabled"] is False
    assert gw["merchantId"] == payload["merchantId"]
    gid = gw["id"]

    # list contains
    lst = requests.get(f"{API}/admin/payments/gateways", headers=_h(admin_token), timeout=15)
    assert lst.status_code == 200
    assert any(g["id"] == gid for g in lst.json())

    # toggle
    upd = requests.put(f"{API}/admin/payments/gateways/{gid}", headers=_h(admin_token),
                      json={"enabled": True}, timeout=15)
    assert upd.status_code == 200
    assert upd.json()["enabled"] is True

    # delete
    d = requests.delete(f"{API}/admin/payments/gateways/{gid}", headers=_h(admin_token), timeout=15)
    assert d.status_code == 200
    # confirm gone
    lst2 = requests.get(f"{API}/admin/payments/gateways", headers=_h(admin_token), timeout=15)
    assert not any(g["id"] == gid for g in lst2.json())


def test_gateway_nowpayments_create_and_delete(admin_token):
    r = requests.post(f"{API}/admin/payments/gateways", headers=_h(admin_token),
                     json={"provider": "nowpayments", "merchantId": "np1", "apiKey": "k", "secretKey": "s"},
                     timeout=15)
    assert r.status_code == 200
    gid = r.json()["id"]
    requests.delete(f"{API}/admin/payments/gateways/{gid}", headers=_h(admin_token), timeout=15)


# ---------------- Payment Monitoring ----------------
def test_payments_transactions_shape(admin_token):
    r = requests.get(f"{API}/admin/payments/transactions", headers=_h(admin_token), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert "transactions" in body and "summary" in body
    for k in ("pending", "completed", "failed", "refunded"):
        assert k in body["summary"]
    for t in body["transactions"]:
        assert "monitorStatus" in t
        assert "orderTitle" in t
        assert "userEmail" in t


def test_payments_transactions_filter(admin_token):
    r = requests.get(f"{API}/admin/payments/transactions?status=pending", headers=_h(admin_token), timeout=15)
    assert r.status_code == 200
    for t in r.json()["transactions"]:
        assert t["monitorStatus"] == "pending"


def test_refund_marking_idempotent(admin_token):
    r = requests.get(f"{API}/admin/payments/transactions?status=completed",
                     headers=_h(admin_token), timeout=15)
    txns = r.json()["transactions"]
    if not txns:
        pytest.skip("no completed transaction available to test refund")
    tid = txns[0]["id"]
    a = requests.patch(f"{API}/admin/payments/transactions/{tid}/refund",
                       headers=_h(admin_token), timeout=15)
    assert a.status_code == 200 and a.json()["status"] == "refunded"
    b = requests.patch(f"{API}/admin/payments/transactions/{tid}/refund",
                       headers=_h(admin_token), timeout=15)
    assert b.status_code == 200 and b.json()["status"] == "refunded"


def test_refund_not_found(admin_token):
    r = requests.patch(f"{API}/admin/payments/transactions/nope_xxx/refund",
                       headers=_h(admin_token), timeout=15)
    assert r.status_code == 404


# ---------------- Wallet ----------------
def test_wallet_adjust_validation(admin_token, buyer_id):
    # missing note
    r = requests.post(f"{API}/admin/wallet/adjust", headers=_h(admin_token),
                     json={"userId": buyer_id, "type": "credit", "amount": 10, "note": ""}, timeout=15)
    assert r.status_code == 400
    # amount <= 0
    r = requests.post(f"{API}/admin/wallet/adjust", headers=_h(admin_token),
                     json={"userId": buyer_id, "type": "credit", "amount": 0, "note": "x"}, timeout=15)
    assert r.status_code == 400
    # unknown user
    r = requests.post(f"{API}/admin/wallet/adjust", headers=_h(admin_token),
                     json={"userId": "u_missing", "type": "credit", "amount": 5, "note": "x"}, timeout=15)
    assert r.status_code == 404
    # bad type
    r = requests.post(f"{API}/admin/wallet/adjust", headers=_h(admin_token),
                     json={"userId": buyer_id, "type": "hack", "amount": 5, "note": "x"}, timeout=15)
    assert r.status_code == 400


def test_wallet_credit_debit_bonus_flow(admin_token, buyer_id):
    # baseline
    u0 = requests.get(f"{API}/admin/users/{buyer_id}", headers=_h(admin_token), timeout=15)
    assert u0.status_code == 200
    b0 = float(u0.json().get("user", u0.json()).get("walletBalance") or 0)

    # credit +25
    r = requests.post(f"{API}/admin/wallet/adjust", headers=_h(admin_token),
                     json={"userId": buyer_id, "type": "credit", "amount": 25, "note": "TEST credit"}, timeout=15)
    assert r.status_code == 200
    assert abs(r.json()["balance"] - (b0 + 25)) < 0.01
    b1 = r.json()["balance"]

    # bonus +10
    r = requests.post(f"{API}/admin/wallet/adjust", headers=_h(admin_token),
                     json={"userId": buyer_id, "type": "bonus", "amount": 10, "note": "TEST bonus"}, timeout=15)
    assert r.status_code == 200
    assert abs(r.json()["balance"] - (b1 + 10)) < 0.01
    b2 = r.json()["balance"]

    # debit -5
    r = requests.post(f"{API}/admin/wallet/adjust", headers=_h(admin_token),
                     json={"userId": buyer_id, "type": "debit", "amount": 5, "note": "TEST debit"}, timeout=15)
    assert r.status_code == 200
    assert abs(r.json()["balance"] - (b2 - 5)) < 0.01
    b3 = r.json()["balance"]

    # debit exceeding balance
    r = requests.post(f"{API}/admin/wallet/adjust", headers=_h(admin_token),
                     json={"userId": buyer_id, "type": "debit", "amount": b3 + 500, "note": "over"}, timeout=15)
    assert r.status_code == 400

    # user detail reflects balance
    u2 = requests.get(f"{API}/admin/users/{buyer_id}", headers=_h(admin_token), timeout=15)
    detail = u2.json().get("user", u2.json())
    assert abs(float(detail.get("walletBalance") or 0) - b3) < 0.01


def test_wallet_report(admin_token):
    r = requests.get(f"{API}/admin/wallet/report", headers=_h(admin_token), timeout=15)
    assert r.status_code == 200
    b = r.json()
    for k in ("totalBalance", "totals", "counts", "recent"):
        assert k in b
    for k in ("credit", "debit", "bonus"):
        assert k in b["totals"]
        assert k in b["counts"]
    for row in b["recent"]:
        assert "userEmail" in row
        assert "note" in row
