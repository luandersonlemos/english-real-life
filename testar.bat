@echo off
chcp 65001 >nul
title Diagnostico - English by Real Life
cd /d "%~dp0"

echo.
echo ========================================
echo   DIAGNOSTICO
echo ========================================
echo.
echo Pasta atual:
echo   %~dp0
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js NAO encontrado
) else (
    for /f "delims=" %%i in ('where node') do echo [OK] Node: %%i
)

where python >nul 2>&1
if errorlevel 1 (
    echo [X] Python NAO encontrado
) else (
    for /f "delims=" %%i in ('where python') do echo [OK] Python: %%i
)

if exist "node_modules\" (
    echo [OK] node_modules existe
) else (
    echo [X] node_modules NAO existe - rode instalar.bat
)

if exist "iniciar.bat" (
    echo [OK] iniciar.bat encontrado
) else (
    echo [X] iniciar.bat NAO encontrado nesta pasta
)

if exist "content\catalog.json" (
    echo [OK] Motor Python configurado
) else (
    echo [!] Motor Python ainda nao configurado
)

echo.
echo Se tudo estiver OK, use: ABRIR APP.bat
echo.
pause
