@echo off
setlocal

set ROOT=%~dp0..\..
pushd "%ROOT%\backend"

echo [CES] Backend starting on port 3000...
npm start

popd
endlocal
