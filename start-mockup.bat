@echo off
setlocal

set PORT=%PORT%
if "%PORT%"=="" set PORT=3000

cd /d "%~dp0"

echo Starting mockup server at http://localhost:%PORT%
start "" "http://localhost:%PORT%"
node server.js

endlocal
