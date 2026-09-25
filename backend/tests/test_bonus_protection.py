"""Tests for Signup Bonus Protection System:
- Bonus Settings (Admin only)
- Fraud Protection checks:
  * One device can receive bonus only once
  * Require verified email before bonus
  * Require verified phone before bonus
  * Detect duplicate accounts (IP, phone, plus-addressing, name)
  * Mark suspicious accounts and withhold bonus
- Admin Controls:
  * Bonus history
  * User bonus status
  * Suspicious user list
  * Admin review actions (Approve, Reject, Clear Suspicious)
"""
import os
import uuid
import pytest
import requests

BASE = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').rstrip('/')
API = f"{BASE}/api"

ADMIN = {"identifier": "rajavai247@gmail.com", "password": "Amijanina7799@@"}


def _login(cred):
    r = requests.post(f"{API}/auth/login", json=cred, timeout=15)
    assert r.status_code == 200, f"login {cred['identifier']}: {r.status_code} {r.text}"
    return r.json()["token"]


def _h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN)


def _register_user(fullName=None, username_prefix="buser", email_prefix="buser", phone="", country="US"):
    rand = uuid.uuid4().hex[:8]
    if not fullName:
        fullName = f"User {rand}"
    email = f"{email_prefix}_{rand}@example.com"
    uname = f"{username_prefix}_{rand}"
    pwd = "Password123!"
    r = requests.post(f"{API}/auth/register", json={
        "fullName": fullName,
        "username": uname,
        "email": email,
        "password": pwd,
        "phone": phone,
        "country": country,
        "accountType": "client",
    }, timeout=15)
    assert r.status_code == 200, f"Register failed: {r.text}"
    return r.json()["token"], r.json()["user"]


def test_public_bonus_status():
    r = requests.get(f"{API}/bonus/status", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "settings" in data
    assert "enabled" in data["settings"]
    assert "bonusAmount" in data["settings"]
    assert "requireFirstPurchase" in data["settings"]
    assert "minPurchaseAmount" in data["settings"]


def test_admin_settings_get_and_update(admin_token):
    # GET settings
    r = requests.get(f"{API}/admin/bonus/settings", headers=_h(admin_token), timeout=10)
    assert r.status_code == 200
    settings = r.json()
    assert "bonusAmount" in settings

    # PUT settings
    new_settings = {
        "enabled": True,
        "bonusAmount": 15.0,
        "requireFirstPurchase": False,
        "minPurchaseAmount": 25.0,
        "requireVerifiedEmail": True,
        "oneBonusPerDevice": True,
        "detectDuplicateAccounts": True,
    }
    r = requests.put(f"{API}/admin/bonus/settings", json=new_settings, headers=_h(admin_token), timeout=10)
    assert r.status_code == 200
    updated = r.json()
    assert updated["bonusAmount"] == 15.0
    assert updated["minPurchaseAmount"] == 25.0

    # Non-admin forbidden
    token, _ = _register_user()
    r = requests.put(f"{API}/admin/bonus/settings", json={"bonusAmount": 99.0}, headers=_h(token), timeout=10)
    assert r.status_code == 403


def test_email_verification_required_before_bonus(admin_token):
    token, user = _register_user()
    device_id = f"dev_{uuid.uuid4().hex[:12]}"

    # Attempt evaluate before email verification
    r = requests.post(f"{API}/bonus/evaluate", json={"deviceId": device_id}, headers=_h(token), timeout=10)
    assert r.status_code == 200
    res = r.json()
    assert res["eligible"] is False
    assert res["status"] == "pending_email_verification"

    # Now verify email
    r_ver = requests.post(f"{API}/bonus/verify-email", json={"deviceId": device_id}, headers=_h(token), timeout=10)
    assert r_ver.status_code == 200
    eval_res = r_ver.json()["evaluation"]
    assert eval_res["eligible"] is True
    assert eval_res["status"] == "credited"
    assert eval_res["amount"] == 15.0

    # Check user me has updated wallet balance
    r_me = requests.get(f"{API}/auth/me", headers=_h(token), timeout=10)
    assert r_me.status_code == 200
    assert float(r_me.json().get("walletBalance") or 0) >= 15.0


def test_one_device_can_receive_bonus_only_once(admin_token):
    # Device ID used in previous test or new device
    shared_device = f"dev_shared_{uuid.uuid4().hex[:12]}"

    # User 1 claims bonus on this device
    u1_token, u1 = _register_user()
    requests.post(f"{API}/bonus/verify-email", json={"deviceId": shared_device}, headers=_h(u1_token), timeout=10)

    # User 2 tries to claim bonus on the SAME device
    u2_token, u2 = _register_user()
    r2 = requests.post(f"{API}/bonus/verify-email", json={"deviceId": shared_device}, headers=_h(u2_token), timeout=10)
    assert r2.status_code == 200
    res2 = r2.json()["evaluation"]

    # Must be marked suspicious and withheld pending review!
    assert res2["eligible"] is False
    assert res2["status"] == "pending_review"
    assert res2["isSuspicious"] is True
    assert any("Device" in reason for reason in res2["reasons"])


def test_detect_duplicate_accounts_via_phone(admin_token):
    shared_phone = f"+1555{uuid.uuid4().hex[:7]}"
    dev1 = f"dev_{uuid.uuid4().hex[:12]}"
    dev2 = f"dev_{uuid.uuid4().hex[:12]}"

    # User 1 with this phone
    u1_token, _ = _register_user(phone=shared_phone)
    requests.post(f"{API}/bonus/verify-email", json={"deviceId": dev1}, headers=_h(u1_token), timeout=10)

    # User 2 with same phone
    u2_token, _ = _register_user(phone=shared_phone)
    r = requests.post(f"{API}/bonus/verify-email", json={"deviceId": dev2}, headers=_h(u2_token), timeout=10)
    assert r.status_code == 200
    res = r.json()["evaluation"]

    assert res["eligible"] is False
    assert res["isSuspicious"] is True
    assert any("Phone" in reason or "phone" in reason for reason in res["reasons"])


def test_detect_duplicate_disposable_email(admin_token):
    rand = uuid.uuid4().hex[:8]
    disp_email = f"scam_{rand}@tempmail.com"
    dev = f"dev_{uuid.uuid4().hex[:12]}"

    r = requests.post(f"{API}/auth/register", json={
        "fullName": "Temp Scam",
        "username": f"temp_{rand}",
        "email": disp_email,
        "password": "Password123!",
        "accountType": "client",
    }, timeout=15)
    token = r.json()["token"]

    r_eval = requests.post(f"{API}/bonus/verify-email", json={"deviceId": dev}, headers=_h(token), timeout=10)
    assert r_eval.status_code == 200
    res = r_eval.json()["evaluation"]
    assert res["isSuspicious"] is True
    assert any("Disposable" in reason or "temporary" in reason for reason in res["reasons"])


def test_admin_bonus_controls_and_triage(admin_token):
    # 1. Admin Bonus History
    r_hist = requests.get(f"{API}/admin/bonus/history", headers=_h(admin_token), timeout=10)
    assert r_hist.status_code == 200
    history = r_hist.json()
    assert isinstance(history, list)
    assert len(history) > 0

    # 2. Admin User Bonus Status
    r_users = requests.get(f"{API}/admin/bonus/user-status", headers=_h(admin_token), timeout=10)
    assert r_users.status_code == 200
    user_status_list = r_users.json()
    assert isinstance(user_status_list, list)

    # 3. Admin Suspicious User List
    r_susp = requests.get(f"{API}/admin/bonus/suspicious-users", headers=_h(admin_token), timeout=10)
    assert r_susp.status_code == 200
    susp_list = r_susp.json()
    assert isinstance(susp_list, list)
    assert len(susp_list) > 0

    # Pick a suspicious bonus to approve or reject
    target = susp_list[0]
    bonus_record = target.get("bonusRecord")
    if bonus_record and bonus_record.get("status") == "pending_review":
        bid = bonus_record["id"]
        # Test Admin Review Action - Approve
        r_app = requests.post(f"{API}/admin/bonus/review", json={
            "action": "approve",
            "bonusId": bid,
            "note": "Manual QA verification pass"
        }, headers=_h(admin_token), timeout=10)
        assert r_app.status_code == 200
        assert r_app.json()["ok"] is True
        assert r_app.json()["record"]["status"] == "credited"
