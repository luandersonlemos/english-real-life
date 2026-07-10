@echo off
chcp 65001 >nul
title English by Real Life - NAO FECHE
cd /d "%~dp0"

echo. > abrir-log.txt
echo === INICIO %date% %time% === >> abrir-log.txt

echo.
echo ========================================
echo   English by Real Life
echo ========================================
echo.
echo Pasta: %~dp0
echo.
echo NAO FECHE esta janela enquanto estuda.
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado. Instale em nodejs.org
    echo [ERRO] Node.js nao encontrado >> abrir-log.txt
    pause
    exit /b 1
)

echo [1/4] Fechando servidor antigo...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1
ping 127.0.0.1 -n 3 >nul
echo       OK
echo.

if not exist "node_modules\" (
    echo [2/4] Instalando dependencias - aguarde 1 a 3 min...
    call npm.cmd install >> abrir-log.txt 2>&1
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao. Veja abrir-log.txt
        pause
        exit /b 1
    )
    echo       OK
) else (
    echo [2/4] Dependencias OK
)
echo.

if not exist "content\catalog.json" (
    echo [3/4] Configurando motor Python...
    call motor.bat setup >> abrir-log.txt 2>&1
) else (
    echo [3/4] Motor Python OK
)
echo.

echo [4/4] Iniciando servidor...
echo       Quando aparecer Ready, o app esta pronto.
echo       O navegador abrira em 20 segundos.
echo.

start "" cmd /c "ping 127.0.0.1 -n 21 >nul & start http://localhost:3000/"

call npm.cmd run dev >> abrir-log.txt 2>&1
if errorlevel 1 (
    echo.
    echo [ERRO] Servidor nao iniciou. Veja o arquivo abrir-log.txt nesta pasta.
    echo.
    start http://localhost:3000/
    pause
    exit /b 1
)

pause
