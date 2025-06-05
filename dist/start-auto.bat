@echo off
setlocal EnableDelayedExpansion
title Markdown Editor - Auto Start

echo ===============================================
echo        Markdown Editor - Auto Start
echo ===============================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Try Node.js first (preferred)
where node >nul 2>&1
if !errorlevel! == 0 (
    echo [OK] Node.js found, starting with Node.js...
    echo [INFO] Browser will open at http://localhost:3001
    echo [INFO] Press Ctrl+C to stop
    echo.
    npx http-server@latest -p 3001 -o -c-1 --cors
    goto :end
)

REM Fallback to Python
where python >nul 2>&1
if !errorlevel! == 0 (
    echo [OK] Python found, starting with Python...
    echo [INFO] Please open http://localhost:8000 in your browser
    echo [INFO] Press Ctrl+C to stop
    echo.
    python -m http.server 8000
    goto :end
)

REM Try py command (Windows Python Launcher)
where py >nul 2>&1
if !errorlevel! == 0 (
    echo [OK] Python launcher found, starting with Python...
    echo [INFO] Please open http://localhost:8000 in your browser
    echo [INFO] Press Ctrl+C to stop
    echo.
    py -m http.server 8000
    goto :end
)

REM No runtime found
echo [ERROR] Neither Node.js nor Python found
echo.
echo Please install one of the following:
echo - Node.js: https://nodejs.org (Recommended)
echo - Python: https://python.org
echo.
echo Press any key to open download page...
pause >nul
start https://nodejs.org
goto :end
pause
exit /b 1

:end
echo.
echo [INFO] Server stopped
pause
