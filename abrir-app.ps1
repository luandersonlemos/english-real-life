Set-Location $PSScriptRoot
Write-Host ""
Write-Host "English by Real Life - iniciando..." -ForegroundColor Cyan
Write-Host "Pasta: $PSScriptRoot"
Write-Host ""

# Fechar servidor antigo
Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 2

# Abrir navegador depois de 20 segundos
Start-Job {
  Start-Sleep -Seconds 20
  Start-Process "http://localhost:3000/"
} | Out-Null

Write-Host "Servidor iniciando... NAO FECHE esta janela." -ForegroundColor Yellow
Write-Host "Navegador abrira em ~20 segundos." -ForegroundColor Yellow
Write-Host ""

npm.cmd run dev
