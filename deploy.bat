@echo off
cd /d "%~dp0"
node updateJsonFile.js
git pull https://github.com/17kobe/iKD.git master
call npm run build
cd /d "D:\Code\iKD\dist\"
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/17kobe/iKD.git master:gh-pages