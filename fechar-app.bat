@echo off
chcp 65001 >nul
title Fechar English by Real Life
cd /d "%~dp0"

echo.
echo Fechando servidor do app...
echo.

for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1

echo Pronto. Agora use ABRIR-APP.bat
echo.
pause
