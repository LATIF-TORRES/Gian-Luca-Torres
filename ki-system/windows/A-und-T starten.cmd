@echo off
rem Startet A und T in einem eigenen Fenster (Microsoft Edge im App-Modus).
rem Gibt es Edge nicht, oeffnet sich A und T im normalen Browser.
setlocal
set "APP=%~dp0app\index.html"
if exist "%LOCALAPPDATA%\A-und-T\app\index.html" set "APP=%LOCALAPPDATA%\A-und-T\app\index.html"
set "URL=file:///%APP:\=/%"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --app="%URL%"
) else (
  start "" "%APP%"
)
