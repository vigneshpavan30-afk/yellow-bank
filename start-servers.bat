@echo off
REM Yellow Bank - Start All Servers (Batch Script)
REM Double-click this file to start both servers

echo.
echo ========================================
echo   Yellow Bank - Starting Servers
echo ========================================
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo Checking ports...
netstat -ano | findstr ":3001" >nul
if %ERRORLEVEL% EQU 0 (
    echo Port 3001 is in use. Clearing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /F /PID %%a >nul 2>&1
)

netstat -ano | findstr ":3002" >nul
if %ERRORLEVEL% EQU 0 (
    echo Port 3002 is in use. Clearing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002"') do taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting Mock API Server (Port 3001)...
start "Mock API Server" powershell -NoExit -Command "cd '%CD%'; Write-Host 'Mock API Server (Port 3001)' -ForegroundColor Green; node agent/mock-api-server.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend Server (Port 3002)...
start "Frontend Server" powershell -NoExit -Command "cd '%CD%'; Write-Host 'Frontend Server (Port 3002)' -ForegroundColor Cyan; node frontend/server.js"

timeout /t 5 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:3002

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Two windows should have opened:
echo   1. Mock API Server (Port 3001)
echo   2. Frontend Server (Port 3002)
echo.
echo Browser should open at http://localhost:3002
echo.
echo To stop servers: Close the PowerShell windows
echo.
pause
