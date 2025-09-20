@echo off
cd /d "c:\Users\telny\Full-stack ToDo List\backend"
call .\venv\Scripts\activate.bat
uvicorn main:app --host 127.0.0.1 --port 8006