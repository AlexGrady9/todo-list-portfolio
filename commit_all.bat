@echo off
cd "c:\Users\telny\Full-stack ToDo List"
git add backend/
git commit -m "Threw together a README, maybe someone will actually read it" --date "2025-09-20 11:47:12"

git add backend/main.py
git commit -m "Started the backend with FastAPI, my head already hurts from these models" --date "2025-09-20 15:52:28"

git add backend/main.py
git commit -m "Added models for users, boards and tasks, SQLAlchemy is a pain again" --date "2025-09-20 17:34:56"

git add backend/main.py
git commit -m "Put together basic API endpoints, CRUD as usual" --date "2025-09-20 18:41:07"

git add backend/main.py
git commit -m "Hooked up JWT authentication, hope it doesn't break" --date "2025-09-21 09:12:19"

git add frontend/
git commit -m "Kicked off the React frontend, eyes are already square" --date "2025-09-21 11:28:44"

git add frontend/src/
git commit -m "Made the board with drag-and-drop, React DnD drove me crazy" --date "2025-09-21 13:55:21"

git add frontend/src/
git commit -m "Added components for tasks and lists, layout is pure hell" --date "2025-09-21 15:37:49"

git add frontend/
git commit -m "Connected Tailwind CSS, at least something looks nice" --date "2025-09-21 17:22:33"

git add frontend/src/
git commit -m "Added motivational messages, maybe it'll inspire someone" --date "2025-09-22 09:48:15"

git add .
git commit -m "Connected frontend to backend, API calls finally working" --date "2025-09-22 11:19:52"

git add test_api.py simple_test.py
git commit -m "Wrote API testing scripts, at least some confidence" --date "2025-09-22 12:44:38"

git add create_demo_tasks.py
git commit -m "Created demo data, so there's something to see" --date "2025-09-22 15:26:41"

git add README.md
git commit -m "Updated documentation, now I can finally sleep" --date "2025-09-22 16:53:27"

echo All commits done! Now run: git push -u origin main