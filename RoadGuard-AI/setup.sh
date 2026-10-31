#!/bin/bash
# RoadGuard AI - Unix/Linux/macOS Automated Setup Script
set -e

echo "=== ROADGUARD AI - UNIX SETUP ==="
python3 --version
node -v
npm -v

mkdir -p backend/uploads backend/weights

echo "[*] Setting up Python virtual environment..."
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt

echo "[*] Seeding database..."
python3 backend/seed.py

echo "[*] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "=== SETUP COMPLETE! Run ./start.sh to launch ==="
