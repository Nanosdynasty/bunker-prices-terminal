@echo off
echo Installing PyInstaller...
pip install pyinstaller

echo.
echo Building standalone executable...
pyinstaller --name "BunkerTerminal" --windowed --noconfirm ^
  --add-data "index.html;." ^
  --add-data "bunker-app.js;." ^
  --add-data "bunker-style.css;." ^
  --add-data "logo.png;." ^
  --hidden-import "openpyxl" ^
  --hidden-import "webview" ^
  --hidden-import "flask" ^
  desktop_app.py

echo.
echo Build complete! You can find the executable folder in:
echo %CD%\dist\BunkerTerminal
echo.
echo You can zip the "BunkerTerminal" folder and send it to others.
pause
