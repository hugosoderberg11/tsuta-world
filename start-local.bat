@echo off
cd /d "%~dp0"
echo.
echo TSUTA-WORLD local preview
echo Open: http://localhost:5500/
echo Stop: Ctrl+C
echo.
start http://localhost:5500/
py -m http.server 5500
