@echo off
rem Laedt das freie KI-Modell Hermes 3 (Nous Research) als lokale KI fuer A und T.
rem Kostenlos, ohne Limit, ohne Konto. Einmaliger Download von etwa 2 bis 5 GB.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0app\lokale-ki.ps1" -Art hermes
pause
