@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or newer is required. Install it from https://nodejs.org/ and try again.
  pause
  exit /b 1
)
echo Running VIBA automated tests...
node --test test\healthverse.test.js
pause
