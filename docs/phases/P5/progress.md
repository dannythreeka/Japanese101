# P5 工程進度

2026-10-30，IN_PROGRESS。工程owner Codex；非原作者教材／音訊reviewer待指派。基準U05提交4d928ccf68cbbd921ae0ac617fd76f16db184967，已push draft PR58；依project.md跨phase授權，P4-05正式依賴沒有假設通過。

P5-01：重新查官方科目／題型／計分分組，新增docs/design/MOCK_EXAM_SPEC.md；自訂每卷80題25／30／25、20／40／30分鐘；跨日常與A/B/C題族、完全重複、閱讀材料與音訊來源檢查器。只有測試fixture，沒有實際MA／MB／MC題庫或素材，不算內容交付。

P5-02：固定時鐘純狀態機；時限包含背景／refresh／離線，逾時未答保留；暫停／揭露／重播永久轉practice；播放中失敗或clock倒退標中斷。DB v9只新增mockSessions與mockCommandReceipts，保留舊庫；profile隔離、revision衝突、重複命令、交卷receipt、失敗原子回滾。尚無使用者操作頁／真實音訊橋接，只有工程函式與repository。

P5-03：只算raw55／25／80；未完成或版本不符拒絕報告。各玩家B/C第一次開始的session才可能達標，未開始ready不算接觸；先練習再考仍屬重做。門檻64/80、39/55、18/25與開始間隔7×24h，不換算官方分數／通過率。UI與實際三卷未做。

正式教材APPROVED與真人逐項ledger、實機、18人14天試用仍NOT_RUN。P5-04完整備份／還原尚未實作；現有journey匯出不包含新增mock表，尚無UI可建立真實mock作答，接UI前必須處理匯出格式。

初輪35項相關測試PASS，型別檢查發現constructor參數屬性不符erasableSyntaxOnly；已改明確欄位宣告，不關閉TS規則。最終驗證見acceptance。

最終284單元PASS，型別／lint／build通過；後補計分邊界12相關測試PASS。Chromium／Firefox真實v8升v9及領獎導覽四測試PASS。狀態仍IN_PROGRESS；下一步P5-04備份／還原後，回到實際內容製作與mock UI。


2026-10-30 完整備份接續：P5-04 IN_PROGRESS，src/backup schema/service與家長PIN後FullBackup UI已實作；29表包括mock與原始legacy，全域ID／profile／引用檢查、預覽後變動拒絕、明確同ID取代、原子歸檔與回滾。7核心及Chromium四項操作通過，五寬度／200%／鍵盤截圖已檢視，最終Firefox與單元結果見P5 acceptance。上一批已push f9dcc50，CI40943000160建置／Chromium／Firefox成功、WebKit最後查仍進行中。

下一步仍須安全SW更新：現有vite.config.ts registerType autoUpdate可能打斷未提交作答，需改成延後啟用且驗證多分頁、下載失敗、斷網及舊cache保存；不能清DB或自動強制重載。接著回到U06～24真實內容、15共通skill延後check、三份真mock與UI。不要停在工程函式，goal仍ACTIVE。PR58保持draft。Node22；npx vitest run src/backup、npm test/typecheck/lint；VITE_P2_REVIEW_PREVIEW=1 npm run build；Playwright e2e/p5-backup.spec.ts。測試用隔離context，不操作真實孩子資料。提交SHA以git log為準。

安全SW工程接續：原生註冊、等待全部舊client關閉、無SKIP_WAITING／自動reload；家長區更新訊息。Chromium實際Workbox生命週期18.0s PASS，備份四項回歸PASS，U05下載後停止origin冷啟真音訊25.3s PASS。跨部署內容變版、其他引擎與實機仍待驗，P5-04 IN_PROGRESS。下一步U06～24與共通skill、真MA/B/C及模擬UI；不得把內容／人審欠項算完成。

P5-04-R1新修正：ec8419 CI FF/WK 320px=326px，真證據已讀；Firefox元素探針定位七天圖表日期min-content，16px回歸修前實際382px失敗。已改等寬grid、min-width:0及標籤必要換行，最終重驗看acceptance。U06已commit95def27（292單元、兩引擎各四操作通過）；下一步推送本批，CI重驗後接U07／共通skill與真mock。

下載修正最終：三種匯出共用downloadJSON，anchor掛DOM且blob/link延後一秒清理；延後100ms原生派送的兩引擎四項真下載與JSON讀回PASS，Firefox原U02流程／完整備份等九項PASS。typecheck/lint/build與500k guard通過。session33497、48145皆已成功終止，不重跑；恢復先查git log。本批提交後即可接U07註冊：作者65題、16WAV、426556-byte蘋果圖已實際製作但未進registry／loader／catalog／media；e2e/p4-u07.spec.ts已準備。U08～24與共通skill／真mock／人審仍未做，goal ACTIVE。
