# P5 工程進度

2026-10-30，IN_PROGRESS。工程owner Codex；非原作者教材／音訊reviewer待指派。基準U05提交4d928ccf68cbbd921ae0ac617fd76f16db184967，已push draft PR58；依project.md跨phase授權，P4-05正式依賴沒有假設通過。

P5-01：重新查官方科目／題型／計分分組，新增docs/design/MOCK_EXAM_SPEC.md；自訂每卷80題25／30／25、20／40／30分鐘；跨日常與A/B/C題族、完全重複、閱讀材料與音訊來源檢查器。只有測試fixture，沒有實際MA／MB／MC題庫或素材，不算內容交付。

P5-02：固定時鐘純狀態機；時限包含背景／refresh／離線，逾時未答保留；暫停／揭露／重播永久轉practice；播放中失敗或clock倒退標中斷。DB v9只新增mockSessions與mockCommandReceipts，保留舊庫；profile隔離、revision衝突、重複命令、交卷receipt、失敗原子回滾。尚無使用者操作頁／真實音訊橋接，只有工程函式與repository。

P5-03：只算raw55／25／80；未完成或版本不符拒絕報告。各玩家B/C第一次開始的session才可能達標，未開始ready不算接觸；先練習再考仍屬重做。門檻64/80、39/55、18/25與開始間隔7×24h，不換算官方分數／通過率。UI與實際三卷未做。

正式教材APPROVED與真人逐項ledger、實機、18人14天試用仍NOT_RUN。P5-04完整備份／還原尚未實作；現有journey匯出不包含新增mock表，尚無UI可建立真實mock作答，接UI前必須處理匯出格式。

初輪35項相關測試PASS，型別檢查發現constructor參數屬性不符erasableSyntaxOnly；已改明確欄位宣告，不關閉TS規則。最終驗證見acceptance。

最終284單元PASS，型別／lint／build通過；後補計分邊界12相關測試PASS。Chromium／Firefox真實v8升v9及領獎導覽四測試PASS。狀態仍IN_PROGRESS；下一步P5-04備份／還原後，回到實際內容製作與mock UI。
