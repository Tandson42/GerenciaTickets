@echo off
REM start.bat — Script para configurar e iniciar o sistema Chamados (Windows CMD)
REM Alternativa ao PowerShell para Windows
REM
REM Uso:
REM   start.bat              # Sobe backend + frontend
REM   start.bat backend      # Sobe apenas o backend
REM   start.bat frontend     # Sobe apenas o frontend
REM

setlocal enabledelayedexpansion

chcp 65001 >nul

REM ─── Cores (simuladas via atributos) ───────────────────────────────────────
REM Windows CMD não suporta cores RGB, então usamos atributos básicos
REM Este script é uma alternativa mais simples ao PowerShell

if not defined BACKEND_PORT set BACKEND_PORT=8000
if not defined FRONTEND_PORT set FRONTEND_PORT=8081

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   🎫  Sistema de Gestão de Chamados  🎫   ║
echo ╚═══════════════════════════════════════════╝
echo.

if "%1"=="" goto FULL
if /i "%1"=="backend" goto BACKEND_ONLY
if /i "%1"=="frontend" goto FRONTEND_ONLY
if /i "%1"=="help" goto SHOW_HELP
if /i "%1"=="-h" goto SHOW_HELP
if /i "%1"=="--help" goto SHOW_HELP

:SHOW_HELP
echo Uso: start.bat [opcao]
echo.
echo Opcoes:
echo   (sem opcao)  Sobe o sistema completo (backend + frontend)
echo   backend      Sobe apenas o backend (API Laravel)
echo   frontend     Sobe apenas o frontend (Expo Web)
echo   help         Exibe esta ajuda
echo.
echo NOTA: Recomendamos usar o script PowerShell para melhor funcionalidade:
echo   powershell -ExecutionPolicy Bypass -File start.ps1
echo.
goto END

:BACKEND_ONLY
echo [INFO] Iniciando Backend...
cd chamados
echo [INFO] Iniciando Laravel na porta %BACKEND_PORT%...
php artisan serve --host=0.0.0.0 --port=%BACKEND_PORT%
cd ..
goto END

:FRONTEND_ONLY
echo [INFO] Iniciando Frontend...
cd chamados-app
if not exist node_modules (
    echo [INFO] Instalando dependências npm...
    call npm install --silent
)
echo [INFO] Iniciando Expo na porta %FRONTEND_PORT%...
call npx expo start --web --port=%FRONTEND_PORT%
cd ..
goto END

:FULL
echo [INFO] Verificando dependências...
where php >nul 2>nul || (
    echo [ERRO] PHP não encontrado. Instale PHP 8.2+ antes de continuar.
    goto END
)
where composer >nul 2>nul || (
    echo [ERRO] Composer não encontrado. Instale Composer antes de continuar.
    goto END
)
where node >nul 2>nul || (
    echo [ERRO] Node.js não encontrado. Instale Node.js 18+ antes de continuar.
    goto END
)

echo [OK] Todas as dependências encontradas

echo.
echo [INFO] Configurando Backend...
cd chamados

if not exist vendor (
    echo [INFO] Instalando dependências Composer...
    call composer install --no-interaction --prefer-dist --quiet
)

if not exist .env (
    echo [INFO] Criando arquivo .env...
    copy .env.example .env
    php artisan key:generate --quiet
)

if not exist database\database.sqlite (
    echo [INFO] Criando banco SQLite...
    (
        REM Criar arquivo vazio
    ) > database\database.sqlite
)

echo [INFO] Rodando migrations...
php artisan migrate --seed --force --quiet

cd ..

echo.
echo [INFO] Configurando Frontend...
cd chamados-app

if not exist node_modules (
    echo [INFO] Instalando dependências npm...
    call npm install --silent
)

REM Gerar arquivo de configuração
echo [INFO] Gerando configuração da API...

for /f "delims=" %%A in ('powershell -Command "Get-NetIPAddress -AddressFamily IPv4 -Type Unicast | Where-Object { $_.IPAddress -ne '127.0.0.1' } | Select-Object -First 1 -ExpandProperty IPAddress"') do set "LOCAL_IP=%%A"
if "!LOCAL_IP!"=="" set "LOCAL_IP=127.0.0.1"

(
    echo {
    echo   "api_base_url": "http://!LOCAL_IP!:%BACKEND_PORT%/api",
    echo   "backend_url": "http://!LOCAL_IP!:%BACKEND_PORT%",
    echo   "api_port": %BACKEND_PORT%,
    echo   "frontend_port": %FRONTEND_PORT%,
    echo   "environment": "development"
    echo }
) > .api-config.json

cd ..

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║       Sistema será iniciado em novas janelas           ║
echo ║       Pressione Ctrl+C em cada janela para parar       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Iniciar backend em nova janela
echo [INFO] Iniciando Backend na porta %BACKEND_PORT%...
start "Chamados - Backend" cmd /k "cd chamados && php artisan serve --host=0.0.0.0 --port=%BACKEND_PORT%"

REM Aguardar um pouco antes de iniciar frontend
timeout /t 2 /nobreak

REM Iniciar frontend em nova janela
echo [INFO] Iniciando Frontend na porta %FRONTEND_PORT%...
start "Chamados - Frontend" cmd /k "cd chamados-app && npx expo start --web --port=%FRONTEND_PORT%"

echo.
echo Sistema iniciado! Abra o navegador:
echo   Backend:  http://localhost:%BACKEND_PORT%/api
echo   Frontend: http://localhost:%FRONTEND_PORT%
echo.

:END
endlocal
