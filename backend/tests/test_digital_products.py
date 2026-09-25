"""Tests for Digital Product Management module:
- Subscription Management:
  * Categories CRUD (Add, Edit, Delete)
  * Products CRUD (Add, Edit, Delete, image, description, category)
  * Plans (Add, Edit duration/price, Status ON/OFF)
  * Subscription Orders list (User, Product, Plan, Price, Order status)
- Gift Card Management:
  * Brands CRUD (Add, Edit, Delete)
  * Gift Cards CRUD (Image, Description, Stock quantity, Pricing, Status ON/OFF)
  * Gift Card Orders list (User, Brand, Amount, Order status, Delivery status)
- Admin only access gating (403 for non-admin)
"""
import os
import uuid
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


def test_subscription_categories_crud(admin_token, buyer_token):
    # Non-admin forbidden
    r_forbid = requests.get(f"{API}/admin/digital/subscription-categories", headers=_h(buyer_token), timeout=10)
    assert r_forbid.status_code == 403

    # Add category
    r_add = requests.post(f"{API}/admin/digital/subscription-categories", json={
        "name": "Cloud Storage",
        "description": "Secure online drive and backup subscriptions"
    }, headers=_h(admin_token), timeout=10)
    assert r_add.status_code == 200
    cat = r_add.json()
    cat_id = cat["id"]
    assert cat["name"] == "Cloud Storage"

    # Edit category
    r_edit = requests.put(f"{API}/admin/digital/subscription-categories/{cat_id}", json={
        "name": "Cloud Storage & Backup",
        "description": "Updated description"
    }, headers=_h(admin_token), timeout=10)
    assert r_edit.status_code == 200
    assert r_edit.json()["name"] == "Cloud Storage & Backup"

    # Delete category
    r_del = requests.delete(f"{API}/admin/digital/subscription-categories/{cat_id}", headers=_h(admin_token), timeout=10)
    assert r_del.status_code == 200
    assert r_del.json()["ok"] is True


def test_subscription_products_and_plans(admin_token):
    # Add digital product with plans
    r_prod = requests.post(f"{API}/admin/digital/subscription-products", json={
        "title": "VPN Shield Unlimited",
        "description": "High-speed encrypted VPN tunnels across 60 countries.",
        "categoryName": "Security",
        "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600",
        "plans": [
            {"id": "plan_1", "name": "Standard Monthly", "duration": "1 Month", "price": 9.99, "status": "ON"},
            {"id": "plan_2", "name": "Annual Pass", "duration": "1 Year", "price": 89.99, "status": "ON"}
        ]
    }, headers=_h(admin_token), timeout=10)
    assert r_prod.status_code == 200
    p = r_prod.json()
    prod_id = p["id"]
    assert p["title"] == "VPN Shield Unlimited"
    assert len(p["plans"]) == 2

    # Edit product (toggle a plan status OFF, edit description)
    plans = p["plans"]
    plans[0]["status"] = "OFF"
    r_edit = requests.put(f"{API}/admin/digital/subscription-products/{prod_id}", json={
        "title": "VPN Shield Unlimited (Global)",
        "description": "Updated global edition.",
        "plans": plans
    }, headers=_h(admin_token), timeout=10)
    assert r_edit.status_code == 200
    edited = r_edit.json()
    assert edited["title"] == "VPN Shield Unlimited (Global)"
    assert edited["plans"][0]["status"] == "OFF"

    # List products
    r_list = requests.get(f"{API}/admin/digital/subscription-products", headers=_h(admin_token), timeout=10)
    assert r_list.status_code == 200
    assert any(x["id"] == prod_id for x in r_list.json())

    # Subscription orders list
    r_orders = requests.get(f"{API}/admin/digital/subscription-orders", headers=_h(admin_token), timeout=10)
    assert r_orders.status_code == 200
    assert isinstance(r_orders.json(), list)

    # Delete product
    r_del = requests.delete(f"{API}/admin/digital/subscription-products/{prod_id}", headers=_h(admin_token), timeout=10)
    assert r_del.status_code == 200


def test_gift_card_brands_and_cards(admin_token):
    # Add Brand
    r_brand = requests.post(f"{API}/admin/digital/gift-card-brands", json={
        "name": "PlayStation Network",
        "logo": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
        "description": "PSN store wallet cards"
    }, headers=_h(admin_token), timeout=10)
    assert r_brand.status_code == 200
    brand = r_brand.json()
    brand_id = brand["id"]
    assert brand["name"] == "PlayStation Network"

    # Edit Brand
    r_edit_brand = requests.put(f"{API}/admin/digital/gift-card-brands/{brand_id}", json={
        "name": "PlayStation Network (Global)",
        "description": "Updated description"
    }, headers=_h(admin_token), timeout=10)
    assert r_edit_brand.status_code == 200
    assert r_edit_brand.json()["name"] == "PlayStation Network (Global)"

    # Add Gift Card
    r_gc = requests.post(f"{API}/admin/digital/gift-cards", json={
        "brandId": brand_id,
        "brandName": "PlayStation Network (Global)",
        "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600",
        "description": "$25 PSN Gift Card instant delivery",
        "stock": 30,
        "price": 25.0,
        "status": "ON"
    }, headers=_h(admin_token), timeout=10)
    assert r_gc.status_code == 200
    gc = r_gc.json()
    gc_id = gc["id"]
    assert gc["stock"] == 30
    assert gc["status"] == "ON"

    # Edit Gift Card (Stock quantity, pricing, status OFF)
    r_edit_gc = requests.put(f"{API}/admin/digital/gift-cards/{gc_id}", json={
        "stock": 25,
        "price": 24.5,
        "status": "OFF"
    }, headers=_h(admin_token), timeout=10)
    assert r_edit_gc.status_code == 200
    assert r_edit_gc.json()["stock"] == 25
    assert r_edit_gc.json()["status"] == "OFF"

    # Gift Card orders list
    r_gc_orders = requests.get(f"{API}/admin/digital/gift-card-orders", headers=_h(admin_token), timeout=10)
    assert r_gc_orders.status_code == 200
    assert isinstance(r_gc_orders.json(), list)

    # Delete Gift Card & Brand
    r_del_gc = requests.delete(f"{API}/admin/digital/gift-cards/{gc_id}", headers=_h(admin_token), timeout=10)
    assert r_del_gc.status_code == 200
    r_del_b = requests.delete(f"{API}/admin/digital/gift-card-brands/{brand_id}", headers=_h(admin_token), timeout=10)
    assert r_del_b.status_code == 200
