@echo off
echo Starting local server...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
