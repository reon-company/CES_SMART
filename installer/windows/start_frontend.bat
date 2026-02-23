@echo off
setlocal

set ROOT=%~dp0..\..
pushd "%ROOT%\frontend"

echo [CES] Frontend starting on port 3001...
npm run dev

popd
endlocal
