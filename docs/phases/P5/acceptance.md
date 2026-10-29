# P5 驗收紀錄

Phase IN_PROGRESS，人工gate未通過。基準4d928cc＋本批工程；執行者Codex，reviewer待指派。

| 項目 | 工程現況 | 剩餘 |
|---|---|---|
| P5-01 | 官方時間／14類查核與自訂配額、題族／資料來源隔離檢查 | 實際三份卷、真人語意獨立審核 |
| P5-02 | 純狀態機、截止處理、v9保存與命令冪等 | UI、真音訊橋接、三科瀏覽器完整操作 |
| P5-03 | raw計分、首次B/C與7日門檻 | 真卷／審核／報告UI |
| P5-04 | 尚未開始完整備份還原 | 新mock資料納入家長匯出／匯入 |
| P5-05～07 | NOT_RUN | 實機、18人14天試用與發布判定 |

測試fixture只是TEST ONLY結構，不登記為可玩內容，不建立真人審核證據。hasApprovedMockMetadata僅查狀態／reviewer／日期／全部題目音訊核准欄位，真實來源hash、身份與內容審核仍須release audit。

已覆蓋：20/40/30精確時間、截止前1ms／截止點、未答固定分母；背景／睡眠／refresh／斷網不補時間；clock倒退、內容變版；暫停降級、答案揭露、音訊未完成不能答、錯誤提早宣告完成被拒絕、重聽降級；重複交卷結果不變；raw分母與B/C第一次接觸、不同玩家隔離；雙分頁一成功一revision衝突；十個同命令只一receipt；receipt存失敗整筆回滾；v8→v9保留人物、金幣與歷史記錄；reset只清明確指定玩家。

初輪35項／6檔PASS（4.80s），後續typecheck失敗原因為TS1294（constructor參數屬性）；修正後重新執行完整測試／型別／lint／build，結果待追加。這批尚無模擬頁面，沒有宣稱完成視覺或實機驗收。

最終：284單元／37檔PASS（26.72s），typecheck／lint／Preview build PASS；後補報告拒絕缺時間／重複題指派及39/55邊界，受影響12測試／2檔PASS（2.09s），typecheck／lint再驗。未改DB schema或UI。

真實瀏覽器v8→v9：Chromium145.0.7632.6／Firefox146.0.1，各以原生IndexedDB建立凍結v8 schema、隔離玩家、47金幣、legacy-shared原始列，再載入本次應用；新mock兩表存在且空，人物／金幣／舊資料逐字保留，U05教學與refresh可用。再跑領獎導覽競態，每引擎兩項、總四項PASS（27.6s）。來源e2e/p5-migration.spec.ts與p4-navigation.spec.ts，trace/report在test-results/p5-storage、playwright-report/p5-storage。沒有真實模擬頁可做視覺驗收，沒有稱其已可玩。

此瀏覽器build version.json宣告4d928cc＋本批未提交工程，dist/index.html SHA256 `4a4a0ab430402b64cd384bdaae832112944b301cf0c5d2a9d708ddf33c4b5ca1`，localhost:4248。後補report純函式未被runtime引用，不影響已測升級畫面；不能把合成fixture當原創卷或真人審核。
