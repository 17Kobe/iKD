@echo off
cd /d "%~dp0"
git pull origin master --force
node updateJsonFile.js
call npm run build
curl -o ./dist/assets/my_localstorage.json https://17kobe.github.io/iKD/assets/my_localstorage.json
cd /d "D:\Code\iKD\dist\"
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/17kobe/iKD.git master:gh-pages
git restore .