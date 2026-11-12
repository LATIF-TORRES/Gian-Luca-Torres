# A und T installieren: App nach %LOCALAPPDATA%\A-und-T kopieren,
# Verknuepfungen auf dem Desktop und im Startmenue anlegen, dann starten.
# Die Verknuepfung startet ueber starten.ps1: so aktualisiert sich A und T kuenftig selbst.
$ErrorActionPreference = 'Stop'
try {
  $quelle = Split-Path -Parent $MyInvocation.MyCommand.Path
  $ziel = Join-Path $env:LOCALAPPDATA 'A-und-T\app'
  New-Item -ItemType Directory -Force -Path $ziel | Out-Null
  & robocopy.exe $quelle $ziel /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw ('Kopieren fehlgeschlagen, robocopy ' + $LASTEXITCODE) }

  $symbol = Join-Path $ziel 'a-und-t.ico'
  $starter = Join-Path $ziel 'starten.ps1'
  $ps = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'

  $shell = New-Object -ComObject WScript.Shell
  $orte = @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))
  foreach ($ort in $orte) {
    $lnk = $shell.CreateShortcut((Join-Path $ort 'A&T - Amanah & Tijara.lnk'))
    $lnk.TargetPath = $ps
    $lnk.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $starter + '"'
    $lnk.IconLocation = $symbol
    $lnk.WorkingDirectory = $ziel
    $lnk.WindowStyle = 7
    $lnk.Description = 'A&T - Amanah & Tijara, dein halal KI-System'
    $lnk.Save()
  }
  # Im Startmenue auch die lokale KI (falls der heruntergeladene Ordner geloescht wird).
  $lnk = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Programs')) 'A&T - Lokale KI einrichten.lnk'))
  $lnk.TargetPath = $ps
  $lnk.Arguments = '-NoProfile -ExecutionPolicy Bypass -NoExit -File "' + (Join-Path $ziel 'lokale-ki.ps1') + '"'
  $lnk.IconLocation = $symbol
  $lnk.WorkingDirectory = $ziel
  $lnk.Description = 'Lokale KI ohne Limit fuer A&T einrichten'
  $lnk.Save()

  Write-Host ''
  Write-Host 'Fertig! A&T ist installiert.' -ForegroundColor Green
  Write-Host 'Du findest A&T jetzt auf dem Desktop und im Startmenue.'
  Write-Host 'A&T aktualisiert sich ab jetzt beim Start selbst.'
  Write-Host 'Den heruntergeladenen Ordner kannst du loeschen.'
  Start-Process -FilePath $ps -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $starter + '"') -WindowStyle Hidden
} catch {
  Write-Host ''
  Write-Host ('Das hat nicht geklappt: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'Du kannst A&T trotzdem nutzen: Doppelklick auf "A-und-T starten.cmd".'
}
