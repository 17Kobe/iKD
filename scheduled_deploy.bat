@echo off
cd /d "%~dp0"
:: 先將 遠端部份檔案備份回來
cd /d "D:\Code\iKD\dist\"
:: 因為dist資料夾預設是被ignore的，因此在進入dist資料夾後初始化git
git init
git pull https://github.com/17kobe/iKD.git gh-pages --force
cd ..
git pull origin master --force
node updateJsonFile.js
:: 同 mkdir dist-temp && cp -r dist/assets/images dist/assets/data dist-temp/
New-Item -ItemType Directory -Force -Path ".\dist-temp" ; Copy-Item -Path ".\dist\assets\images" ," .\dist\assets\data" -Destination ".\dist-temp\" -Recurse
call npm run build
:: 同 mv dist-temp/images dist-temp/data dist/assets/ && rm -rf dist-temp
Move-Item -Path dist-temp/images, dist-temp/data -Destination dist/assets/
Remove-Item -Path dist-temp -Recurse
:: curl --proxy http://10.160.3.88:8080 -o ./dist/assets/data/my_localstorage.json https://17kobe.github.io/iKD/assets/data/my_localstorage.json
cd /d "D:\Code\iKD\dist\"
git add -A
git commit -m 'deploy'
git push -f https://github.com/17kobe/iKD.git master:gh-pages
cd ..
git restore .