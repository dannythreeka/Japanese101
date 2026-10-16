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

第三批工程驗證：215 tests／24 files、typecheck、lint、validate:data、blueprint（11項含假核准壞夾具）、validate:journey及審閱build PASS。U01升u01-2-draft／item v2，前版原始內容存docs/content/U01/archive；14圖、14音及65題關聯／hash／題型分配檢查通過。release檢查仍須拒絕未審內容。新稿新增四格T13圖、完整日文題目／解說／提示、教學ruby與difficulty；R02擴為六輪跨角色對話。

Chromium與Firefox各15項新suite首次14 PASS／1 FAIL；FAIL為名字selector同時找到header與hidden dialog，已限定header並保持原隔離斷言，待重跑。兩引擎實際六聽力播放、音訊失敗不記錯、storage故障保留答案、版本備份、四播放器、完整金幣購物、五寬、200%文字及真斷站冷啟冒險已PASS（程式隨後加強同版本壞資料／錢包保全並升內容版本，需重跑受影響suite）。新資料損壞不默認清空或重設餘額，PIN後可匯出原始紀錄。

商品版本跨新舊分頁的canonical價格檢查仍需補強，尚不標P2-15 DONE；其他工程task持續待完整三引擎CI與證據。真人review ledger在docs/content/U01/review-ledger.json，全部NOT_RUN。

第四批：v8 catalogVersions保存單調遞增商品revision，舊分頁不能用舊價格購買或覆蓋新版；同物競購回傳already-owned不再假報儲存失敗，餘額競爭刷新實際狀態。題目／美術改版不重置舊practice首勝鍵。新增overflow與非法purchase identity邊界。217單元、typecheck、lint PASS。

前一工程提交dcab575的Test&Build及三引擎全PASS，evidence/ci-dcab575.json；該結果不冒充尚未提交的v8／美術v2。v8局部版Chromium／Firefox各16項全過，包含真斷站冷啟與六WAV；新增長閱讀／防重播／雙分頁同物／審閱console與20次資源檢查待最新suite。Chromium20次世界移動、進出音訊後RAF／interval／45s播放timeout／active audio歸零已PASS，後續完整CI再驗。

P2-03／04／05／12工程驗收DONE（Codex工程reviewer）；P2-11、U01-M已交可審閱結果，IN_REVIEW但真人尚NOT_RUN。其餘task依賴保持真實。U01-T／Q1／Q2／A／V／I正式依賴未滿，草稿可看不等於DONE。真人集中步驟見human-review.md。

新審閱頁 /#/__review/content 可看全部65題與正解、14教材＋4居民WAV、四方向及三戰鬥姿態裝備；完全不寫Attempt／wallet或簽核。居民朗讀已改四段本地WAV，以免依賴平板是否有系統日語聲線；生成時遇429，保留已完成兩檔並經工作間隔有限續作，四檔均已完成DRAFT。美術v2背面視角修正、manifest frameWindows與三場景新截圖保存evidence/gear-visual；Codex已實際看圖，真人核准仍NOT_RUN。

第四批提交前檢查：218 tests／24 files、typecheck、lint、validate:data、blueprint與validate:journey全PASS，審閱build PASS（444離線素材）。新P2 suite共20項，含兩頁同物競購、長閱讀五寬、平板768×1024／1024×768、200%文字、審閱頁無寫入及20次資源檢查；最新全suite待本批提交後重跑。詞／漢字／文法均有明確teaching refs，duplicate item revision壞fixture會失敗。

最新核心：SRS learning-v1.1-spaced只在到期日獨立答對前進；未到期不延後due，舊derived review會backup/replay真實Attempts。Journey export含profile-filtered backups，完整全庫匯入仍是P5。reward綁定最後有效當回合題目／版本，普通saveWorld必須先驗證原checkpoint完整；未知／壞原資料只能走先備份recover。未領獎勝利在手帳／道館優先續接，不能自動發或重播。21項P2新瀏覽器情境（含時鐘推一天）需用最新commit跑。
