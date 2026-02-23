@echo off
setlocal

set ROOT=%~dp0..\..

echo [CES] Starting backend and frontend in separate windows...
start "CES Backend" cmd /k "%~dp0start_backend.bat"
start "CES Frontend" cmd /k "%~dp0start_frontend.bat"

echo [CES] Done.
echo Backend  : http://localhost:3000/api/health
echo Frontend : http://localhost:3001

endlocal
