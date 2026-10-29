# P2 可恢復交接

先讀 project.md、tasks.md、docs/design/ADVENTURE_RPG_SPEC.md、concepts/README、P2 progress／acceptance。歷史在 execution-history.md，不可把過去的 NO-GO 或舊測試數當最新狀態。

## Checkout 與版本

- worktree `/home/yyy/workspace/Japanese101-p2`；branch `phase/p2-adventure`；draft [PR57](https://github.com/dannythreeka/Japanese101/pull/57)。原 `/home/yyy/workspace/Japanese101` 保留，勿 reset 他人工作。
- main 基準 `99b8805`；P0／P1 已由擁有者明確核准，證據 `evidence/predecessor-approval.json`。不用重做前置，也不把它當作新 P2 人審。
- runtime `e6444e541b710aaceaaea4807032d3904650390e`；0fc369d為主功能，後續測試時序與兩處規範字級已包含；後續若只增證據文件，明確列差異，不假稱全套跑在文件 commit。
- 最新完整 CI `38865806957` 已全PASS：222單元、三引擎各42項，總126。工程ENGINEERING_READY；完整Phase仍待真人／實機，見acceptance與evidence/ci-final.json。不使用 dcab575 的舊綠燈。

## 本機恢復命令

```sh
cd /home/yyy/workspace/Japanese101-p2
export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH
git status --short --branch
git log -6 --oneline
npm ci
npm run typecheck
npm run validate:data
npm run validate:blueprint
npm run validate:journey
npm run lint
npm test
VITE_P2_REVIEW_PREVIEW=1 npm run build
P0_E2E_PORT=4214 PLAYWRIGHT_HTML_OUTPUT_DIR=playwright-report/p2-local npm run test:e2e -- e2e/p2-adventure.spec.ts --project=chromium --output=test-results/p2-local
```

Firefox 可同命令換 project 及 port／artifact 目錄。全 P1＋P2 三引擎由 PR CI 跑；WebKit 所需 OS libs 只在隔離 GitHub runner 安裝，**不對這台交易機 apt/update/upgrade/autoremove 或改 kernel/Broadcom/Wi-Fi/Tailscale、服務／重啟**。Playwright 已有可用 Chrome／Firefox，毋須改系統。

開發入口：`npm run dev -- --host 127.0.0.1 --port 4202 --strictPort`。若該 port 已由本 worktree 啟動，使用既有服務或換未用 port，不殺其他程序。`/#/preview/adventure` 為隔離冒險，`/#/__review/content` 是全內容／美術／音訊審閱，`/#/__review/ui` 為共用狀態。正式 production build 不設旗標時不開 preview，Vercel Preview 會開啟；舊正式首頁保留到依賴放行。

Vercel 預覽 deployment success 不等於 agent 已驗對 SHA。無登入讀 /version.json 目前回登入 HTML，不能當 JSON 核對成功；請擁有者登入預覽後核對版本，再填真人紀錄。不要為此移除保護或貼帳密。預覽與核對結果見 evidence/preview-access.json。

## 主要程式與資料

- `src/content/contracts.ts`／`packs/u01.json`：runtime 契約與 `u01-2-draft`。前版封存 docs/content/U01/archive；item version 2，歷史 Attempt 不改。
- `src/learning/rules.ts`：首次／提示／跳過獨立計算、5 family／2 日／48h／4/5、到期才前進 SRS。不要因同日重玩延後既定 due。
- `src/db/journey.ts`：profile 綁定、原子回合／購買、防重 reward、單調 catalog、版本備份／恢復／匯出；v6／v7／v8 已交付，不回頭改 stores。unknown／壞資料保留並走 explicit recover。
- `src/world`／`battle`／`economy` 分責；參數以設計附錄為唯一來源，維持原型版本與原因。開戰保存 loadoutSnapshot，戰鬥中不能換裝；HP／金幣不寫 learning。
- `src/features/journey`：四 renderer、世界／對話／道館／battle／shop／bag／journal、skippable welcome、PIN 後 report。`answerCommit.ts` 區分答案提交失敗與提交後 refresh 失敗，後者只讀，不重新寫 Attempt。
- `public/assets/img/journey/manifest.json`：14 圖、source/hash、明確 frameWindows。不要再用等高猜角色列；帽／背包 v2 已修背面。`docs/design/JOURNEY_ART.md` 有定位與 prompt。
- `public/assets/audio/{u01,world}/manifest.json`：14＋4 WAV，都是 DRAFT，真人審聽未完成。既有音檔保留；gen:voice:u01／world 可有限補作，遇429不無限重試，不換假WAV。
- `scripts/validate-journey.ts`：world→encounter→skill/question→asset 與全配額；`npm run validate:journey:release` **目前必須 FAIL**，原因為人工未核准。
- journey 匯出格式含 owned 原始資料與 owned recovery backups；不能把全庫 legacy snapshot 指派給某孩子。完整全庫還原屬 P5。

## 還沒完成的工作

1. 工程15項與CI證據／tasks已同步；不要重做已驗收工程。最後證據提交僅docs及獨立驗證腳本，runtime仍e6444e5；完整126綠燈對應該產品head。接續先確認真人ledger與依賴，不把缺人審的task改DONE。
2. 非原作者日語負責人依 `human-review.md` 與 `docs/content/U01/review-ledger.json` 審核凍結 M→T／Q1／Q2／A→V；每筆都需可追溯的實際reviewer／日期／版本／結果，不能一筆泛稱 PASS。
3. 真人 UX／產品看 14 素材與跨場景換裝、走完整冒險並記迷路／誤觸／策略／數值問題；至少一台實體平板測觸控、橫直向、音訊與離線冷啟。瀏覽器模擬不能當實機，成人／AI 喜好不能當兒童試用。
4. 有缺陷由 agent 修正並升實際變動版本／重驗／重審；依賴齊後才 U01-I、P2-08、P2-09。完整 25 task／15 gate 都過才 COMPLETE。

已授權本分支 commit／push／draft PR，未授權 merge main 或正式發布。P3 兒童招募／家長同意、後續量產、付費、抽獎或多人交易不在本 Phase。

## 完整200%文字鍵盤循環重跑

先啟動本worktree的本機review server，再執行：

```sh
P2_REVIEW_URL=http://127.0.0.1:4202 node scripts/verify-p2-keyboard.mjs
```

腳本每個viewport建立全新context，不寫真實玩家；需原生Tab巡訪才能找到每個控制，Enter／方向鍵操作，逐畫面重新套用200% computed font／line-height。320／768直向／1024橫向各54次操作全過。證據keyboard-200.json，trace在test-results/p2-keyboard-200；精選畫面final-visual/keyboard-shop-text200-*。這是桌面模擬，不能代替真人平板文字設定。


## 2026-10-30 接續：預覽入口與合併授權

使用者回報從分支預覽首頁只能看到舊版。本次 P2-09-R1 在首頁加入明確的新小鎮連結，沿用既有 DEV／VITE_P2_REVIEW_PREVIEW 旗標；正式 build 的入口條件不變。原有 25 項 task／15 gate 與人工紀錄不因此通過。驗證結果見 evidence/preview-entry-20261030.json。

GitHub 查核 PR #57 為 open、非 draft，先前本文 draft 記錄屬歷史狀態。使用者本次明確授權「都 merge」，範圍為 Japanese101；待本次變更驗證及 CI 後合併。此授權不等於日語、真人視覺或實體平板簽核；Phase 保持 ENGINEERING_READY，P2-09 保持 BLOCKED。實際合併 SHA 以 PR 記錄為準。

本次局部驗證 PASS：typecheck、lint、Preview build（postbuild 的 git 子程序先遇 sandbox EPERM，獲准後完成）、正式 build；Chromium 145.0.7632.6 在320／768／1024寬度無橫向溢出、入口高度64px、中日文切換、原生Tab／Enter抵達新小鎮。正式 build 不顯示預覽入口。已實際檢視320寬截圖，沒有裁切／遮擋。證據 preview-entry-20261030.json、production-entry-20261030.json 與 preview-entry-*.png；記錄基準commit及變更檔hash，CI結果以PR最新head為準。
