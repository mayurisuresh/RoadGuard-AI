@echo off
REM =========================================================================
REM RoadGuard AI - Windows 10/11 Automated Setup Script
REM Checks Python, Node.js, creates venv, installs dependencies, seeds SQLite DB
REM =========================================================================

echo.
echo =======================================================
echo          ROADGUARD AI - AUTOMATED SETUP
echo =======================================================
echo.

REM 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python found:
python --version

REM 2. Check Node.js and npm
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found:
node --version
npm --version

REM 3. Create required directories
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\weights" mkdir backend\weights

REM 4. Setup Python Virtual Environment
echo.
echo [*] Setting up Python virtual environment in backend\venv...
if not exist "backend\venv" (
    python -m venv backend\venv
)

echo [*] Installing backend Python dependencies...
call backend\venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

REM 5. Initialize & Seed Database
echo [*] Initializing SQLite database and seeding benchmark data...
python backend\seed.py

REM 6. Setup Frontend
echo.
echo [*] Installing frontend Node.js dependencies...
cd frontend
call npm install
cd ..

echo.
echo =======================================================
echo     SETUP COMPLETE! YOU ARE READY TO RUN ROADGUARD AI
echo =======================================================
echo.
echo To start the application, simply run:
echo    start.bat
echo.
pause
