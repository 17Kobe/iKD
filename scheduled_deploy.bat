@echo off
cd /d "%~dp0"
git pull origin master --force
node updateJsonFile.js
call npm run build
curl --proxy http://10.160.3.88:8080 -o ./dist/assets/data/my_localstorage.json https://17kobe.github.io/iKD/assets/data/my_localstorage.json
cd /d "D:\Code\iKD\dist\"
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/17kobe/iKD.git master:gh-pages
cd ..
git restore .