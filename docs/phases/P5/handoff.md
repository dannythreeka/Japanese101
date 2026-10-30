# P5 恢復

先讀../full-experience.md、project.md、tasks.md及MOCK_EXAM_SPEC.md。本Phase工程可跨phase草稿推進，人審gate原狀。工作樹Japanese101-p2，phase/full-experience，draft PR58。

src/mock：blueprint／contracts／validation、session固定時鐘、report raw與B/C首次指標。src/db/mock.ts負責profile、revision、命令receipt與交易；db/index.ts版本9新增兩表及明確reset清理。所有合成題只放src/mock/__tests__/fixture.ts供測試，沒有加入可玩registry，也不能算MA/B/C完成。

下一步：實際卷A/B/C80題各自原創與真人審核、音訊；模擬UI與真實播放→repository接線、完整錯誤／中斷／offline瀏覽器驗證。接UI前把mock表納入完整家長備份（P5-04）。現有daily只U01～05，驗證器會拒絕沒有實際teachings的mock先修，必須先補U06～24而非編造先修ID。P4共通15skill延後check仍待補。

Node22；npx vitest run src/mock src/db/mock.test.ts；npm run typecheck/lint/test，VITE_P2_REVIEW_PREVIEW=1 npm run build。最終測試與commit/push以acceptance及git log為準；不得宣稱純函式已完成產品體驗。


2026-10-30 完整備份接續：P5-04 IN_PROGRESS，src/backup schema/service與家長PIN後FullBackup UI已實作；29表包括mock與原始legacy，全域ID／profile／引用檢查、預覽後變動拒絕、明確同ID取代、原子歸檔與回滾。7核心及Chromium四項操作通過，五寬度／200%／鍵盤截圖已檢視，最終Firefox與單元結果見P5 acceptance。上一批已push f9dcc50，CI40943000160建置／Chromium／Firefox成功、WebKit最後查仍進行中。

下一步仍須安全SW更新：現有vite.config.ts registerType autoUpdate可能打斷未提交作答，需改成延後啟用且驗證多分頁、下載失敗、斷網及舊cache保存；不能清DB或自動強制重載。接著回到U06～24真實內容、15共通skill延後check、三份真mock與UI。不要停在工程函式，goal仍ACTIVE。PR58保持draft。Node22；npx vitest run src/backup、npm test/typecheck/lint；VITE_P2_REVIEW_PREVIEW=1 npm run build；Playwright e2e/p5-backup.spec.ts。測試用隔離context，不操作真實孩子資料。提交SHA以git log為準。

進行中的SW批次（尚未提交／驗收）：main.tsx以src/lib/appUpdates.ts原生註冊，vite.config改prompt、injectRegister:false、skipWaiting:false、clientsClaim:true；沒有skipWaiting訊息或強制reload。AppUpdate家長區提示關閉所有分頁再開。e2e/p5-update.spec.ts用同源實際Workbox核心＋測試安裝失敗門檻，驗證保留未提交選項、多分頁waiting與自然啟用後保留Attempt。下一步完成build後跑該Chromium測試及p5-backup回歸，實際錯誤須修；沒有把待驗證實作標PASS。上一批備份已push a0073aa0d1c1921360a5bb1b8bebfbe605245395，291單元／型別lint、Chromium4與Firefox5通過。

SW後續結果：Chromium生命週期PASS18s、U05停止origin冷啟PASS25.3s，備份四項PASS；最終型別lint看acceptance與git log。目前還沒有真MA/B/C與mock UI，下一步回到U06與共通skill內容。實機與跨真實部署仍NOT_RUN，不標P5完成。
