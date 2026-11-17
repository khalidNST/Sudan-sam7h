@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Sudan Challenge
set PORT=8765

set PY=
where py >nul 2>nul && set PY=py
if not defined PY python --version >nul 2>nul && set PY=python
if not defined PY goto nopython

start "" cmd /c "timeout /t 2 >nul & start "" http://localhost:%PORT%"

echo.
echo  ===============================================
echo    Sudan Challenge:  http://localhost:%PORT%
echo    اللعبة شغالة. لا تقفل هذي النافذة وانت تلعب
echo    To stop the game, close this window.
echo  ===============================================
echo.
%PY% -m http.server %PORT% --bind 127.0.0.1
pause
exit /b

:nopython
echo.
echo  Python is not installed: https://www.python.org/downloads/
echo  بايثون مو مثبت. ثبته من الرابط ثم شغل الملف مرة ثانية
echo.
pause
