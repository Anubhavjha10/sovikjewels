@echo off
cd /d "%~dp0.."
node scripts/firestore-rules-emulator-test.mjs
exit /b %ERRORLEVEL%