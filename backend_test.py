#!/usr/bin/env python3
"""
Backend API tests for ShahLance Account Management auth endpoints.
Tests change-password and preferences persistence.
"""
import requests
import uuid
import sys
import os

# Read base URL from frontend/.env
def get_base_url():
    env_path = '/app/frontend/.env'
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                return line.split('=', 1)[1].strip() + '/api'
    return 'https://shahcode-review.preview.emergentagent.com/api'

BASE_URL = get_base_url()
print(f"Testing against: {BASE_URL}")

# Test results tracking
tests_passed = 0
tests_failed = 0
test_results = []

def log_test(name, passed, details=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        status = "✅ PASS"
    else:
        tests_failed += 1
        status = "❌ FAIL"
    result = f"{status} - {name}"
    if details:
        result += f"\n    {details}"
    test_results.append(result)
    print(result)

def register_fresh_user():
    """Register a new user and return token."""
    unique_id = uuid.uuid4().hex[:8]
    email = f"testuser_{unique_id}@example.com"
    username = f"testuser_{unique_id}"
    
    payload = {
        "fullName": f"Test User {unique_id}",
        "username": username,
        "email": email,
        "password": "Password123!",
        "phone": "+1234567890",
        "country": "US",
        "accountType": "client",
        "profilePhoto": ""
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            token = data.get('token')
            user = data.get('user')
            print(f"✓ Registered user: {email}")
            return token, email, user
        else:
            print(f"✗ Registration failed: {resp.status_code} - {resp.text}")
            return None, None, None
    except Exception as e:
        print(f"✗ Registration error: {e}")
        return None, None, None

def test_change_password_wrong_current(token):
    """Test 1: Wrong current password should return 400."""
    payload = {
        "currentPassword": "WrongPass!",
        "newPassword": "NewPass456!"
    }
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/change-password", json=payload, headers=headers, timeout=10)
        if resp.status_code == 400:
            msg = resp.json().get('detail', '')
            if 'incorrect' in msg.lower() or 'current password' in msg.lower():
                log_test("Change password with wrong current password", True, f"Got 400 with message: {msg}")
            else:
                log_test("Change password with wrong current password", False, f"Got 400 but unexpected message: {msg}")
        else:
            log_test("Change password with wrong current password", False, f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Change password with wrong current password", False, f"Exception: {e}")

def test_change_password_short(token):
    """Test 2: Password < 8 chars should return 400."""
    payload = {
        "currentPassword": "Password123!",
        "newPassword": "short"
    }
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/change-password", json=payload, headers=headers, timeout=10)
        if resp.status_code == 400:
            msg = resp.json().get('detail', '')
            if '8' in msg or 'characters' in msg.lower():
                log_test("Change password with short password (<8 chars)", True, f"Got 400 with message: {msg}")
            else:
                log_test("Change password with short password (<8 chars)", False, f"Got 400 but unexpected message: {msg}")
        else:
            log_test("Change password with short password (<8 chars)", False, f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Change password with short password (<8 chars)", False, f"Exception: {e}")

def test_change_password_same(token):
    """Test 3: Same password should return 400."""
    payload = {
        "currentPassword": "Password123!",
        "newPassword": "Password123!"
    }
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/change-password", json=payload, headers=headers, timeout=10)
        if resp.status_code == 400:
            msg = resp.json().get('detail', '')
            if 'different' in msg.lower() or 'same' in msg.lower():
                log_test("Change password with same password", True, f"Got 400 with message: {msg}")
            else:
                log_test("Change password with same password", False, f"Got 400 but unexpected message: {msg}")
        else:
            log_test("Change password with same password", False, f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Change password with same password", False, f"Exception: {e}")

def test_change_password_success(token, email):
    """Test 4: Valid password change should succeed, then verify login with new/old passwords."""
    payload = {
        "currentPassword": "Password123!",
        "newPassword": "NewPass456!"
    }
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Change password
        resp = requests.post(f"{BASE_URL}/auth/change-password", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok') == True:
                log_test("Change password with valid credentials", True, f"Got {{ok:true}}")
                
                # Test login with NEW password
                login_payload = {"identifier": email, "password": "NewPass456!"}
                login_resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=10)
                if login_resp.status_code == 200 and login_resp.json().get('token'):
                    log_test("Login with NEW password after change", True, "Login successful with new password")
                else:
                    log_test("Login with NEW password after change", False, f"Expected 200 with token, got {login_resp.status_code}: {login_resp.text}")
                
                # Test login with OLD password (should fail)
                old_login_payload = {"identifier": email, "password": "Password123!"}
                old_login_resp = requests.post(f"{BASE_URL}/auth/login", json=old_login_payload, timeout=10)
                if old_login_resp.status_code == 400:
                    log_test("Login with OLD password after change", True, "Login correctly failed with old password (400)")
                else:
                    log_test("Login with OLD password after change", False, f"Expected 400, got {old_login_resp.status_code}")
            else:
                log_test("Change password with valid credentials", False, f"Expected {{ok:true}}, got {data}")
        else:
            log_test("Change password with valid credentials", False, f"Expected 200, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Change password with valid credentials", False, f"Exception: {e}")

def test_change_password_no_auth():
    """Test 5: Change password without Authorization header should return 401 or 403."""
    payload = {
        "currentPassword": "Password123!",
        "newPassword": "NewPass456!"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/change-password", json=payload, timeout=10)
        if resp.status_code in [401, 403]:
            log_test("Change password without Authorization header", True, f"Got {resp.status_code} (unauthorized)")
        else:
            log_test("Change password without Authorization header", False, f"Expected 401/403, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Change password without Authorization header", False, f"Exception: {e}")

def test_preferences_persistence(token):
    """Test 6: PUT /api/auth/me with preferences, then GET to verify persistence."""
    preferences = {
        "currency": "EUR",
        "language": "Français",
        "email": {
            "marketing": True
        }
    }
    payload = {"preferences": preferences}
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # PUT preferences
        resp = requests.put(f"{BASE_URL}/auth/me", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            returned_prefs = data.get('preferences', {})
            if returned_prefs.get('currency') == 'EUR' and returned_prefs.get('language') == 'Français':
                log_test("PUT /api/auth/me with preferences", True, f"Preferences returned correctly: {returned_prefs}")
                
                # GET to verify persistence
                get_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
                if get_resp.status_code == 200:
                    get_data = get_resp.json()
                    persisted_prefs = get_data.get('preferences', {})
                    if persisted_prefs.get('currency') == 'EUR' and persisted_prefs.get('language') == 'Français':
                        log_test("GET /api/auth/me preferences persistence", True, f"Preferences persisted correctly: {persisted_prefs}")
                    else:
                        log_test("GET /api/auth/me preferences persistence", False, f"Preferences not persisted correctly: {persisted_prefs}")
                else:
                    log_test("GET /api/auth/me preferences persistence", False, f"GET failed with {get_resp.status_code}: {get_resp.text}")
            else:
                log_test("PUT /api/auth/me with preferences", False, f"Preferences not returned correctly: {returned_prefs}")
        else:
            log_test("PUT /api/auth/me with preferences", False, f"Expected 200, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("PUT /api/auth/me with preferences", False, f"Exception: {e}")

def test_role_security(token):
    """Test 7: PUT /api/auth/me with role field should NOT change user's role."""
    payload = {"role": "admin"}
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Try to change role
        resp = requests.put(f"{BASE_URL}/auth/me", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            # GET to verify role was NOT changed
            get_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
            if get_resp.status_code == 200:
                data = get_resp.json()
                role = data.get('role')
                if role == 'buyer':  # Should still be buyer (client accountType)
                    log_test("Security: PUT /api/auth/me with role field", True, f"Role correctly remained 'buyer' (not changed to admin)")
                else:
                    log_test("Security: PUT /api/auth/me with role field", False, f"SECURITY ISSUE: Role was changed to '{role}'")
            else:
                log_test("Security: PUT /api/auth/me with role field", False, f"GET failed with {get_resp.status_code}")
        else:
            log_test("Security: PUT /api/auth/me with role field", False, f"PUT failed with {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Security: PUT /api/auth/me with role field", False, f"Exception: {e}")

def main():
    print("=" * 80)
    print("ShahLance Backend API Tests - Account Management Auth Endpoints")
    print("=" * 80)
    print()
    
    # Register a fresh user for testing
    print("Setting up test user...")
    token, email, user = register_fresh_user()
    if not token:
        print("❌ Failed to register test user. Cannot proceed with tests.")
        sys.exit(1)
    
    print(f"User ID: {user.get('id')}, Role: {user.get('role')}")
    print()
    
    # Run tests
    print("Running tests...")
    print("-" * 80)
    
    # Test 1: Wrong current password
    test_change_password_wrong_current(token)
    
    # Test 2: Short password
    test_change_password_short(token)
    
    # Test 3: Same password
    test_change_password_same(token)
    
    # Test 4: Valid password change + login verification
    # Note: This will change the password, so we need a new token after
    test_change_password_success(token, email)
    
    # Get new token after password change
    login_payload = {"identifier": email, "password": "NewPass456!"}
    login_resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=10)
    if login_resp.status_code == 200:
        new_token = login_resp.json().get('token')
    else:
        print("⚠️  Could not get new token after password change. Remaining tests may fail.")
        new_token = token
    
    # Test 5: No auth header
    test_change_password_no_auth()
    
    # Test 6: Preferences persistence
    test_preferences_persistence(new_token)
    
    # Test 7: Role security
    test_role_security(new_token)
    
    # Summary
    print()
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total tests: {tests_passed + tests_failed}")
    print(f"Passed: {tests_passed}")
    print(f"Failed: {tests_failed}")
    print()
    
    if tests_failed > 0:
        print("❌ SOME TESTS FAILED")
        sys.exit(1)
    else:
        print("✅ ALL TESTS PASSED")
        sys.exit(0)

if __name__ == "__main__":
    main()
