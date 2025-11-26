@echo off
cd /d D:\Code\Other\iKD
REM Important: Push master before running this script

REM Define variables
set DIST_DIR=dist
set BRANCH=gh-pages
for /f "delims=" %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i

REM Clone gh-pages branch if dist\.git does not exist
if not exist "%DIST_DIR%\.git" (
    echo Cloning %BRANCH% branch into %DIST_DIR%...
    rd /s /q "%DIST_DIR%"
    git clone --branch %BRANCH% %REPO_URL% %DIST_DIR%
) else (
    echo Using existing git repo in %DIST_DIR%...
    pushd %DIST_DIR%
    git fetch origin %BRANCH%
    git reset --hard origin/%BRANCH%
    popd
)

git pull origin master --force

REM Switch Node version using nvm
call nvm use 16.20.2

REM Update USD rate and fund NAV to JSON files
echo === Starting updateJsonFile.js ===
call node updateJsonFile.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] updateJsonFile.js failed with code: %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)
echo === updateJsonFile.js completed ===

REM Backup dist data and images
md dist-temp\assets\data 2>nul
md dist-temp\assets\images 2>nul
xcopy /E /Y /I dist\assets\data dist-temp\assets\data
xcopy /E /Y /I dist\assets\images dist-temp\assets\images

REM Build
call npm run build
xcopy /s /e /i /y dist-temp\assets\data dist\assets\data
xcopy /s /e /i /y dist-temp\assets\images dist\assets\images
rmdir /s /q dist-temp

cd dist
git add -A
git commit -m 'deploy'
git push -f origin gh-pages
cd ..
git restore .
