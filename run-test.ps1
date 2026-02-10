# Yellow Bank Agent - Quick Test Script
Write-Host "`n🏦 Yellow Bank Agent - Quick Test`n" -ForegroundColor Cyan
Write-Host "Starting Mock API Server in background...`n" -ForegroundColor Yellow

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node agent/mock-api-server.js
}

# Wait for server to start
Start-Sleep -Seconds 3

Write-Host "✅ Server started!`n" -ForegroundColor Green
Write-Host "Starting interactive test...`n" -ForegroundColor Cyan
Write-Host "─" * 50
Write-Host ""

# Run interactive test
node agent/test-agent.js

# Cleanup
Stop-Job $serverJob
Remove-Job $serverJob
