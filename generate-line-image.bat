@echo off
setlocal
cd /d "%~dp0"

echo Launching Puppeteer...
set "nodeCmd=node screenshot.js > temp.txt"
%nodeCmd%

for /f "usebackq delims=" %%i in (`type temp.txt`) do set "lastLine=%%i"

echo Last line of screenshot.js output: %lastLine%

del temp.txt

echo Screenshot saved to D:\Code\ikd\dist\assets\images\

cd dist
git add -A
git commit -m 'images'
git push -f origin gh-pages
cd ..

IF NOT "%lastLine%"=="" (
    node image-to-line.js "%lastLine%"
)