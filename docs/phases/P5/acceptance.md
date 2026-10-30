# P5 驗收紀錄

Phase IN_PROGRESS，人工gate未通過。基準4d928cc＋本批工程；執行者Codex，reviewer待指派。

| 項目 | 工程現況 | 剩餘 |
|---|---|---|
| P5-01 | 官方時間／14類查核與自訂配額、題族／資料來源隔離檢查 | 實際三份卷、真人語意獨立審核 |
| P5-02 | 純狀態機、截止處理、v9保存與命令冪等 | UI、真音訊橋接、三科瀏覽器完整操作 |
| P5-03 | raw計分、首次B/C與7日門檻 | 真卷／審核／報告UI |
| P5-04 | 完整備份與交易還原、PIN後UI及衝突預覽 | 安全SW更新、正式P4-05依賴與人工／實機 |
| P5-05～07 | NOT_RUN | 實機、18人14天試用與發布判定 |

測試fixture只是TEST ONLY結構，不登記為可玩內容，不建立真人審核證據。hasApprovedMockMetadata僅查狀態／reviewer／日期／全部題目音訊核准欄位，真實來源hash、身份與內容審核仍須release audit。

已覆蓋：20/40/30精確時間、截止前1ms／截止點、未答固定分母；背景／睡眠／refresh／斷網不補時間；clock倒退、內容變版；暫停降級、答案揭露、音訊未完成不能答、錯誤提早宣告完成被拒絕、重聽降級；重複交卷結果不變；raw分母與B/C第一次接觸、不同玩家隔離；雙分頁一成功一revision衝突；十個同命令只一receipt；receipt存失敗整筆回滾；v8→v9保留人物、金幣與歷史記錄；reset只清明確指定玩家。

初輪35項／6檔PASS（4.80s），後續typecheck失敗原因為TS1294（constructor參數屬性）；修正後重新執行完整測試／型別／lint／build，結果待追加。這批尚無模擬頁面，沒有宣稱完成視覺或實機驗收。

最終：284單元／37檔PASS（26.72s），typecheck／lint／Preview build PASS；後補報告拒絕缺時間／重複題指派及39/55邊界，受影響12測試／2檔PASS（2.09s），typecheck／lint再驗。未改DB schema或UI。

真實瀏覽器v8→v9：Chromium145.0.7632.6／Firefox146.0.1，各以原生IndexedDB建立凍結v8 schema、隔離玩家、47金幣、legacy-shared原始列，再載入本次應用；新mock兩表存在且空，人物／金幣／舊資料逐字保留，U05教學與refresh可用。再跑領獎導覽競態，每引擎兩項、總四項PASS（27.6s）。來源e2e/p5-migration.spec.ts與p4-navigation.spec.ts，trace/report在test-results/p5-storage、playwright-report/p5-storage。沒有真實模擬頁可做視覺驗收，沒有稱其已可玩。

此瀏覽器build version.json宣告4d928cc＋本批未提交工程，dist/index.html SHA256 `4a4a0ab430402b64cd384bdaae832112944b301cf0c5d2a9d708ddf33c4b5ca1`，localhost:4248。後補report純函式未被runtime引用，不影響已測升級畫面；不能把合成fixture當原創卷或真人審核。


## P5-04 完整備份批次

基準f9dcc5038e27f202d41044592ff6ea9e9480b060＋本批；工程執行／畫面檢視Codex，人工reviewer待指派。src/backup保存29張白名單表，含兩玩家、未結束戰鬥、金幣ledger、購物裝備、mock session／receipt及legacy-shared。SHA-256僅完整性檢查，不作來源認證。預覽顯示備份名與本機名，同ID須逐項確認；其他玩家保留。預覽後本機或檔案改動拒絕；跨玩家全域ID衝突拒絕；原資料歸檔與替換同交易，失敗整筆回滾。

- 核心7項測試PASS。首輪回滾測試fault未命中Dexie動態table實例；改攔截原生IDBObjectStore.put，實際中途throw驗證歸檔／刪除／寫入全部回滾。
- Chromium四項PASS（24.0s）：真實教學四題獲60金幣、購帽扣40並裝備、開始第二場、加入隔離第二玩家，匯出到乾淨context後逐表比對；重新開啟需PIN，恢復20金幣與未完成戰鬥。另測跨分頁變動、無效檔案、取消不寫入、還原中途Quota失敗及重試。
- 首輪UI發現320px grid被原生file input撐到534px；已以明確minmax(0,1fr)、min-width:0及input寬度修正；家長報告教材選單也限制容器寬。未隱藏水平溢出。
- 320／390／768／1024／1440無頁面水平溢出，按鈕至少64px；200%文字、Space勾選、Tab到確認／取消及Enter取消通過。evidence/backup-preview-*.png，實際檢視320、768與200%截圖，文字／狀態／確認項目可閱讀，長檔名可換行。瀏覽器原生檔案按鈕語言依測試環境。
- 還原續戰測試起初直接期待dojo自動進battle，但產品須點「繼續挑戰」；已依真實路徑點擊，再確認普通攻擊與保存的戰鬥。首次故障注入選到空preferences表未觸發；改確有寫入的adventureProgress後，驗證實際錯誤與重試，未放寬斷言。

證據：e2e/p5-backup.spec.ts、src/backup/service.test.ts；trace/report在test-results/p5-backup、playwright-report/p5-backup；Firefox最終重驗及單元／型別lint結果待下段追加。Preview build通過，version.json為f9dcc50＋未提交修改。一般sandbox postbuild曾因spawnSync git EPERM失敗；範圍核准後原命令成功，未修改主機設定。

人工視覺、實體裝置與SW更新：NOT_RUN；本批不宣稱P5-04 DONE。

最終重驗：291單元／38檔PASS（40.77s），typecheck／lint PASS。Firefox146.0.1備份四項＋導航回歸五項PASS（1.2m），trace/report：test-results/p5-backup-final、playwright-report/p5-backup-final。Chromium145.0.7632.6四項見上。dist/index.html SHA256 `1f97629277ec6ca69029906b20cb29a2fdf9f26fa3200efb9876e79480b9dbba`。驗證後僅更新紀錄，未改產品程式；人工／實機不計為PASS。


## P5-04 延後版本啟用工程

基準a0073aa＋本批。移除自動更新重載；以原生register保留worker waiting，不傳SKIP_WAITING、不重載其他分頁。新安裝可claim離線控制；更新等待所有舊client關閉後自然啟用，家長區可檢查與讀取等待／失敗訊息。沒有清理DB、沒有把倒退程式版本當資料回復；格式舊版應使用經驗證的備份與相容版本，不能直接降schema。

Chromium真實Workbox核心生命週期測試PASS（18.0s）：同源舊版、未提交選項、第二分頁；新worker install gate回503時失敗、舊worker與選項保留；修復安裝後waiting，關閉家長分頁仍不啟用；孩子提交一次保存Attempt，最後舊client關閉才啟用，重開保留完全相同Attempt。測試wrapper僅加入版本標記與失敗門檻，不是產品release版本，也不代表教材內容變版完整驗收。首輪測試誤選已redundant的舊worker，改依測試版本標記選新worker後通過，未放寬生命週期斷言。來源e2e/p5-update.spec.ts；trace/report：test-results/p5-update-final、playwright-report/p5-update-final。

本次build後備份Chromium四項重驗PASS。新家長更新區與實際部署版本升級、Firefox/WebKit、實體裝置仍待完整驗證；不能以此標P5-04 DONE。全內容效能警告仍存在，未提高警告門檻。

另驗U05下載完成後停止origin冷啟、插畫與真音訊PASS（25.3s），證據test-results/p5-update-offline、playwright-report/p5-update-offline。測試worker的self.registration型別原被DOM推斷為Window，改成明確worker probe型別，未改runtime。

最終typecheck／lint PASS；最後修改只為測試型別與紀錄，產品build與已通過操作不變。
