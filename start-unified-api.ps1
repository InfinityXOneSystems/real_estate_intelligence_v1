#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Launch Real Estate Intelligence API Server with Full AI Integration

.DESCRIPTION
    Quick launcher for the unified AI-powered backend
#>

$ErrorActionPreference = 'Stop'

Write-Host "`n🚀 Real Estate Intelligence - Unified AI Backend" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Install dependencies if needed
if (!(Test-Path "node_modules/cors")) {
    Write-Host "📦 Installing missing dependencies..." -ForegroundColor Yellow
    npm install cors @types/cors
}

Write-Host "✅ Starting API Server on port 4000..." -ForegroundColor Green
Write-Host "`n📡 Available Endpoints:" -ForegroundColor Cyan
Write-Host "   • Health:          http://localhost:4000/health" -ForegroundColor White
Write-Host "   • System Status:   http://localhost:4000/api/status" -ForegroundColor White
Write-Host "   • AI Health:       http://localhost:4000/api/ai/health" -ForegroundColor White
Write-Host "   • Market Overview: http://localhost:4000/api/real-estate/overview" -ForegroundColor White
Write-Host "   • AI Query:        POST http://localhost:4000/api/ai/query" -ForegroundColor White
Write-Host "`n🌐 CORS enabled for Hostinger frontend`n" -ForegroundColor Green

npm run dashboard:serve
