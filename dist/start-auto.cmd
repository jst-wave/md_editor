@echo off
setlocal
title Markdown Editor - Auto Start

:: ===============================================
:: Markdown Editor - Auto Start
:: ===============================================

echo ===============================================
echo        Markdown Editor - Auto Start
echo ===============================================
echo.

:: スクリプトのディレクトリに移動
pushd "%~dp0"

:: Node.jsの確認
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js found, starting with Node.js...
    echo [INFO] Browser will open at http://localhost:3001
    echo [INFO] Press Ctrl+C to stop
    echo.
    npx http-server@latest -p 3001 -o -c-1 --cors
    goto :cleanup
)

:: Pythonの確認
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python found, starting with Python...
    echo [INFO] Please open http://localhost:8000 in your browser
    echo [INFO] Press Ctrl+C to stop
    echo.
    python -m http.server 8000
    goto :cleanup
)

:: Python launcherの確認
where py >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python launcher found, starting with Python...
    echo [INFO] Please open http://localhost:8000 in your browser
    echo [INFO] Press Ctrl+C to stop
    echo.
    py -m http.server 8000
    goto :cleanup
)

:: ランタイムが見つからない
echo [ERROR] Neither Node.js nor Python found
echo.
echo Please install one of the following:
echo - Node.js: https://nodejs.org (Recommended)
echo - Python: https://python.org
echo.
set /p choice="Open Node.js download page? (y/n): "
if /i "%choice%"=="y" start https://nodejs.org

:cleanup
popd
echo.
echo [INFO] Server stopped
pause
exit /b 0
