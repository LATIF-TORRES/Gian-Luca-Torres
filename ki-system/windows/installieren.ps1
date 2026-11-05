# A&T installieren: App nach %LOCALAPPDATA%\A-und-T kopieren,
# Verknuepfungen auf dem Desktop und im Startmenue anlegen, dann starten.
$ErrorActionPreference = 'Stop'
try {
  $quelle = Split-Path -Parent $MyInvocation.MyCommand.Path
  $ziel = Join-Path $env:LOCALAPPDATA 'A-und-T\app'
  New-Item -ItemType Directory -Force -Path $ziel | Out-Null
  Copy-Item -Path (Join-Path $quelle '*') -Destination $ziel -Recurse -Force

  $app = Join-Path $ziel 'index.html'
  $symbol = Join-Path $ziel 'a-und-t.ico'
  $url = ([System.Uri]$app).AbsoluteUri
  $edge = @(
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')
  ) | Where-Object { Test-Path $_ } | Select-Object -First 1

  $shell = New-Object -ComObject WScript.Shell
  $orte = @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))
  foreach ($ort in $orte) {
    $lnk = $shell.CreateShortcut((Join-Path $ort 'A&T - Amanah & Tijara.lnk'))
    if ($edge) {
      $lnk.TargetPath = $edge
      $lnk.Arguments = '--app="' + $url + '"'
    } else {
      $lnk.TargetPath = $app
    }
    $lnk.IconLocation = $symbol
    $lnk.WorkingDirectory = $ziel
    $lnk.Description = 'A&T - Amanah & Tijara, dein halal KI-System'
    $lnk.Save()
  }

  Write-Host ''
  Write-Host 'Fertig! A&T ist installiert.' -ForegroundColor Green
  Write-Host 'Du findest A&T jetzt auf dem Desktop und im Startmenue.'
  Write-Host 'Den heruntergeladenen Ordner kannst du loeschen.'
  if ($edge) { Start-Process -FilePath $edge -ArgumentList ('--app="' + $url + '"') } else { Start-Process -FilePath $app }
} catch {
  Write-Host ''
  Write-Host ('Das hat nicht geklappt: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'Du kannst A&T trotzdem nutzen: Doppelklick auf "A-und-T starten.cmd".'
}
