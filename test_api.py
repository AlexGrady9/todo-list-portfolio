#!/usr/bin/env python3
"""
Script for testing ToDo application API
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8006"


def test_register():
    """Test user registration"""
    data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    try:
        response = requests.post(f"{BASE_URL}/register", json=data)
        print(f"✅ Registration: {response.status_code} - {response.json()}")
        # 400 if already registered
        return response.status_code in [200, 400]
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False


def test_login():
    """Test login"""
    data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    try:
        response = requests.post(f"{BASE_URL}/token", data=data)
        if response.status_code == 200:
            token = response.json().get("access_token")
            print(f"✅ Login: token received")
            return token
        else:
            print(f"❌ Login error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None


def test_create_board(token):
    """Test board creation"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {"title": "Test Board"}
    try:
        response = requests.post(
            f"{BASE_URL}/boards", json=data, headers=headers)
        if response.status_code == 200:
            board = response.json()
            print(f"✅ Board creation: ID {board['id']}")
            return board['id']
        else:
            print(f"❌ Board creation error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Board creation error: {e}")
        return None


def test_get_boards(token):
    """Test getting board list"""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/boards", headers=headers)
        if response.status_code == 200:
            boards = response.json()
            print(f"✅ Get boards: found {len(boards)} boards")
            return True
        else:
            print(f"❌ Get boards error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get boards error: {e}")
        return False


def test_create_task(token, board_id):
    """Test task creation"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": "Test Task",
        "description": "Test task description",
        "board_id": board_id
    }
    try:
        response = requests.post(
            f"{BASE_URL}/tasks", json=data, headers=headers)
        if response.status_code == 200:
            task = response.json()
            print(f"✅ Task creation: ID {task['id']}")
            return task['id']
        else:
            print(f"❌ Task creation error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Task creation error: {e}")
        return None


def test_get_tasks(token, board_id):
    """Test getting tasks"""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(
            f"{BASE_URL}/tasks?board_id={board_id}", headers=headers)
        if response.status_code == 200:
            tasks = response.json()
            print(f"✅ Get tasks: found {len(tasks)} tasks")
            return True
        else:
            print(f"❌ Get tasks error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get tasks error: {e}")
        return False


def test_update_task(token, task_id):
    """Change a task's status"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {"status": "in-progress"}
    try:
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}", json=data, headers=headers)
        if response.status_code == 200:
            print("✅ Task update: status changed")
            return True
        else:
            print(f"❌ Task update error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Task update error: {e}")
        return False


def main():
    """Main testing function"""
    print("🚀 Starting API tests...")
    print("=" * 50)

    # Test registration
    if not test_register():
        return

    # Test login
    token = test_login()
    if not token:
        return

    # Test board creation
    board_id = test_create_board(token)
    if not board_id:
        return

    # Test get boards
    if not test_get_boards(token):
        return

    # Test task creation
    task_id = test_create_task(token, board_id)
    if not task_id:
        return

    # Test get tasks
    if not test_get_tasks(token, board_id):
        return

    # Test task update
    if not test_update_task(token, task_id):
        return

    print("=" * 50)
    print("🎉 All tests passed successfully!")
    print("✅ Backend API is working correctly")
    print("🌐 Frontend available at: http://localhost:3000")
    print("📚 API documentation: http://localhost:8006/docs")


if __name__ == "__main__":
    main()
