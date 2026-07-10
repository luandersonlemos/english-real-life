@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PYTHONPATH=%~dp0scripts"

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="install" goto install
if "%1"=="setup" goto setup
if "%1"=="sync" goto sync
if "%1"=="daily" goto daily
if "%1"=="status" goto status
if "%1"=="journal" goto journal
if "%1"=="audio" goto audio
goto run

:install
python -m pip install -r scripts\requirements.txt
echo.
echo Dependencias instaladas.
exit /b 0

:setup
call :install
call npm.cmd run catalog
if errorlevel 1 (
    echo [ERRO] Falha ao exportar catalogo. Rode instalar.bat antes.
    exit /b 1
)
python -m ebrl setup
goto end

:sync
python -m ebrl sync
goto end

:daily
python -m ebrl daily
goto end

:status
python -m ebrl status
goto end

:journal
python -m ebrl journal
goto end

:audio
python -m ebrl audio %2
goto end

:run
python -m ebrl %*
goto end

:help
echo EBRL Motor — English by Real Life
echo.
echo   motor.bat setup     Configura tudo automaticamente
echo   motor.bat install   Instala dependencias Python
echo   motor.bat sync      Atualiza catalogo dos blocos
echo   motor.bat daily     Gera a aula do dia
echo   motor.bat status    Mostra progresso
echo   motor.bat audio     Gera audios de pronuncia (edge-tts)
echo.
echo Dica: use iniciar.bat — ele ja configura o motor sozinho.

:end
