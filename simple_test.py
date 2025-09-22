import requests

try:
    # Test simple registration
    resp = requests.post("http://127.0.0.1:8006/register",
                         json={"email": "newuser@test.com", "password": "test123"})
    print(f"Registration: {resp.status_code} - {resp.text}")

    if resp.status_code == 200:
        # Test login
        resp = requests.post("http://127.0.0.1:8006/token",
                             data={"username": "newuser@test.com", "password": "test123"})
        print(f"Login: {resp.status_code} - {resp.text}")
    else:
        # Try existing user
        resp = requests.post("http://127.0.0.1:8006/token",
                             data={"username": "test@example.com", "password": "testpassword123"})
        print(f"Login existing: {resp.status_code} - {resp.text}")

except Exception as e:
    print(f"Error: {e}")
