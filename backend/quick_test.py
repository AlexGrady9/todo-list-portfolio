import requests
import json

# Test API endpoints
base_url = "http://127.0.0.1:8006"


def test_user_registration(email):
    """Test user registration"""
    user_data = {
        "email": email,
        "password": "testpassword123"
    }

    try:
        response = requests.post(
            f"{base_url}/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Registration status: {response.status_code}")
        print(f"Registration response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Registration error: {e}")
        return False


def test_user_login(email):
    """Test user login"""
    login_data = {
        "username": email,
        "password": "testpassword123"
    }

    try:
        response = requests.post(
            f"{base_url}/token",
            data=login_data,  # form data for OAuth2
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print(f"Login status: {response.status_code}")
        print(f"Login response: {response.text}")

        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("access_token")
        return None
    except Exception as e:
        print(f"Login error: {e}")
        return None


if __name__ == "__main__":
    print("Testing ToDo API...")

    # Generate random email
    import random
    test_email = f"test{random.randint(1000, 9999)}@example.com"
    print(f"Testing with email: {test_email}")

    # Test registration (may fail if user exists)
    registration_success = test_user_registration(test_email)
    if registration_success:
        print("✅ User registration successful")

        # Test login
        token = test_user_login(test_email)
        if token:
            print("✅ User login successful")
            print(f"Token: {token[:50]}...")
        else:
            print("❌ User login failed")
    else:
        print("⚠️ User registration failed (may already exist)")

        # Try login with existing user
        token = test_user_login("test@example.com")
        if token:
            print("✅ User login successful with existing user")
            print(f"Token: {token[:50]}...")
        else:
            print("❌ User login failed")
