# Graceful Server Shutdown Script
Write-Host "Gracefully stopping Waste Dashboard Server..." -ForegroundColor Green
Write-Host "This will preserve all your data." -ForegroundColor Green
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/admin/shutdown" -Method POST -ErrorAction Stop
    Write-Host "✓ Server shutdown request sent successfully." -ForegroundColor Green
    Write-Host "✓ All data has been preserved." -ForegroundColor Green
    Write-Host "Response: $($response.message)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠ Could not connect to server. It may already be stopped." -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Alternative ways to stop the server:" -ForegroundColor White
Write-Host "1. Press Ctrl+C in the terminal running the server" -ForegroundColor Gray
Write-Host "2. Close the terminal window running npm run dev" -ForegroundColor Gray
Write-Host "3. Run this script again" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to continue"