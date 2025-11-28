@echo off
setlocal enabledelayedexpansion
cd /d D:\Code\Other\iKD
REM Important: Push master before running this script

REM Prevent window from closing on error
if "%1"=="" (
    cmd /k "%~f0" run
    exit /b
)

REM Set PATH for nvm and node (required for Windows Task Scheduler)
set NVM_HOME=C:\Users\user\AppData\Local\nvm
set NVM_SYMLINK=C:\nvm4w\nodejs
set PATH=%NVM_HOME%;%NVM_SYMLINK%;%PATH%

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
C:\Users\user\AppData\Local\nvm\nvm.exe use 16.20.2

REM Update USD rate and fund NAV to JSON files
echo === Starting updateJsonFile.js ===
echo Current directory: %CD%
echo Node path:
where node
echo.
C:\nvm4w\nodejs\node.exe -v
C:\nvm4w\nodejs\node.exe updateJsonFile.js
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
echo === Starting npm build ===
call C:\nvm4w\nodejs\npm.cmd run build
set BUILD_ERROR=%ERRORLEVEL%
echo Build exit code: %BUILD_ERROR%
if %BUILD_ERROR% neq 0 (
    echo [ERROR] npm build failed with code: %BUILD_ERROR%
    pause
    exit /b %BUILD_ERROR%
)
echo === npm build completed ===

echo === Restoring data and images ===
xcopy /E /Y /I dist-temp\assets\data dist\assets\data
xcopy /E /Y /I dist-temp\assets\images dist\assets\images
rmdir /s /q dist-temp

echo === Pushing to gh-pages ===
cd dist
git add -A
git commit -m "deploy"
echo Commit exit code: %ERRORLEVEL%
git push -f origin gh-pages
echo Push exit code: %ERRORLEVEL%
if %ERRORLEVEL% neq 0 (
    echo [ERROR] git push failed with code: %ERRORLEVEL%
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..
git restore .

echo.
echo ========================================
echo   Deploy completed successfully!
echo ========================================
echo.
pause
exit /b 0
