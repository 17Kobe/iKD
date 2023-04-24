@echo off
setlocal
cd /d "%~dp0"

echo Launching Puppeteer...
node screenshot.js

echo Screenshot saved to D:\Code\ikd\dist\assets\images\

cd dist
git add -A
git commit -m 'deploy images'
git push -f origin gh-pages
cd ..