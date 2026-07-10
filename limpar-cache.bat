@echo off
chcp 65001 >nul
title Limpar cache do app
cd /d "%~dp0"

echo.
echo ========================================
echo   Limpar cache travado
echo ========================================
echo.
echo 1. Feche o Chrome/Edge completamente
echo 2. Abra de novo: http://localhost:3000
echo 3. Pressione Ctrl+Shift+Delete
echo 4. Marque "Imagens e arquivos em cache"
echo 5. Periodo: Ultima hora
echo 6. Limpar dados
echo.
echo No celular:
echo - Chrome: Configuracoes do site ^> Limpar dados
echo - Ou remova o atalho EBRL e instale de novo
echo.
echo Depois rode ABRIR-APP.bat de novo.
echo.
pause
