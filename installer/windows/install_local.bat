@echo off
setlocal

powershell -ExecutionPolicy Bypass -File "%~dp0install_local.ps1"
if errorlevel 1 (
  echo [CES] install failed.
  exit /b 1
)

echo [CES] install completed.
endlocal
