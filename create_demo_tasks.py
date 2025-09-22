import requests
import json

try:
    base_url = "http://127.0.0.1:8006"

    # Login with existing user
    resp = requests.post(f"{base_url}/token",
                         data={"username": "newuser@test.com", "password": "test123"})

    if resp.status_code == 200:
        token_data = resp.json()
        token = token_data['access_token']
        headers = {"Authorization": f"Bearer {token}"}

        print("✅ Login successful!")

        # Create a demo board
        board_resp = requests.post(f"{base_url}/boards",
                                   json={"title": "Demo board with motivation"},
                                   headers=headers)

        if board_resp.status_code == 200:
            board_data = board_resp.json()
            board_id = board_data['id']
            print(f"✅ Board created: {board_data['title']}")

            # Create demo tasks
            demo_tasks = [
                {"title": "Learn React",
                    "description": "Master React basics and components"},
                {"title": "Set up API", "description": "Create FastAPI backend with JWT"},
                {"title": "Add styles", "description": "Apply Tailwind CSS"},
                {"title": "Test everything", "description": "Verify all functions"}
            ]

            created_tasks = []
            for task in demo_tasks:
                task_resp = requests.post(f"{base_url}/tasks",
                                          json={**task, "board_id": board_id},
                                          headers=headers)
                if task_resp.status_code == 200:
                    created_tasks.append(task_resp.json())
                    print(f"✅ Task created: {task['title']}")

            print(f"\n🎯 Created {len(created_tasks)} tasks!")
            print(
                "Now drag tasks to the 'Done' column to see motivational notifications! 🎉")

        else:
            print(f"❌ Board creation error: {board_resp.text}")
    else:
        print(f"❌ Login error: {resp.text}")

except Exception as e:
    print(f"❌ Error: {e}")
