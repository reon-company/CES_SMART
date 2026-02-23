@echo off
setlocal

set SCRIPT_DIR=%~dp0
set ISS_FILE=%SCRIPT_DIR%CES_SMART_Setup.iss

set ISCC_EXE=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe
if not exist "%ISCC_EXE%" (
  set ISCC_EXE=%ProgramFiles%\Inno Setup 6\ISCC.exe
)
if not exist "%ISCC_EXE%" (
  set ISCC_EXE=%LOCALAPPDATA%\Programs\Inno Setup 6\ISCC.exe
)

if not exist "%ISCC_EXE%" (
  echo [ERROR] Inno Setup 6 ISCC.exe not found.
  echo Install: https://jrsoftware.org/isdl.php
  exit /b 1
)

echo [INFO] Building installer...
"%ISCC_EXE%" "%ISS_FILE%"
if errorlevel 1 (
  echo [ERROR] Build failed.
  exit /b 1
)

echo [INFO] Build complete.
echo Output: ..\..\dist\CES_SMART_Installer.exe
endlocal
