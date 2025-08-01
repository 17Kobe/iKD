@echo off
REM 重要：在執行此腳本前，要先 push master

REM 定義變數
set DIST_DIR=dist
set BRANCH=gh-pages
for /f "delims=" %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i

REM 如果 dist\.git 不存在，就 clone gh-pages 分支
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

REM 更新美金匯率及基金每日淨值至JSON檔案內
node updateJsonFile.js

REM 備份 dist data/my_localstorage.json及images目錄
md dist-temp\assets\data 2>nul
md dist-temp\assets\images 2>nul
xcopy /E /Y /I dist\assets\data dist-temp\assets\data
xcopy /E /Y /I dist\assets\images dist-temp\assets\images

REM 打包
call npm run build
:: 同 mv dist-temp/images dist-temp/data dist/assets/ && rm -rf dist-temp
:: Move-Item -Path dist-temp/images, dist-temp/data -Destination dist/assets/
:: Remove-Item -Path dist-temp -Recurse
xcopy /s /e /i /y dist-temp\assets\data dist\assets\data
xcopy /s /e /i /y dist-temp\assets\images dist\assets\images
rmdir /s /q dist-temp
:: curl --proxy http://10.160.3.88:8080 -o ./dist/assets/data/my_localstorage.json https://17kobe.github.io/iKD/assets/data/my_localstorage.json
cd dist
git add -A
git commit -m 'deploy'
git push -f origin gh-pages
cd ..
git restore .