# P2 接續交接

先讀project.md、tasks.md、docs/design/ADVENTURE_RPG_SPEC.md、concepts/README、progress.md與acceptance.md。

分支 `phase/p2-adventure`，worktree `/home/yyy/workspace/Japanese101-p2`，基準main `99b8805`。PR54／55／56已包含。使用者確認P0／P1通過，來源[evidence/predecessor-approval.json](evidence/predecessor-approval.json)。不可再把歷史NO-GO當成目前前置，也不能把此核准當成P2新教材／實機簽核。

目前25項P2 task，P2-10文件DONE；其餘依tasks逐項推進。P2-01／03開始，後續依賴見tasks。每批更新進度、驗收並commit／push，開draft PR；未授權自動merge main或發布。

```sh
cd /home/yyy/workspace/Japanese101-p2
export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH
git status --short --branch
git log -5 --oneline
npm ci
npm run typecheck
npm run validate:data
npm run validate:blueprint
npm run lint
npm test
npm run build
```

瀏覽器使用獨立context、獨立輸出目錄與未占用port。WebKit在隔離CI驗證，不改交易主機OS。保存commit、版本、步驟、截圖／trace；實際檢視圖；不拿WebKit模擬當實體平板。大trace用CI artifact，精選證據入repo。

## 第一批接續

P2-01／02已DONE；P2-03與15進行中。核心為src/content/contracts.ts、src/learning/rules.ts、src/db/journey.ts、journey-models.ts與db v6，純規則在battle／economy／world。共用UI在components/ui；所有正式進度用IndexedDB。

205單元／22檔、typecheck、lint已通過，evidence/foundation-*。下一批做QuestionPlayer、學習／檢核controller及UI狀態頁，再接小鎮、道館、商店與正式U01草稿。保持未審教材與正式入口分離。imagegen資產正在本session生成，來源在generated_images，不可把概念圖當正式地圖；完成後複製到專案並記來源／hash／容量及實際檢視。
