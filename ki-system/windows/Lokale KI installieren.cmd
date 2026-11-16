@echo off
rem Richtet die lokale KI (Ollama) ein: kostenlos, ohne Limit, ohne Konto.
rem Einmaliger Download von etwa 3 bis 6 GB. Keine Adminrechte noetig.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0app\lokale-ki.ps1"
pause
