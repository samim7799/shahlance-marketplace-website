"""Tests for Seller and Product Management module (Admin only):
- Seller Management:
  * Seller Applications list
  * Approve seller
  * Reject seller
  * Suspend/Unsuspend seller
  * Seller profile view
  * Seller sales summary
- Product Management:
  * Add product
  * Edit product
  * Delete product
  * Product image upload / image field
  * Product description, Category, Price, Stock management
  * Product approval/rejection system
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


def _register_user(fullName=None, accountType="freelancer"):
    rand = uuid.uuid4().hex[:8]
    if not fullName:
        fullName = f"Seller User {rand}"
    email = f"seller_{rand}@example.com"
    uname = f"suser_{rand}"
    pwd = "Password123!"
    r = requests.post(f"{API}/auth/register", json={
        "fullName": fullName,
        "username": uname,
        "email": email,
        "password": pwd,
        "accountType": accountType,
    }, timeout=15)
    assert r.status_code == 200, f"Register failed: {r.text}"
    return r.json()["token"], r.json()["user"]


def test_seller_applications_and_approval_flow(admin_token):
    # 1. Register a user and submit application
    user_token, user = _register_user()
    r_app = requests.post(f"{API}/seller/applications", json={
        "sellerType": "digital-marketplace",
        "data": {
            "fullName": user["fullName"],
            "email": user["email"],
            "category": "Accounts",
            "country": "United States",
            "bio": "Experienced digital vendor"
        }
    }, headers=_h(user_token), timeout=10)
    assert r_app.status_code == 200
    app_id = r_app.json()["id"]

    # 2. Admin lists applications
    r_list = requests.get(f"{API}/seller/applications", headers=_h(admin_token), timeout=10)
    assert r_list.status_code == 200
    apps = r_list.json()
    assert any(a["id"] == app_id for a in apps)

    # 3. Non-admin forbidden
    r_forbid = requests.get(f"{API}/seller/applications", headers=_h(user_token), timeout=10)
    assert r_forbid.status_code == 403

    # 4. Admin approves seller
    r_decide = requests.post(f"{API}/seller/applications/{app_id}/decide", json={
        "action": "approve"
    }, headers=_h(admin_token), timeout=10)
    assert r_decide.status_code == 200
    assert r_decide.json()["status"] == "approved"


def test_admin_seller_management_and_sales_summary(admin_token):
    # Register seller with application
    user_token, user = _register_user()
    r_app = requests.post(f"{API}/seller/applications", json={
        "sellerType": "digital-marketplace",
        "data": {
            "fullName": user["fullName"],
            "email": user["email"],
            "category": "Crypto",
            "country": "Germany"
        }
    }, headers=_h(user_token), timeout=10)
    app_id = r_app.json()["id"]
    requests.post(f"{API}/seller/applications/{app_id}/decide", json={"action": "approve"}, headers=_h(admin_token))

    # 1. Admin lists all sellers
    r_sellers = requests.get(f"{API}/admin/sellers", headers=_h(admin_token), timeout=10)
    assert r_sellers.status_code == 200
    sellers = r_sellers.json()
    assert isinstance(sellers, list)
    target = next((s for s in sellers if s["userId"] == user["id"]), None)
    assert target is not None
    assert "salesSummary" in target
    assert "totalSales" in target["salesSummary"]
    assert "ordersCount" in target["salesSummary"]

    # 2. Admin views seller profile and sales summary
    r_summary = requests.get(f"{API}/admin/sellers/{user['id']}/summary", headers=_h(admin_token), timeout=10)
    assert r_summary.status_code == 200
    summary_data = r_summary.json()
    assert summary_data["seller"]["id"] == user["id"]
    assert "salesSummary" in summary_data
    assert "products" in summary_data

    # 3. Admin suspends seller
    r_susp = requests.post(f"{API}/admin/sellers/{user['id']}/suspend", json={
        "suspended": True,
        "reason": "Policy violation under review"
    }, headers=_h(admin_token), timeout=10)
    assert r_susp.status_code == 200
    assert r_susp.json()["suspended"] is True

    # Check seller summary reflects suspended
    r_summary2 = requests.get(f"{API}/admin/sellers/{user['id']}/summary", headers=_h(admin_token), timeout=10)
    assert r_summary2.json()["seller"]["isSuspended"] is True

    # 4. Admin unsuspends seller
    r_unsusp = requests.post(f"{API}/admin/sellers/{user['id']}/suspend", json={
        "suspended": False,
        "reason": "Reinstated after review"
    }, headers=_h(admin_token), timeout=10)
    assert r_unsusp.status_code == 200
    assert r_unsusp.json()["suspended"] is False


def test_admin_product_management_crud_and_stock(admin_token):
    # 1. Add product (Admin only)
    product_payload = {
        "title": "Master React & FastAPI Course",
        "description": "Comprehensive full stack course with complete source code.",
        "category": "Software",
        "price": 49.99,
        "stock": 75,
        "inStock": True,
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    }
    r_create = requests.post(f"{API}/admin/products", json=product_payload, headers=_h(admin_token), timeout=10)
    assert r_create.status_code == 200
    prod = r_create.json()
    assert prod["title"] == product_payload["title"]
    assert prod["stock"] == 75
    assert prod["inStock"] is True
    assert prod["status"] == "approved"
    prod_id = prod["id"]

    # 2. List products (Admin)
    r_list = requests.get(f"{API}/admin/products", headers=_h(admin_token), timeout=10)
    assert r_list.status_code == 200
    prods = r_list.json()
    assert any(p["id"] == prod_id for p in prods)

    # 3. Edit product (Admin)
    update_payload = {
        "title": "Master React & FastAPI Course - Pro Edition",
        "price": 59.99,
        "stock": 40,
        "inStock": True,
        "description": "Updated edition with advanced patterns.",
    }
    r_edit = requests.put(f"{API}/admin/products/{prod_id}", json=update_payload, headers=_h(admin_token), timeout=10)
    assert r_edit.status_code == 200
    edited = r_edit.json()
    assert edited["title"] == "Master React & FastAPI Course - Pro Edition"
    assert edited["price"] == 59.99
    assert edited["stock"] == 40

    # 4. Product approval / rejection system
    # Test seller submit + admin approve/reject
    u_token, _ = _register_user()
    r_sub = requests.post(f"{API}/seller/products", json={
        "title": "Seller Submitted Tool",
        "category": "Software",
        "price": 19.99,
        "description": "A test tool",
    }, headers=_h(admin_token), timeout=10)  # admin can submit or approve
    sub_id = r_sub.json()["id"]

    r_dec = requests.post(f"{API}/seller/products/{sub_id}/decide", json={
        "action": "reject",
        "reason": "Needs updated documentation"
    }, headers=_h(admin_token), timeout=10)
    assert r_dec.status_code == 200
    assert r_dec.json()["status"] == "rejected"

    # 5. Delete product (Admin)
    r_del = requests.delete(f"{API}/admin/products/{prod_id}", headers=_h(admin_token), timeout=10)
    assert r_del.status_code == 200
    assert r_del.json()["ok"] is True
