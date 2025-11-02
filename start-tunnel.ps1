# Cloudflare Tunnel Startup Script
# This exposes localhost:3000 to the internet for Twilio webhooks

Write-Host "🚀 Starting Cloudflare Tunnel..." -ForegroundColor Cyan
Write-Host "This will expose http://localhost:3000 to the internet" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 INSTRUCTIONS:" -ForegroundColor Green
Write-Host "1. Wait for the tunnel URL (https://abc-123.trycloudflare.com)" -ForegroundColor White
Write-Host "2. Copy the URL" -ForegroundColor White
Write-Host "3. Update .env file: NEXT_PUBLIC_APP_URL='YOUR_URL'" -ForegroundColor White
Write-Host "4. Restart Next.js dev server (Ctrl+C then npm run dev)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Keep this window open while testing!" -ForegroundColor Red
Write-Host ""

& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000
