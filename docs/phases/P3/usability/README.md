# P3 九人可用性測試材料

狀態：材料草案；實際招募、家長同意、兒童操作均 NOT_RUN。P3-03尚未DONE，P3-04尚未開始。未將工程或成人試玩算成兒童結果。產品／UX主持人：待指派。教材審核者：待指派。適用基準 project.md §3.4、tasks.md P3-03～06。

使用前由實際主持人填寫：測試commit、預覽URL、裝置型號／系統／瀏覽器、內容核准版本、日期、同意紀錄保存位置、可聯絡的研究負責人與資料刪除期限。這些未知欄位不得由agent補值。

開始條件：P2-09及試用題真人審核通過；四單元P3-02完成並可用。尚缺條件時可由成人做工程演練，不能邀兒童以未核准教材充作正式驗收。不要在repo存兒童姓名、聯絡資料、簽名、照片、聲音或帶個資畫面。

材料：session-script.md（固定說明與六步流程）、consent-template.md（交由家長確認）、participants.csv（九個匿名名額，非已招募清單）、observations.csv（每人逐步結果）、issues.csv（問題與重測追蹤）。實際同意文件需由主持人另行保管；repo只記匿名代碼與是否已確認。

成功定義不變：同一位兒童在一次操作說明後，自行開始、找到道館、完成五個有效作答小節、看結果、購買並穿戴可負擔裝備、找到下一目的地，六步全通過才算整套成功。至少8/9，且每個年級組至少2/3。一次戰鬥提早結束不等於五題小節；可以再進戰鬥累積。不得提示答案或代點來湊成功率。

分母包含所有開始參與者，退出或中斷另記原因，不能悄悄刪掉。招募未滿九人時報「未完成」，不外推8/9。安全／資料遺失／無法退出／主線卡死獨立列出，不能用平均率抵銷。重測保留原紀錄，另加attempt欄位；不覆寫最初失敗。

## 隔離工程演練 fixture（尚非正式九人試用）

工具：`scripts/usability-fixture.mjs`。每次prepare建立全新Playwright context及獨立/tmp目錄，不讀取或清空既有瀏覽器玩家。只接受本機專用預覽origin與A-1～C-3匿名代碼（也接受A1寫法並正規化為A-1），A/B/C分別預設年級組1/2/3。配置初始40金幣（旅行帽價格40）、零持有裝備、零作答、零教學、零檢核；金幣明確標為SYNTHETIC_FIXTURE_OPENING_BALANCE_NOT_EARNED，不捏造勝利／獎勵receipt／能力。這是研究者指定起始條件，不能計入學習效果或真實賺取金幣。

```bash
# 先在專用埠啟動已建置的預覽；不要停止共用服務。
npm run preview -- --host 127.0.0.1 --port 4250 --strictPort
# 另一終端，Node22、repo根目錄：
node scripts/usability-fixture.mjs prepare http://127.0.0.1:4250 A1
# 使用上一命令實際輸出的目錄；需要可用圖形桌面。
node scripts/usability-fixture.mjs open /tmp/japanese101-p3-fixture-實際目錄
```

prepare輸出fixture.json（基準commit／workingTreeDirty／預覽宣告commit與入口hash／browser／viewport／匿名代碼／初始配置）與storage.json（含IndexedDB），檔案模式0600，目錄各自獨立。open從快照建立另一個新context；關閉該頁後另存演練結果，不覆蓋原快照。初始與結果始終標ENGINEERING_REHEARSAL、humanTrial NOT_RUN，不能拿工程演練冒稱真人試用。不要輸入兒童真名或把完整瀏覽器狀態上傳public repo。

自動驗證 `e2e/p3-fixture.spec.ts`：新快照可還原並購買／裝備帽子、扣款一次、保留零Attempt；原context金幣仍40；重複初始化與已有教學紀錄均拒絕且資料保留；拒絕外部origin與非匿名代碼。兩項Chromium PASS（9.2s），證據test-results/p3-fixture與playwright-report/p3-fixture。

此工具目前供本機Chromium成人工程演練。headful人工操作、實體平板／Safari的fixture交付、內容核准、正式九位兒童招募與家長同意仍待實際負責人處理；不能因prepare成功就把P3-03或P3-04標DONE。也不會替使用者招募或發送邀請。

基準commit不代表未提交工作樹的完整內容；workingTreeDirty=true時必須連同預覽入口hash與本次變更記錄解讀，不得稱該commit已獨自包含試用版本。
