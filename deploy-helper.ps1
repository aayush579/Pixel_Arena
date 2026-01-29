# Pixel Arena - Quick Deploy Script
# Run this after you've deployed your backend

Write-Host "🎮 PIXEL ARENA - DEPLOYMENT HELPER" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Get backend URL
Write-Host "Step 1: Enter your backend URL" -ForegroundColor Yellow
Write-Host "Example: https://pixel-arena-xyz.up.railway.app" -ForegroundColor Gray
$backendUrl = Read-Host "Backend URL"

if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    Write-Host "❌ Backend URL is required!" -ForegroundColor Red
    exit 1
}

# Remove trailing slash if present
$backendUrl = $backendUrl.TrimEnd('/')

# Create WebSocket URL
$wsUrl = $backendUrl -replace '^https://', 'wss://' -replace '^http://', 'ws://'

Write-Host "`n✅ Backend URL: $backendUrl" -ForegroundColor Green
Write-Host "✅ WebSocket URL: $wsUrl`n" -ForegroundColor Green

# Update config.js
Write-Host "Step 2: Updating js/config.js..." -ForegroundColor Yellow

$configPath = "js/config.js"
$configContent = Get-Content $configPath -Raw

# Update the config
$configContent = $configContent -replace "BASE_URL: '[^']*'", "BASE_URL: '$backendUrl/api'"
$configContent = $configContent -replace "WS_URL: '[^']*'", "WS_URL: '$wsUrl'"
$configContent = $configContent -replace "USE_MOCK: true", "USE_MOCK: false"

Set-Content -Path $configPath -Value $configContent

Write-Host "✅ Config updated!`n" -ForegroundColor Green

# Show what was changed
Write-Host "Changes made:" -ForegroundColor Cyan
Write-Host "  - BASE_URL: '$backendUrl/api'" -ForegroundColor White
Write-Host "  - WS_URL: '$wsUrl'" -ForegroundColor White
Write-Host "  - USE_MOCK: false`n" -ForegroundColor White

# Next steps
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test locally: Open index.html in browser" -ForegroundColor White
Write-Host "  2. Deploy frontend: vercel --prod" -ForegroundColor White
Write-Host "  3. Update CORS in backend/server.js with your frontend URL" -ForegroundColor White
Write-Host "  4. Redeploy backend`n" -ForegroundColor White

Write-Host "✨ Ready to deploy! Good luck! 🎮" -ForegroundColor Green
