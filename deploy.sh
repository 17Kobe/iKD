#!/usr/bin/env sh
# 重要：在執行此腳本前，要先 push master

# 當發生錯誤時終止腳本運行
set -e
# 先拉碼，也可以用在店裡
git pull origin master --force
# 更新美金匯率及基金每日淨值至JSON檔案內
node updateJsonFile.js
# 打包
npm run build
# 下載回來 my_localstorage.json 這個檔案，一定要在 npm run build 後面才執行，不然 dist 資料夾會被刪除
curl -o ./dist/assets/my_localstorage.json https://17kobe.github.io/iKD/assets/my_localstorage.json
# 移動至到打包後的dist目錄 
cd dist
# 因為dist資料夾預設是被ignore的，因此在進入dist資料夾後初始化git
git init
# 將所有檔案加到索引
git add -A
# 預計在遠端 ph-pages 分支新增 commit，實際仍是 master 裡面 dist 分支的commit
git commit -m 'deploy'
# 部署到 https://github.com/17kobe/iKD.git 分支為 gh-pages
git push -f https://github.com/17kobe/iKD.git master:gh-pages
# 將dist資料夾中的內容推送至遠端 iKD 的 gh-pages 分支中，並強制無條件將舊有的內容取代成目前的內容（指令 git push -f)
# 分支名稱會叫gh-pages是因為Github在部署時只允許三種來源(master, gh-pages, master/docs)
cd -
# 將匯率那2個檔案還原
git restore .