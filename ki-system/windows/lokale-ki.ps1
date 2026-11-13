# Lokale KI fuer A und T einrichten: Ollama installieren, Zugriff erlauben, Modell laden.
# Mit -Art hermes wird das freie Modell Hermes (Nous Research) geladen.
param([string]$Art = 'standard')
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
function Schritt($text) { Write-Host ''; Write-Host $text -ForegroundColor Yellow }

function Finde-Ollama {
  $pfad = Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama.exe'
  if (Test-Path $pfad) { return $pfad }
  $cmd = Get-Command ollama -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

function Warte-Auf-Ollama {
  for ($i = 0; $i -lt 40; $i++) {
    try { Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 | Out-Null; return $true } catch { Start-Sleep -Seconds 1 }
  }
  return $false
}

try {
  Write-Host 'A&T - Lokale KI einrichten' -ForegroundColor Green
  Write-Host 'Die KI laeuft danach auf diesem PC: kostenlos, ohne Limit, ohne Konto.'

  $ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
  if ($Art -eq 'hermes') {
    if ($ramGB -ge 14) { $modell = 'hermes3:8b'; $groesse = 'etwa 5 GB' } else { $modell = 'hermes3:3b'; $groesse = 'etwa 2 GB' }
  } elseif ($ramGB -ge 30) { $modell = 'qwen3:14b'; $groesse = 'etwa 9 GB' } elseif ($ramGB -ge 14) { $modell = 'qwen3:8b'; $groesse = 'etwa 5 GB' } else { $modell = 'qwen3:4b'; $groesse = 'etwa 2.5 GB' }
  Write-Host ("Arbeitsspeicher: " + $ramGB + " GB. Gewaehltes Modell: " + $modell + " (" + $groesse + ").")
  if ($ramGB -lt 8) { Write-Host 'Hinweis: Mit weniger als 8 GB Arbeitsspeicher antwortet die KI langsam.' -ForegroundColor DarkYellow }

  # 1. Ollama installieren (falls noch nicht da)
  $ollama = Finde-Ollama
  if (-not $ollama) {
    Schritt '1/3 Ollama wird installiert ...'
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
      & winget install --id Ollama.Ollama -e --silent --accept-source-agreements --accept-package-agreements
    }
    $ollama = Finde-Ollama
    if (-not $ollama) {
      Write-Host 'Lade das Installationsprogramm von ollama.com ...'
      $setup = Join-Path $env:TEMP 'OllamaSetup.exe'
      Invoke-WebRequest -Uri 'https://ollama.com/download/OllamaSetup.exe' -OutFile $setup -UseBasicParsing
      Start-Process -FilePath $setup -ArgumentList '/SILENT' -Wait
      $ollama = Finde-Ollama
    }
    if (-not $ollama) { throw 'Ollama konnte nicht installiert werden. Installiere es von https://ollama.com und starte dieses Skript nochmal.' }
  } else {
    Schritt '1/3 Ollama ist schon installiert.'
  }

  # 2. A und T den Zugriff erlauben und Ollama neu starten
  Schritt '2/3 Zugriff fuer A&T einrichten ...'
  [Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
  $env:OLLAMA_ORIGINS = '*'
  Get-Process -Name 'ollama app', 'ollama', 'Ollama' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
  $app = Join-Path (Split-Path $ollama) 'ollama app.exe'
  if (Test-Path $app) { Start-Process -FilePath $app } else { Start-Process -FilePath $ollama -ArgumentList 'serve' -WindowStyle Hidden }
  if (-not (Warte-Auf-Ollama)) {
    Start-Process -FilePath $ollama -ArgumentList 'serve' -WindowStyle Hidden
    if (-not (Warte-Auf-Ollama)) { throw 'Ollama startet nicht. Starte den PC neu und versuche es nochmal.' }
  }

  # 3. Modell laden
  Schritt ('3/3 KI-Modell ' + $modell + ' wird geladen (einmalig, ' + $groesse + '). Das kann eine Weile dauern ...')
  & $ollama pull $modell
  if ($LASTEXITCODE -ne 0) { throw 'Das Modell konnte nicht geladen werden. Pruefe dein Internet und starte das Skript nochmal.' }

  Write-Host ''
  Write-Host 'Fertig! Die lokale KI ist bereit.' -ForegroundColor Green
  Write-Host 'Oeffne A&T. A&T findet die lokale KI automatisch (unter "Ich" steht dann "Lokal").'
  Write-Host 'Ollama startet kuenftig mit Windows. Du musst nichts weiter tun.'
} catch {
  Write-Host ''
  Write-Host ('Das hat nicht geklappt: ' + $_.Exception.Message) -ForegroundColor Red
}
