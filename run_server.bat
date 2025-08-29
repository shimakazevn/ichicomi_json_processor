@echo off
setlocal EnableDelayedExpansion

:: Change working directory to the script's location
cd /d "%~dp0"

:: Config (you can change these)
set PORT=8000
set PAGE=ichicomi_json_processor.html

:: Allow overriding port via first argument
if not "%~1"=="" set PORT=%~1

:: Detect Python launcher/command
set PY=
where py >nul 2>nul && set PY=py
if "%PY%"=="" (
  where python >nul 2>nul && set PY=python
)
if "%PY%"=="" (
  where python3 >nul 2>nul && set PY=python3
)

if "%PY%"=="" (
  echo [ERROR] Python is not found in PATH. Please install Python and check "Add Python to PATH" during installation.
  pause
  exit /b 1
)

:: Start the Flask app in a new window
start "Flask Server" %PY% app.py

:: Small delay to let the server start
timeout /t 2 /nobreak >nul

:: Open the target page in the default browser
if exist "%PAGE%" (
  start "" http://127.0.0.1:%PORT%/%PAGE%
) else (
  echo [WARN] %PAGE% not found in this folder. Opening server root.
  start "" http://127.0.0.1:%PORT%/
)

endlocal
exit /b 0