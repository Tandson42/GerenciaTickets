# start.ps1 — Script para configurar e iniciar o sistema Chamados completo
#             (Backend Laravel + Frontend React Native/Expo Web)
#             Versão para Windows (PowerShell 5.1+)
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File start.ps1              # Sobe backend + frontend
#   powershell -ExecutionPolicy Bypass -File start.ps1 -Backend     # Sobe apenas o backend
#   powershell -ExecutionPolicy Bypass -File start.ps1 -Frontend    # Sobe apenas o frontend
#   powershell -ExecutionPolicy Bypass -File start.ps1 -Test        # Roda os testes
#   powershell -ExecutionPolicy Bypass -File start.ps1 -Reset       # Reseta o banco
#

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Test,
    [switch]$Reset,
    [switch]$Help
)

# ─── Cores ────────────────────────────────────────────────────────────────────
$Colors = @{
    Red    = 'Red'
    Green  = 'Green'
    Yellow = 'Yellow'
    Blue   = 'Cyan'
    Cyan   = 'Cyan'
}

# ─── Helpers ───────────────────────────────────────────────────────────────────
function Write-Info    { Write-Host "[INFO]   $args" -ForegroundColor $Colors.Blue }
function Write-Success { Write-Host "[OK]     $args" -ForegroundColor $Colors.Green }
function Write-Warn    { Write-Host "[AVISO]  $args" -ForegroundColor $Colors.Yellow }
function Write-Error   { Write-Host "[ERRO]   $args" -ForegroundColor $Colors.Red; exit 1 }
function Write-Header  { Write-Host "`n$('═' * 60)`n$args`n$('═' * 60)`n" -ForegroundColor $Colors.Cyan }

# ─── Diretórios do projeto ────────────────────────────────────────────────────
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "chamados"
$FrontendDir = Join-Path $RootDir "chamados-app"

# ─── Detectar IP local ────────────────────────────────────────────────────────
function Get-LocalIP {
    try {
        # Tentar obter o primeiro IP não-loopback
        $ip = Get-NetIPAddress -AddressFamily IPv4 -Type Unicast | 
            Where-Object { $_.IPAddress -ne '127.0.0.1' } | 
            Select-Object -First 1 -ExpandProperty IPAddress
        
        if ($ip) {
            return $ip
        }
    } catch {
        # Fallback se houver erro
    }
    
    # Último resort: tentar via hostname
    try {
        $hostname = [System.Net.Dns]::GetHostName()
        $hostEntry = [System.Net.Dns]::GetHostByName($hostname)
        $ip = $hostEntry.AddressList[0].IPAddressToString
        if ($ip -and $ip -ne '127.0.0.1') {
            return $ip
        }
    } catch {
        # Não fazer nada
    }
    
    return '127.0.0.1'
}

$LocalIP = Get-LocalIP
$BackendPort = 8000
$FrontendPort = 8081

# ─── Verificar dependências ───────────────────────────────────────────────────
function Test-Dependencies {
    Write-Header "🔍 Verificando Dependências (Windows)"
    
    Write-Success "IP Detectado: $LocalIP"
    
    $missing = @()
    
    # Verificar PHP
    if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
        $missing += "php (>= 8.2)"
    } else {
        $phpVersion = php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;"
        Write-Success "PHP $phpVersion encontrado"
    }
    
    # Verificar Composer
    if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
        $missing += "composer"
    } else {
        Write-Success "Composer encontrado"
    }
    
    # Verificar Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $missing += "node (>= 18)"
    } else {
        $nodeVersion = node -v
        Write-Success "Node.js $nodeVersion encontrado"
    }
    
    # Verificar npm
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        $missing += "npm"
    } else {
        Write-Success "npm encontrado"
    }
    
    if ($missing.Length -gt 0) {
        Write-Error "Dependências não encontradas: $($missing -join ', ')`nInstale-as antes de continuar."
    }
    
    Write-Success "Todas as dependências encontradas!"
}

# ─── Setup Backend ────────────────────────────────────────────────────────────
function Setup-Backend {
    Write-Header "⚙️  Configurando Backend (Laravel)"
    
    Push-Location $BackendDir
    
    # Instalar dependências PHP
    if (-not (Test-Path "vendor")) {
        Write-Info "Instalando dependências do Composer..."
        composer install --no-interaction --prefer-dist --quiet
        Write-Success "Dependências do Composer instaladas"
    } else {
        Write-Success "Dependências do Composer já instaladas"
    }
    
    # Configurar .env
    if (-not (Test-Path ".env")) {
        Write-Info "Criando arquivo .env..."
        Copy-Item ".env.example" ".env"
        php artisan key:generate --quiet
        Write-Success "Arquivo .env criado e chave gerada"
    } else {
        Write-Success "Arquivo .env já existe"
    }
    
    # Criar banco SQLite
    $dbPath = Join-Path "database" "database.sqlite"
    if (-not (Test-Path $dbPath)) {
        Write-Info "Criando banco de dados SQLite..."
        New-Item $dbPath -ItemType File | Out-Null
        Write-Success "Banco de dados criado"
    } else {
        Write-Success "Banco de dados já existe"
    }
    
    # Rodar migrations e seeds
    Write-Info "Executando migrations e seeders..."
    try {
        php artisan migrate --seed --force --quiet 2>$null
    } catch {
        Write-Warn "Tentando migrate:fresh..."
        php artisan migrate:fresh --seed --force --quiet
    }
    Write-Success "Migrations e seeders executados"
    
    Pop-Location
}

# ─── Setup Frontend ───────────────────────────────────────────────────────────
function Setup-Frontend {
    Write-Header "⚙️  Configurando Frontend (Expo/React Native)"
    
    Push-Location $FrontendDir
    
    # Instalar dependências Node
    if (-not (Test-Path "node_modules")) {
        Write-Info "Instalando dependências do npm..."
        npm install --silent 2>$null
        Write-Success "Dependências do npm instaladas"
    } else {
        Write-Success "Dependências do npm já instaladas"
    }
    
    # Gerar arquivo de configuração da API dinamicamente
    Write-Info "Gerando configuração de API para http://${LocalIP}:${BackendPort}/api ..."
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $configContent = @"
{
  "api_base_url": "http://$LocalIP`:$BackendPort/api",
  "backend_url": "http://$LocalIP`:$BackendPort",
  "api_port": $BackendPort,
  "frontend_port": $FrontendPort,
  "environment": "development",
  "generated_at": "$timestamp",
  "platform_values": {
    "android_emulator": "http://10.0.2.2:$BackendPort/api",
    "ios_simulator": "http://localhost:$BackendPort/api",
    "physical_device": "http://$LocalIP`:$BackendPort/api"
  }
}
"@
    
    Set-Content -Path ".api-config.json" -Value $configContent -Encoding UTF8
    Write-Success "Arquivo .api-config.json gerado com sucesso"
    
    Pop-Location
}

# ─── Iniciar Backend ──────────────────────────────────────────────────────────
function Start-Backend {
    Write-Header "🚀 Iniciando Backend (Laravel)"
    
    Push-Location $BackendDir
    
    Write-Info "Iniciando Laravel na porta $BackendPort..."
    
    # Iniciar o servidor em uma nova janela PowerShell
    $backendScript = @"
        `$ErrorActionPreference = 'Continue'
        Push-Location "$BackendDir"
        Write-Host ""
        Write-Host "Backend iniciando..." -ForegroundColor Cyan
        Write-Host ""
        php artisan serve --host=0.0.0.0 --port=$BackendPort
    "@
    
    Start-Process powershell -ArgumentList @("
        -NoExit",
        "-Command",
        $backendScript
    ) -WindowStyle Normal
    
    Write-Success "Backend iniciando em http://${LocalIP}:${BackendPort}"
    
    Start-Sleep -Seconds 2
    
    Pop-Location
}

# ─── Iniciar Frontend ─────────────────────────────────────────────────────────
function Start-Frontend {
    Write-Header "🚀 Iniciando Frontend (Expo Web)"
    
    Push-Location $FrontendDir
    
    Write-Info "Iniciando Expo Web na porta $FrontendPort..."
    
    # Iniciar em uma nova janela PowerShell
    $frontendScript = @"
        `$ErrorActionPreference = 'Continue'
        Push-Location "$FrontendDir"
        Write-Host ""
        Write-Host "Frontend iniciando..." -ForegroundColor Green
        Write-Host ""
        npx expo start --web --port=$FrontendPort
    "@
    
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        $frontendScript
    ) -WindowStyle Normal
    
    Write-Success "Frontend iniciando em http://localhost:${FrontendPort}"
    
    Pop-Location
}

# ─── Rodar Testes ─────────────────────────────────────────────────────────────
function Start-Tests {
    Write-Header "🧪 Executando Testes (Pest)"
    
    Push-Location $BackendDir
    
    php artisan config:clear --quiet 2>$null
    .\vendor\bin\pest.bat
    
    Pop-Location
}

# ─── Resetar Banco ────────────────────────────────────────────────────────────
function Reset-Database {
    Write-Header "🔄 Resetando Banco de Dados"
    
    Push-Location $BackendDir
    
    Write-Info "Executando migrate:fresh --seed..."
    php artisan migrate:fresh --seed --force
    Write-Success "Banco resetado com sucesso!"
    
    Pop-Location
}

# ─── Mostrar informações finais ────────────────────────────────────────────────
function Show-Info {
    Write-Host "`n"
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           🎫 Sistema de Chamados - Rodando!               ║" -ForegroundColor Cyan
    Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║                                                            ║" -ForegroundColor Cyan
    Write-Host "║  Backend (API):   http://$LocalIP`:$BackendPort              " -ForegroundColor Cyan -NoNewline
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "║  Frontend (Web):  http://localhost:$FrontendPort              " -ForegroundColor Cyan -NoNewline
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "║                                                            ║" -ForegroundColor Cyan
    Write-Host "║  Credenciais de teste:                                     ║" -ForegroundColor Cyan
    Write-Host "║  Admin:  admin@example.com / password123                   ║" -ForegroundColor Cyan
    Write-Host "║  User:   user@example.com  / password123                   ║" -ForegroundColor Cyan
    Write-Host "║                                                            ║" -ForegroundColor Cyan
    Write-Host "║  💡 As janelas do Backend e Frontend estarão abertas      ║" -ForegroundColor Cyan
    Write-Host "║     em novas abas do PowerShell. Feche-as para encerrar.  ║" -ForegroundColor Cyan
    Write-Host "║                                                            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host "`n"
}

# ─── Mostrar ajuda ─────────────────────────────────────────────────────────────
function Show-Help {
    Write-Host @"

Uso: powershell -ExecutionPolicy Bypass -File start.ps1 [opção]

Opções:
  (sem opção)    Sobe o sistema completo (backend + frontend)
  -Backend       Sobe apenas o backend (API Laravel)
  -Frontend      Sobe apenas o frontend (Expo Web)
  -Test          Configura o backend e roda os testes
  -Reset         Reseta o banco de dados (migrate:fresh --seed)
  -Help          Exibe esta ajuda

Exemplos:
  powershell -ExecutionPolicy Bypass -File start.ps1
  powershell -ExecutionPolicy Bypass -File start.ps1 -Backend
  powershell -ExecutionPolicy Bypass -File start.ps1 -Test

"@
}

# ─── Main ──────────────────────────────────────────────────────────────────────
function Main {
    Write-Host @"

╔═══════════════════════════════════════════╗
║   🎫  Sistema de Gestão de Chamados  🎫   ║
╚═══════════════════════════════════════════╝

" -ForegroundColor Cyan
    
    if ($Help) {
        Show-Help
        return
    }
    
    if ($Backend) {
        Test-Dependencies
        Setup-Backend
        Start-Backend
        Write-Host "`nBackend (API): http://$LocalIP`:$BackendPort`n" -ForegroundColor Green
    } elseif ($Frontend) {
        Test-Dependencies
        Setup-Frontend
        Start-Frontend
        Write-Host "`nFrontend (Web): http://localhost:$FrontendPort`n" -ForegroundColor Green
    } elseif ($Test) {
        Test-Dependencies
        Setup-Backend
        Start-Tests
    } elseif ($Reset) {
        Test-Dependencies
        Reset-Database
    } else {
        # Sobe o sistema completo
        Test-Dependencies
        Setup-Backend
        Setup-Frontend
        Start-Backend
        Start-Frontend
        Show-Info
    }
}

# Executar o Main
Main
