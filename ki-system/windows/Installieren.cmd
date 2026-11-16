@echo off
rem Kopiert A und T in deinen Benutzerordner und legt Verknuepfungen
rem auf dem Desktop und im Startmenue an. Keine Adminrechte noetig.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0app\installieren.ps1"
pause
