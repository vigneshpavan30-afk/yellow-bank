# Yellow Bank - Start All Servers Script
# This script starts both the Mock API Server and Frontend Server

Write-Host "`n🏦 Yellow Bank - Starting Servers`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$projectPath = $PSScriptRoot
if (-not $projectPath) {
    $projectPath = Get-Location
}

Write-Host "📁 Project Path: $projectPath" -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found! Please install npm first." -ForegroundColor Red
    pause
    exit
}

Write-Host ""

# Check if ports are already in use
Write-Host "🔍 Checking ports..." -ForegroundColor Yellow

$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
$port3002 = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue

if ($port3001) {
    Write-Host "⚠️  Port 3001 is already in use. Stopping existing process..." -ForegroundColor Yellow
    $port3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

if ($port3002) {
    Write-Host "⚠️  Port 3002 is already in use. Stopping existing process..." -ForegroundColor Yellow
    $port3002 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

Write-Host "✅ Ports cleared" -ForegroundColor Green
Write-Host ""

# Start Mock API Server (Port 3001)
Write-Host "🚀 Starting Mock API Server (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor Cyan; Write-Host '🚀 Mock API Server (Port 3001)' -ForegroundColor Green; Write-Host ''; node agent/mock-api-server.js"
Start-Sleep -Seconds 2

# Start Frontend Server (Port 3002)
Write-Host "🌐 Starting Frontend Server (Port 3002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor Cyan; Write-Host '🌐 Frontend Server (Port 3002)' -ForegroundColor Cyan; Write-Host ''; node frontend/server.js"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Two PowerShell windows should have opened:" -ForegroundColor Yellow
Write-Host "   1. Mock API Server (Port 3001)" -ForegroundColor White
Write-Host "   2. Frontend Server (Port 3002)" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Waiting 5 seconds for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser
Write-Host ""
Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3002"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 What to do next:" -ForegroundColor Yellow
Write-Host "   1. Check the two PowerShell windows - servers should be running" -ForegroundColor White
Write-Host "   2. Browser should open automatically at http://localhost:3002" -ForegroundColor White
Write-Host "   3. Try typing: 'I want to check my loan details'" -ForegroundColor White
Write-Host ""
Write-Host "💡 To stop servers: Close the PowerShell windows" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
