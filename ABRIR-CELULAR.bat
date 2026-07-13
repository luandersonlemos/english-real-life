@echo off
chcp 65001 >nul
title English by Real Life - Link do celular
cd /d "%~dp0"

echo.
echo ========================================
echo   ABRIR NO CELULAR (mesma Wi-Fi do PC)
echo ========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"Adaptador de Rede sem Fio Wi-Fi" /c:"Endere.o IPv4"') do set _line=%%a
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi' -ErrorAction SilentlyContinue).IPAddress"') do set WIFI_IP=%%i

if "%WIFI_IP%"=="" (
    echo Nao achei o IP do Wi-Fi. Veja em Configuracoes ^> Rede ^> Wi-Fi ^> Propriedades
    echo Use: http://SEU-IP:3000/block/block-01
) else (
    echo Celular e PC na MESMA rede Wi-Fi.
    echo.
    echo Link no celular:
    echo.
    echo   http://%WIFI_IP%:3000/block/block-01
    echo.
    echo Abra no Chrome ou Safari — NAO use o icone antigo da tela inicial.
    echo.
    echo O PC precisa estar com ABRIR-APP.bat aberto.
)

echo.
pause
