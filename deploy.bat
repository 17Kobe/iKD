@echo off
cd /d "%~dp0"
git pull origin master --force
node updateJsonFile.js
call npm run build
cd /d "D:\Code\iKD\dist\"
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/17kobe/iKD.git master:gh-pages
git restore .