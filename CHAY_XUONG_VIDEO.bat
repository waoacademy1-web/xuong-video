@echo off
chcp 65001 >nul
title Xuong video animation
cd /d "%~dp0"
echo Dang mo Xuong video animation...
echo Giu cua so nay mo trong luc lam video. Lam xong thi dong cua so.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0may_chu.ps1"
if %errorlevel% neq 0 (
  echo Thu cach khac bang Python...
  start "" "http://localhost:8777/index.html"
  py -m http.server 8777 --bind 127.0.0.1 || python -m http.server 8777 --bind 127.0.0.1
)
pause
