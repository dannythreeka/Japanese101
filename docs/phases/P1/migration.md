# P1-03 玩家資料遷移與復原

v1～v4 → v5 在單一 IndexedDB 升級交易中執行。先將原 progress、sessions、pets、adventureProgress、profiles 與已知舊設定保存到 migrationBackups/pre-v5，再建立新的玩家資料表。備份寫入失敗會整筆回復，保留原版 schema 與內容；不使用 deleteDatabase 作升級修復。

原 progress、sessions 無可靠玩家歸屬，留在 legacy-shared，不會猜測分配給目前玩家；舊星星／設定／每日任務同樣僅保留備份。已有明確 ID 的 pets／adventureProgress 仍按原 ID 使用。新玩家偏好預設繁中、young、麥克風 off；不繼承全域開麥同意。家長區可匯出舊版共用備份，匯出檔含學習資料，勿放公開 issue／repo。

新資料表：playerProgress [profileId+id]、playerSessions、preferences、wallets、gameCheckpoints、levelSessions、rewardReceipts、dailyClaims。所有 repository 寫入固定提交時 profileId。reset／delete 只刪該玩家新表紀錄，原共享資料及遷移備份保留。活躍玩家是 UI 邊界狀態，不在非同步寫入中重新查詢以改歸屬。

復原：

1. 如顯示儲存失敗，先保留分頁，按重試；未寫成功不推進題目／顯示已保存。不可清瀏覽器資料或重裝 PWA。
2. 內容版本不符，選「保留紀錄並開始新練習」將舊 checkpoint 標 abandoned，保留 attempts，再產生新 session。不能將不明舊題結果當新題作答。
3. 仍無法開啟 IndexedDB，由家長確認儲存權限／空間，再重試。禁止在程式自動清空資料。
4. 如需手動恢復，先從瀏覽器開發工具匯出完整 IndexedDB、migrationBackups 與 app origin／版本。備份是歷史證據；本 Phase 未提供任意 JSON 匯入覆寫工具，避免將無歸屬資料放入錯誤玩家。工程人員應在另一個隔離 origin／瀏覽器 profile 重現，再提出精確復原交易。

自動化：migration.test.ts 涵蓋 v1～v4、空庫、原始壞資料保留、重開、備份寫入失敗整筆回復；reliability.test.ts 覆蓋玩家隔離、reset/delete、未知版本及原共享資料保留。這些測試均使用 fake-indexeddb／隔離資料庫，不觸碰實際孩子資料。
