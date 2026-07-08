@echo off
chcp 65001 >nul
title English by Real Life
cd /d "%~dp0"

echo.
echo ========================================
echo   English by Real Life
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Primeira vez? Instalando dependencias...
    call npm.cmd install
    echo.
)

echo Abrindo o app em http://localhost:3000
echo.
echo IMPORTANTE: Mantenha esta janela aberta enquanto usa o app.
echo Para parar: feche esta janela ou pressione Ctrl+C
echo.

start "" "http://localhost:3000"
call npm.cmd run dev
