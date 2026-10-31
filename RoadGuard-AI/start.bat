@echo off
REM =========================================================================
REM RoadGuard AI - Windows 10/11 Dual Launcher
REM Starts FastAPI backend on :8000 and React Vite frontend on :3000
REM =========================================================================

echo.
echo =======================================================
echo          STARTING ROADGUARD AI PLATFORM
echo =======================================================
echo.

REM Start FastAPI Backend
echo [*] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "RoadGuard AI - Backend API" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start React Frontend
echo [*] Starting React Frontend on http://localhost:3000 ...
start "RoadGuard AI - Frontend UI" cmd /k "cd frontend && npm run dev"

REM Open Browser
timeout /t 3 /nobreak >nul
echo [*] Launching RoadGuard AI in default web browser...
start http://localhost:3000

echo.
echo =======================================================
echo   ROADGUARD AI IS RUNNING!
echo   Frontend:  http://localhost:3000
echo   Backend:   http://127.0.0.1:8000
echo   API Docs:  http://127.0.0.1:8000/docs
echo.
echo   Demo Logins:
echo     Admin:       admin@roadguard.ai       (pass: admin123)
echo     Citizen:     citizen@roadguard.ai     (pass: citizen123)
echo     Maintenance: maintenance@roadguard.ai (pass: maint123)
echo =======================================================
echo.
echo Press any key to close this launcher window (services keep running in background windows).
pause
