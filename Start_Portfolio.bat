@echo off
echo Starting Full Portfolio Environment...

:: 1. Open the project folder in VS Code
echo Opening VS Code...
start code .

:: 2. Start the Equence Server in a new window
echo Starting Equence Server...
start cmd /k "cd /d "%~dp0projects\equence" && npm run dev"

:: 3. Open the main index.html in your default browser
echo Opening Portfolio in Browser...
start "" "%~dp0index.html"

echo.
echo Everything is started! You can close this small window now.
timeout /t 5 >nul
exit
