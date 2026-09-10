@echo off
title Howe Robinson Bunker Prices Terminal - Local App
cls
echo ================================================================
echo   HOWE ROBINSON BUNKER PRICES TERMINAL (LOCAL DESKTOP APP)
echo ================================================================
echo   Starting local server & desktop window...
echo.
cd /d "%~dp0"
python desktop_app.py
pause
