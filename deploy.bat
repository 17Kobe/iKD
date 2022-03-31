@echo off
cd D:\Code\iKD\
node updateJsonFile.js
npm run build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/17kobe/iKD.git master:gh-pages
cd -
pause>nul