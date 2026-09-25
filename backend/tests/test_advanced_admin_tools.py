"""Tests for Advanced Admin Tools module:
1. CMS Management:
   - Logo settings (upload/replace URL, enable/disable)
   - Banner settings (upload/replace URL, enable/disable)
   - Homepage content (edit text sections)
   - Pages CRUD (Create, Edit, Delete, Publish/Unpublish)
2. Reports Dashboard:
   - Sales Report (total sales, order count)
   - Profit Report (platform profit, commission summary)
   - User Growth (total users, new users)
   - Service Analytics (usage count, order statistics)
3. Security Tools:
   - Admin Activity Logs (action history)
   - Login History & IP Tracking
   - Two Factor Authentication setting (enable/disable)
- Non-admin authorization gating (403 for buyer token)
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


def test_cms_management(admin_token, buyer_token):
    # Non-admin forbidden
    r_forbid = requests.get(f"{API}/admin/cms/settings", headers=_h(buyer_token), timeout=10)
    assert r_forbid.status_code == 403

    # 1. GET CMS Settings
    r_get = requests.get(f"{API}/admin/cms/settings", headers=_h(admin_token), timeout=10)
    assert r_get.status_code == 200
    cfg = r_get.json()
    assert "logo" in cfg
    assert "banner" in cfg
    assert "homepageContent" in cfg

    # 2. PUT CMS Settings (Logo, Banner, Homepage Content)
    r_upd = requests.put(f"{API}/admin/cms/settings", json={
        "logo": {"url": "https://images.unsplash.com/new-logo.png", "enabled": True},
        "banner": {"url": "https://images.unsplash.com/new-banner.png", "enabled": False, "heading": "ShahLance 2026"},
        "homepageContent": {"heroTitle": "Updated Hero Title", "heroSubtitle": "Updated subtitle", "ctaText": "Get Started"}
    }, headers=_h(admin_token), timeout=10)
    assert r_upd.status_code == 200
    updated = r_upd.json()
    assert updated["logo"]["url"] == "https://images.unsplash.com/new-logo.png"
    assert updated["banner"]["enabled"] is False
    assert updated["homepageContent"]["heroTitle"] == "Updated Hero Title"

    # 3. Pages CRUD
    r_page = requests.post(f"{API}/admin/cms/pages", json={
        "title": "Refund Policy",
        "slug": "refund-policy",
        "content": "Official buyer refund policy guidelines.",
        "status": "published"
    }, headers=_h(admin_token), timeout=10)
    assert r_page.status_code == 200
    page_id = r_page.json()["id"]

    # Edit & Unpublish
    r_edit = requests.put(f"{API}/admin/cms/pages/{page_id}", json={
        "status": "draft",
        "content": "Updated draft policy."
    }, headers=_h(admin_token), timeout=10)
    assert r_edit.status_code == 200
    assert r_edit.json()["status"] == "draft"

    # Delete page
    r_del = requests.delete(f"{API}/admin/cms/pages/{page_id}", headers=_h(admin_token), timeout=10)
    assert r_del.status_code == 200


def test_reports_dashboard(admin_token, buyer_token):
    # Non-admin forbidden
    r_forbid = requests.get(f"{API}/admin/reports/dashboard", headers=_h(buyer_token), timeout=10)
    assert r_forbid.status_code == 403

    # Admin GET dashboard
    r_rep = requests.get(f"{API}/admin/reports/dashboard", headers=_h(admin_token), timeout=10)
    assert r_rep.status_code == 200
    data = r_rep.json()
    assert "salesReport" in data
    assert "totalSales" in data["salesReport"]
    assert "orderCount" in data["salesReport"]
    assert "profitReport" in data
    assert "platformProfit" in data["profitReport"]
    assert "commissionSummary" in data["profitReport"]
    assert "userGrowth" in data
    assert "totalUsers" in data["userGrowth"]
    assert "newUsers" in data["userGrowth"]
    assert "serviceAnalytics" in data
    assert "serviceUsageCount" in data["serviceAnalytics"]
    assert "orderStatistics" in data["serviceAnalytics"]


def test_security_tools(admin_token, buyer_token):
    # Non-admin forbidden
    r_forbid = requests.get(f"{API}/admin/security/settings", headers=_h(buyer_token), timeout=10)
    assert r_forbid.status_code == 403

    # 1. 2FA Settings
    r_sec = requests.get(f"{API}/admin/security/settings", headers=_h(admin_token), timeout=10)
    assert r_sec.status_code == 200
    assert "twoFactorAuthEnabled" in r_sec.json()

    # Toggle 2FA ON
    r_toggle = requests.put(f"{API}/admin/security/settings", json={
        "twoFactorAuthEnabled": True
    }, headers=_h(admin_token), timeout=10)
    assert r_toggle.status_code == 200
    assert r_toggle.json()["twoFactorAuthEnabled"] is True

    # Toggle 2FA back OFF
    r_toggle_off = requests.put(f"{API}/admin/security/settings", json={
        "twoFactorAuthEnabled": False
    }, headers=_h(admin_token), timeout=10)
    assert r_toggle_off.status_code == 200
    assert r_toggle_off.json()["twoFactorAuthEnabled"] is False

    # 2. Activity Logs
    r_logs = requests.get(f"{API}/admin/security/activity-logs", headers=_h(admin_token), timeout=10)
    assert r_logs.status_code == 200
    logs = r_logs.json()
    assert isinstance(logs, list)
    assert len(logs) > 0

    # 3. Login History & IP Tracking
    r_login = requests.get(f"{API}/admin/security/login-history", headers=_h(admin_token), timeout=10)
    assert r_login.status_code == 200
    history = r_login.json()
    assert isinstance(history, list)
    assert len(history) > 0
    assert "ipAddress" in history[0]
