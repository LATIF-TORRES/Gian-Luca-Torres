# Startet A und T. Vorher wird kurz geprueft, ob es eine neuere Version gibt.
# Wenn ja: herunterladen, Dateien ersetzen, dann starten. Die Daten der Nutzer
# (Gespraeche, Gedaechtnis, Geldbuch) liegen im Browser und bleiben erhalten.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$ordner = Split-Path -Parent $MyInvocation.MyCommand.Path
$protokoll = Join-Path (Split-Path -Parent $ordner) 'update.log'
function Notiz($text) {
  try { Add-Content -Path $protokoll -Value ((Get-Date -Format 's') + ' ' + $text) } catch {}
}

try {
  # GitHub verlangt TLS 1.2 (aeltere Windows-PowerShell nutzt sonst TLS 1.0).
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
  $lokal = (Get-Content -Raw -Path (Join-Path $ordner 'version.json') | ConvertFrom-Json)
  $online = Invoke-RestMethod -Uri ($lokal.pruefen + '?t=' + [DateTime]::Now.Ticks) -TimeoutSec 4
  if ([version]$online.version -gt [version]$lokal.version) {
    Notiz ('Update ' + $lokal.version + ' -> ' + $online.version)
    $zip = Join-Path $env:TEMP 'A-und-T-update.zip'
    $tmp = Join-Path $env:TEMP 'A-und-T-update'
    Invoke-WebRequest -Uri $online.download -OutFile $zip -UseBasicParsing -TimeoutSec 120
    if (Test-Path $tmp) { Remove-Item -Path $tmp -Recurse -Force }
    Expand-Archive -Path $zip -DestinationPath $tmp -Force
    $neu = Join-Path $tmp 'A-und-T\app'
    if (-not (Test-Path (Join-Path $neu 'index.html'))) { throw 'Update-Paket unvollstaendig' }
    & robocopy.exe $neu $ordner /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) { throw ('Kopieren fehlgeschlagen, robocopy ' + $LASTEXITCODE) }
    Remove-Item -Path $zip, $tmp -Recurse -Force -ErrorAction SilentlyContinue
    Notiz 'Update fertig'
  }
} catch {
  # Ohne Internet oder bei Problemen einfach die vorhandene Version starten.
  Notiz ('Kein Update: ' + $_.Exception.Message)
}

$app = Join-Path $ordner 'index.html'
$url = ([System.Uri]$app).AbsoluteUri
$edge = @(
  (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
  (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($edge) { Start-Process -FilePath $edge -ArgumentList ('--app="' + $url + '"') } else { Start-Process -FilePath $app }
