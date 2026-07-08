@echo off
chcp 65001 >nul
title English by Real Life - Instalando...
cd /d "%~dp0"

echo.
echo ========================================
echo   English by Real Life - Instalacao
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)

echo Instalando dependencias...
call npm.cmd install
if errorlevel 1 (
    echo.
    echo [ERRO] Falha na instalacao.
    pause
    exit /b 1
)

echo.
echo Instalacao concluida!
echo Agora execute: iniciar.bat
echo.
pause
