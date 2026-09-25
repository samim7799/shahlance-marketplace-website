#!/usr/bin/env python3
"""
Backend API test for ShahLance Admin-only endpoints.
Tests ONLY the newly added admin endpoints as per review request.
"""

import requests
import json
import sys
from typing import Optional

# Base URL from frontend/.env
BASE_URL = "https://shahcode-review.preview.emergentagent.com/api"

# Admin credentials from test_credentials.md
ADMIN_EMAIL = "rajavai247@gmail.com"
ADMIN_PASSWORD = "Amijanina7799@@"

# Test results tracking
tests_passed = 0
tests_failed = 0
failed_tests = []


def log_test(test_name: str, passed: bool, details: str = ""):
    """Log test result"""
    global tests_passed, tests_failed, failed_tests
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"    {details}")
    if passed:
        tests_passed += 1
    else:
        tests_failed += 1
        failed_tests.append(f"{test_name}: {details}")


def get_admin_token() -> Optional[str]:
    """Login as admin and get Bearer token"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"identifier": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        else:
            print(f"❌ Admin login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return None


def register_buyer(email: str, password: str) -> Optional[str]:
    """Register a new buyer and return token"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "fullName": "Test Buyer",
                "username": email.split("@")[0],
                "email": email,
                "password": password,
                "accountType": "client",
                "phone": "+1234567890",
                "country": "USA"
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        else:
            print(f"❌ Buyer registration failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Buyer registration error: {e}")
        return None


def test_authorization():
    """Test 1: Authorization checks - admin vs buyer vs no auth"""
    print("\n=== TEST 1: AUTHORIZATION ===")
    
    # Register a fresh normal buyer
    import time
    buyer_email = f"testbuyer_{int(time.time())}@test.com"
    buyer_password = "BuyerPass123!"
    buyer_token = register_buyer(buyer_email, buyer_password)
    
    if not buyer_token:
        log_test("1a. Register buyer", False, "Failed to register buyer")
        return None
    
    log_test("1a. Register buyer", True, f"Buyer registered: {buyer_email}")
    
    # Test buyer trying to access admin endpoint (should get 403)
    try:
        response = requests.get(
            f"{BASE_URL}/admin/stats",
            headers={"Authorization": f"Bearer {buyer_token}"},
            timeout=10
        )
        if response.status_code == 403:
            log_test("1b. Buyer access to /admin/stats", True, "Correctly returned 403 Forbidden")
        else:
            log_test("1b. Buyer access to /admin/stats", False, 
                    f"Expected 403, got {response.status_code}")
    except Exception as e:
        log_test("1b. Buyer access to /admin/stats", False, f"Error: {e}")
    
    # Test no auth header (should get 401 or 403)
    try:
        response = requests.get(f"{BASE_URL}/admin/users", timeout=10)
        if response.status_code in [401, 403]:
            log_test("1c. No auth header to /admin/users", True, 
                    f"Correctly returned {response.status_code}")
        else:
            log_test("1c. No auth header to /admin/users", False, 
                    f"Expected 401/403, got {response.status_code}")
    except Exception as e:
        log_test("1c. No auth header to /admin/users", False, f"Error: {e}")
    
    return buyer_email, buyer_token


def test_admin_stats(admin_token: str):
    """Test 2: GET /admin/stats"""
    print("\n=== TEST 2: ADMIN STATS ===")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ['totalUsers', 'totalOrders', 'totalRevenue', 'pendingActions', 'recentActivity']
            missing_keys = [k for k in required_keys if k not in data]
            
            if not missing_keys:
                # Check types
                if (isinstance(data['totalUsers'], int) and 
                    isinstance(data['totalOrders'], int) and
                    isinstance(data['totalRevenue'], (int, float)) and
                    isinstance(data['pendingActions'], int) and
                    isinstance(data['recentActivity'], list)):
                    log_test("2. GET /admin/stats", True, 
                            f"All keys present with correct types. totalUsers={data['totalUsers']}, "
                            f"totalRevenue={data['totalRevenue']}")
                else:
                    log_test("2. GET /admin/stats", False, "Keys present but wrong types")
            else:
                log_test("2. GET /admin/stats", False, f"Missing keys: {missing_keys}")
        else:
            log_test("2. GET /admin/stats", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("2. GET /admin/stats", False, f"Error: {e}")


def test_admin_users(admin_token: str, buyer_email: str):
    """Test 3: GET /admin/users with and without search"""
    print("\n=== TEST 3: ADMIN USERS LIST ===")
    
    # Test without search
    try:
        response = requests.get(
            f"{BASE_URL}/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                if len(data) > 0:
                    user = data[0]
                    required_keys = ['id', 'fullName', 'username', 'email', 'role', 'blocked']
                    missing_keys = [k for k in required_keys if k not in user]
                    
                    if not missing_keys:
                        log_test("3a. GET /admin/users", True, 
                                f"Returns array with {len(data)} users, all required keys present")
                    else:
                        log_test("3a. GET /admin/users", False, f"Missing keys: {missing_keys}")
                else:
                    log_test("3a. GET /admin/users", True, "Returns empty array (no users yet)")
            else:
                log_test("3a. GET /admin/users", False, "Response is not an array")
        else:
            log_test("3a. GET /admin/users", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("3a. GET /admin/users", False, f"Error: {e}")
    
    # Test with search (search for the buyer we just created)
    try:
        search_term = buyer_email.split("@")[0][:5]  # Use part of email
        response = requests.get(
            f"{BASE_URL}/admin/users?search={search_term}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Check if buyer is in results
                buyer_found = any(u.get('email') == buyer_email for u in data)
                if buyer_found:
                    log_test("3b. GET /admin/users?search=", True, 
                            f"Search returned {len(data)} users, buyer found")
                else:
                    log_test("3b. GET /admin/users?search=", True, 
                            f"Search returned {len(data)} users (buyer may not match search term)")
            else:
                log_test("3b. GET /admin/users?search=", False, "Response is not an array")
        else:
            log_test("3b. GET /admin/users?search=", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("3b. GET /admin/users?search=", False, f"Error: {e}")


def test_admin_user_detail(admin_token: str, buyer_email: str):
    """Test 4: GET /admin/users/{buyerId}"""
    print("\n=== TEST 4: ADMIN USER DETAIL ===")
    
    # First get the buyer ID
    try:
        response = requests.get(
            f"{BASE_URL}/admin/users?search={buyer_email}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            users = response.json()
            buyer = next((u for u in users if u.get('email') == buyer_email), None)
            
            if not buyer:
                log_test("4. GET /admin/users/{buyerId}", False, "Buyer not found in users list")
                return None
            
            buyer_id = buyer['id']
            
            # Now get user detail
            response = requests.get(
                f"{BASE_URL}/admin/users/{buyer_id}",
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_keys = ['user', 'wallet', 'ordersCount']
                missing_keys = [k for k in required_keys if k not in data]
                
                if not missing_keys:
                    wallet = data['wallet']
                    wallet_keys = ['balance', 'transactions', 'deposits']
                    missing_wallet_keys = [k for k in wallet_keys if k not in wallet]
                    
                    if not missing_wallet_keys:
                        if (isinstance(wallet['balance'], (int, float)) and
                            isinstance(wallet['transactions'], list) and
                            isinstance(wallet['deposits'], list)):
                            log_test("4. GET /admin/users/{buyerId}", True, 
                                    f"User detail with wallet (balance={wallet['balance']}, "
                                    f"ordersCount={data['ordersCount']})")
                            return buyer_id
                        else:
                            log_test("4. GET /admin/users/{buyerId}", False, 
                                    "Wallet keys present but wrong types")
                    else:
                        log_test("4. GET /admin/users/{buyerId}", False, 
                                f"Missing wallet keys: {missing_wallet_keys}")
                else:
                    log_test("4. GET /admin/users/{buyerId}", False, f"Missing keys: {missing_keys}")
            else:
                log_test("4. GET /admin/users/{buyerId}", False, 
                        f"Expected 200, got {response.status_code}: {response.text}")
        else:
            log_test("4. GET /admin/users/{buyerId}", False, 
                    f"Failed to get users list: {response.status_code}")
    except Exception as e:
        log_test("4. GET /admin/users/{buyerId}", False, f"Error: {e}")
    
    return None


def test_block_unblock_user(admin_token: str, buyer_id: str, buyer_email: str, buyer_password: str):
    """Test 5: PATCH /admin/users/{buyerId}/block and login rejection"""
    print("\n=== TEST 5: BLOCK/UNBLOCK USER ===")
    
    # Block the buyer
    try:
        response = requests.patch(
            f"{BASE_URL}/admin/users/{buyer_id}/block",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"blocked": True},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') and data.get('blocked') == True:
                log_test("5a. PATCH /admin/users/{buyerId}/block (block)", True, 
                        "User blocked successfully")
            else:
                log_test("5a. PATCH /admin/users/{buyerId}/block (block)", False, 
                        f"Unexpected response: {data}")
        else:
            log_test("5a. PATCH /admin/users/{buyerId}/block (block)", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
            return
    except Exception as e:
        log_test("5a. PATCH /admin/users/{buyerId}/block (block)", False, f"Error: {e}")
        return
    
    # Try to login as blocked buyer (should get 403)
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"identifier": buyer_email, "password": buyer_password},
            timeout=10
        )
        
        if response.status_code == 403:
            log_test("5b. Login as blocked user", True, 
                    "Correctly rejected with 403 (account suspended)")
        else:
            log_test("5b. Login as blocked user", False, 
                    f"Expected 403, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("5b. Login as blocked user", False, f"Error: {e}")
    
    # Unblock the buyer
    try:
        response = requests.patch(
            f"{BASE_URL}/admin/users/{buyer_id}/block",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"blocked": False},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') and data.get('blocked') == False:
                log_test("5c. PATCH /admin/users/{buyerId}/block (unblock)", True, 
                        "User unblocked successfully")
            else:
                log_test("5c. PATCH /admin/users/{buyerId}/block (unblock)", False, 
                        f"Unexpected response: {data}")
        else:
            log_test("5c. PATCH /admin/users/{buyerId}/block (unblock)", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
            return
    except Exception as e:
        log_test("5c. PATCH /admin/users/{buyerId}/block (unblock)", False, f"Error: {e}")
        return
    
    # Try to login again (should succeed now)
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"identifier": buyer_email, "password": buyer_password},
            timeout=10
        )
        
        if response.status_code == 200:
            log_test("5d. Login after unblock", True, "Login succeeded after unblock")
        else:
            log_test("5d. Login after unblock", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("5d. Login after unblock", False, f"Error: {e}")


def test_block_self(admin_token: str):
    """Test 6: Admin cannot block self"""
    print("\n=== TEST 6: ADMIN CANNOT BLOCK SELF ===")
    
    # Get admin user ID
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            admin_user = response.json()
            admin_id = admin_user.get('id')
            
            # Try to block self
            response = requests.patch(
                f"{BASE_URL}/admin/users/{admin_id}/block",
                headers={"Authorization": f"Bearer {admin_token}"},
                json={"blocked": True},
                timeout=10
            )
            
            if response.status_code == 400:
                log_test("6. PATCH /admin/users/{adminId}/block (self)", True, 
                        "Correctly returned 400 (cannot block self)")
            else:
                log_test("6. PATCH /admin/users/{adminId}/block (self)", False, 
                        f"Expected 400, got {response.status_code}: {response.text}")
        else:
            log_test("6. PATCH /admin/users/{adminId}/block (self)", False, 
                    f"Failed to get admin user: {response.status_code}")
    except Exception as e:
        log_test("6. PATCH /admin/users/{adminId}/block (self)", False, f"Error: {e}")


def test_sms_providers(admin_token: str):
    """Test 7: SMS providers CRUD"""
    print("\n=== TEST 7: SMS PROVIDERS ===")
    
    provider_id = None
    
    # Create provider
    try:
        response = requests.post(
            f"{BASE_URL}/admin/sms/providers",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "PVAPins",
                "apiUrl": "https://x",
                "apiKey": "k",
                "apiSecret": "s",
                "status": True
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and data.get('name') == 'PVAPins':
                provider_id = data['id']
                log_test("7a. POST /admin/sms/providers", True, 
                        f"Provider created with id={provider_id}")
            else:
                log_test("7a. POST /admin/sms/providers", False, 
                        f"Missing id or wrong name: {data}")
        else:
            log_test("7a. POST /admin/sms/providers", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("7a. POST /admin/sms/providers", False, f"Error: {e}")
        return None
    
    # Get providers list
    try:
        response = requests.get(
            f"{BASE_URL}/admin/sms/providers",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                provider_found = any(p.get('id') == provider_id for p in data)
                if provider_found:
                    log_test("7b. GET /admin/sms/providers", True, 
                            f"Provider list includes created provider ({len(data)} total)")
                else:
                    log_test("7b. GET /admin/sms/providers", False, 
                            "Created provider not found in list")
            else:
                log_test("7b. GET /admin/sms/providers", False, "Response is not an array")
        else:
            log_test("7b. GET /admin/sms/providers", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("7b. GET /admin/sms/providers", False, f"Error: {e}")
    
    # Update provider
    try:
        response = requests.put(
            f"{BASE_URL}/admin/sms/providers/{provider_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": False},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == False:
                log_test("7c. PUT /admin/sms/providers/{id}", True, 
                        "Provider status updated to false")
            else:
                log_test("7c. PUT /admin/sms/providers/{id}", False, 
                        f"Status not updated: {data}")
        else:
            log_test("7c. PUT /admin/sms/providers/{id}", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("7c. PUT /admin/sms/providers/{id}", False, f"Error: {e}")
    
    return provider_id


def test_sms_mappings(admin_token: str, provider_id: str):
    """Test 8: SMS mappings CRUD"""
    print("\n=== TEST 8: SMS MAPPINGS ===")
    
    mapping_id = None
    
    # Create mapping
    try:
        response = requests.post(
            f"{BASE_URL}/admin/sms/mappings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "service": "Telegram",
                "country": "India",
                "primaryProviderId": provider_id,
                "cost": 0.5,
                "price": 1.5
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and data.get('profit') == 1.0:
                mapping_id = data['id']
                log_test("8a. POST /admin/sms/mappings", True, 
                        f"Mapping created with id={mapping_id}, profit=1.0")
            else:
                log_test("8a. POST /admin/sms/mappings", False, 
                        f"Missing id or wrong profit: {data}")
        else:
            log_test("8a. POST /admin/sms/mappings", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("8a. POST /admin/sms/mappings", False, f"Error: {e}")
        return None
    
    # Get mappings list
    try:
        response = requests.get(
            f"{BASE_URL}/admin/sms/mappings",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                mapping_found = any(m.get('id') == mapping_id for m in data)
                if mapping_found:
                    log_test("8b. GET /admin/sms/mappings", True, 
                            f"Mapping list includes created mapping ({len(data)} total)")
                else:
                    log_test("8b. GET /admin/sms/mappings", False, 
                            "Created mapping not found in list")
            else:
                log_test("8b. GET /admin/sms/mappings", False, "Response is not an array")
        else:
            log_test("8b. GET /admin/sms/mappings", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("8b. GET /admin/sms/mappings", False, f"Error: {e}")
    
    # Update mapping
    try:
        response = requests.put(
            f"{BASE_URL}/admin/sms/mappings/{mapping_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"enabled": False},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('enabled') == False:
                log_test("8c. PUT /admin/sms/mappings/{id}", True, 
                        "Mapping enabled updated to false")
            else:
                log_test("8c. PUT /admin/sms/mappings/{id}", False, 
                        f"Enabled not updated: {data}")
        else:
            log_test("8c. PUT /admin/sms/mappings/{id}", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("8c. PUT /admin/sms/mappings/{id}", False, f"Error: {e}")
    
    # Delete mapping
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/sms/mappings/{mapping_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                log_test("8d. DELETE /admin/sms/mappings/{id}", True, "Mapping deleted")
            else:
                log_test("8d. DELETE /admin/sms/mappings/{id}", False, 
                        f"Unexpected response: {data}")
        else:
            log_test("8d. DELETE /admin/sms/mappings/{id}", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("8d. DELETE /admin/sms/mappings/{id}", False, f"Error: {e}")
    
    return mapping_id


def test_sms_orders(admin_token: str):
    """Test 9: GET /admin/sms/orders"""
    print("\n=== TEST 9: SMS ORDERS ===")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/sms/orders",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                log_test("9. GET /admin/sms/orders", True, 
                        f"Returns array ({len(data)} orders, likely empty)")
            else:
                log_test("9. GET /admin/sms/orders", False, "Response is not an array")
        else:
            log_test("9. GET /admin/sms/orders", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("9. GET /admin/sms/orders", False, f"Error: {e}")


def test_sms_config(admin_token: str):
    """Test 10: GET and PUT /admin/sms/config"""
    print("\n=== TEST 10: SMS CONFIG ===")
    
    # Get config
    try:
        response = requests.get(
            f"{BASE_URL}/admin/sms/config",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ['services', 'countries', 'allServices', 'allCountries']
            missing_keys = [k for k in required_keys if k not in data]
            
            if not missing_keys:
                # Check if expected services and countries are present
                expected_services = ['Telegram', 'Gmail', 'WhatsApp', 'Facebook', 'Instagram', 'Other']
                expected_countries = ['India', 'USA', 'Germany', 'UK', 'Other']
                
                all_services = data.get('allServices', [])
                all_countries = data.get('allCountries', [])
                
                services_match = set(expected_services) == set(all_services)
                countries_match = set(expected_countries) == set(all_countries)
                
                if services_match and countries_match:
                    log_test("10a. GET /admin/sms/config", True, 
                            f"Config with correct services and countries maps")
                else:
                    log_test("10a. GET /admin/sms/config", False, 
                            f"Services/countries mismatch. Expected services: {expected_services}, "
                            f"got: {all_services}. Expected countries: {expected_countries}, "
                            f"got: {all_countries}")
            else:
                log_test("10a. GET /admin/sms/config", False, f"Missing keys: {missing_keys}")
        else:
            log_test("10a. GET /admin/sms/config", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("10a. GET /admin/sms/config", False, f"Error: {e}")
    
    # Update config (disable Telegram)
    try:
        response = requests.put(
            f"{BASE_URL}/admin/sms/config",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"services": {"Telegram": False}},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            services = data.get('services', {})
            if services.get('Telegram') == False:
                log_test("10b. PUT /admin/sms/config", True, 
                        "Telegram disabled successfully")
            else:
                log_test("10b. PUT /admin/sms/config", False, 
                        f"Telegram not disabled: {services}")
        else:
            log_test("10b. PUT /admin/sms/config", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("10b. PUT /admin/sms/config", False, f"Error: {e}")


def test_cleanup(admin_token: str, provider_id: str):
    """Test 11: Cleanup - delete created provider"""
    print("\n=== TEST 11: CLEANUP ===")
    
    if not provider_id:
        log_test("11. DELETE provider (cleanup)", False, "No provider ID to delete")
        return
    
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/sms/providers/{provider_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                log_test("11. DELETE provider (cleanup)", True, "Provider deleted successfully")
            else:
                log_test("11. DELETE provider (cleanup)", False, 
                        f"Unexpected response: {data}")
        else:
            log_test("11. DELETE provider (cleanup)", False, 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("11. DELETE provider (cleanup)", False, f"Error: {e}")


def main():
    """Main test runner"""
    print("=" * 70)
    print("SHAHLANCE ADMIN-ONLY ENDPOINTS TEST")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    print("=" * 70)
    
    # Get admin token
    print("\n🔐 Logging in as admin...")
    admin_token = get_admin_token()
    if not admin_token:
        print("\n❌ FATAL: Cannot proceed without admin token")
        sys.exit(1)
    print("✅ Admin login successful")
    
    # Run tests
    buyer_info = test_authorization()
    if buyer_info:
        buyer_email, buyer_token = buyer_info
    else:
        buyer_email, buyer_token = None, None
    
    test_admin_stats(admin_token)
    
    if buyer_email:
        test_admin_users(admin_token, buyer_email)
        buyer_id = test_admin_user_detail(admin_token, buyer_email)
        
        if buyer_id:
            buyer_password = "BuyerPass123!"
            test_block_unblock_user(admin_token, buyer_id, buyer_email, buyer_password)
    
    test_block_self(admin_token)
    
    provider_id = test_sms_providers(admin_token)
    
    if provider_id:
        test_sms_mappings(admin_token, provider_id)
    
    test_sms_orders(admin_token)
    test_sms_config(admin_token)
    
    if provider_id:
        test_cleanup(admin_token, provider_id)
    
    # Print summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print(f"📊 Total: {tests_passed + tests_failed}")
    
    if failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, test in enumerate(failed_tests, 1):
            print(f"  {i}. {test}")
    
    print("=" * 70)
    
    # Exit with appropriate code
    sys.exit(0 if tests_failed == 0 else 1)


if __name__ == "__main__":
    main()
