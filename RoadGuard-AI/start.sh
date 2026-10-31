#!/bin/bash
# RoadGuard AI - Unix/Linux/macOS Launcher

echo "=== STARTING ROADGUARD AI ==="
cd backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
cd ..

cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend running (PID: $BACKEND_PID) on http://127.0.0.1:8000"
echo "Frontend running (PID: $FRONTEND_PID) on http://localhost:3000"
wait
