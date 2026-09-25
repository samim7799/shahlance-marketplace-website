"""Tests for Marketplace Commission System:
- Admin Commission Settings:
  * Enable/Disable commission
  * Commission percentage setting
- Product Pricing Logic:
  * Seller price
  * Commission amount
  * Buyer final price
  * Seller payout amount
  * Exact test case: Seller price $10, 20% -> Platform fee $2, Buyer price $12, Seller payout $10
- Admin View / Overview:
  * Shows seller price, commission %, platform earnings, seller payout
- Non-admin authorization gating (403)
"""
import os
import pytest
import requests

BASE = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').rstrip('/')
API = f"{BASE}/api"

ADMIN = {"identifier": "rajavai247@gmail.com", "password": "Amijanina7799@@"}
BUYER = {"identifier": "qabuyer@example.com", "password": "NewPass456!"}


def _login(cred):
    r = requests.post(f"{API}/auth/login", json=cred, timeout=15)
    assert r.status_code == 200, f"login {cred['identifier']}: {r.status_code} {r.text}"
    return r.json()["token"]


def _h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN)


@pytest.fixture(scope="module")
def buyer_token():
    return _login(BUYER)


def test_admin_commission_settings_get_and_update(admin_token, buyer_token):
    # 1. Non-admin forbidden
    r_forbid = requests.get(f"{API}/admin/commission/settings", headers=_h(buyer_token), timeout=10)
    assert r_forbid.status_code == 403

    # 2. Admin GET settings
    r_get = requests.get(f"{API}/admin/commission/settings", headers=_h(admin_token), timeout=10)
    assert r_get.status_code == 200
    cfg = r_get.json()
    assert "enabled" in cfg
    assert "percentage" in cfg

    # 3. Admin PUT settings
    r_put = requests.put(f"{API}/admin/commission/settings", json={
        "enabled": True,
        "percentage": 20.0,
    }, headers=_h(admin_token), timeout=10)
    assert r_put.status_code == 200
    updated = r_put.json()
    assert updated["enabled"] is True
    assert updated["percentage"] == 20.0


def test_product_pricing_logic_and_exact_prompt_example(admin_token):
    # Prompt specification:
    # Seller price: $10
    # Commission: 20%
    # Platform fee: $2
    # Buyer price: $12
    # Seller payout: $10
    r_calc = requests.post(f"{API}/admin/commission/calculate", json={
        "sellerPrice": 10.0,
        "percentage": 20.0,
        "enabled": True,
    }, headers=_h(admin_token), timeout=10)
    assert r_calc.status_code == 200
    res = r_calc.json()
    assert res["sellerPrice"] == 10.0
    assert res["commissionPercentage"] == 20.0
    assert res["commissionAmount"] == 2.0
    assert res["platformEarnings"] == 2.0
    assert res["buyerFinalPrice"] == 12.0
    assert res["sellerPayout"] == 10.0


def test_commission_disabled_pricing_logic(admin_token):
    # When disabled: commission = 0, buyer price = seller price, seller payout = seller price
    r_calc = requests.post(f"{API}/admin/commission/calculate", json={
        "sellerPrice": 50.0,
        "percentage": 20.0,
        "enabled": False,
    }, headers=_h(admin_token), timeout=10)
    assert r_calc.status_code == 200
    res = r_calc.json()
    assert res["sellerPrice"] == 50.0
    assert res["commissionAmount"] == 0.0
    assert res["platformEarnings"] == 0.0
    assert res["buyerFinalPrice"] == 50.0
    assert res["sellerPayout"] == 50.0


def test_admin_commission_overview(admin_token):
    r_overview = requests.get(f"{API}/admin/commission/overview", headers=_h(admin_token), timeout=10)
    assert r_overview.status_code == 200
    overview = r_overview.json()
    assert "settings" in overview
    assert "example" in overview
    assert "items" in overview
    assert overview["example"]["sellerPrice"] == 10.0
    assert overview["example"]["sellerPayout"] == 10.0
