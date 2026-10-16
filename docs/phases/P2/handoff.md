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

## 第二批恢復入口

新增 `src/features/journey` 完整隔離預覽；`npm run dev -- --host 127.0.0.1 --port 4202 --strictPort` → `/#/preview/adventure`。正式build開預覽須 `VITE_P2_REVIEW_PREVIEW=1 npm run build`。CI已以同旗標建置，無正式發布。`P0_E2E_PORT=4213 npm run test:e2e -- e2e/p2-adventure.spec.ts --project=chromium`。

U01為DRAFT，pack與review在src/content/packs及docs/content/U01。13圖全部已保存於public/assets/img/journey，source hashes與prompts已存，不重生已可用資產。10音已保存，4音缺件因tts.quest逾時／429；script可保留已完成檔案續作，勿同條件無限重試。真人內容／語音／視覺／平板全部NOT_RUN。

DB v7新增獨立檢核；不可回頭改已交付v6 stores。完整check與戰鬥分開，check不顯示即時對錯、不發獎。useJourney綁定玩家；root進出音訊清理，parent report僅PIN通過後掛載。世界／內容／戰鬥版本變更除world外的安全恢復仍待完成；report統計、i18n／ruby、T13圖、雙分頁故障／offline／三引擎待驗。

本批209單元已過；E2E首次跑中，下一次先看progress與最新測試結果，不能把初步入口smoke算完整循環。P1詞卡長選單、書寫64px、結算讀取錯誤文案亦已修正，要回歸。

第二批保存更新：語音429經工作間隔後恢復，14檔已完整生成，仍全為DRAFT。Chromium初次7項有6 PASS，完整循環因雙分頁focus hydration使領獎按鈕更新而timeout；已改以兩頁既有按鈕同時dispatch測競態，重跑待完成。版本恢復與移動dirty checkpoint保全亦已補，後續需驗證。工程摘要evidence/integration-batch.json。
