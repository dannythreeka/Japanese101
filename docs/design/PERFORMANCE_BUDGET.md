# P4-04 載入與容量工程預算

2026-10-30。工程owner Codex，效能／實機reviewer待指派；本文件不是P4-04 gate完成證明。量測及引用來源見P4 acceptance。

1. 每個實際minified JavaScript chunk不超過500,000 bytes。`scripts/check-build-budget.mjs`檢查dist/assets真檔，超標使postbuild失敗，並產生dist/build-budget.json；沿用既有500k警告的規模，沒有提高Vite警告門檻。
2. 單課道館首次開啟，在乾淨Chromium context、service worker blocked、未進家長／審閱區時，實際載入JS decoded body合計不超過900,000 bytes；同時只可請求該課的uXX內容chunk。`e2e/p4-pack-loading.spec.ts`記錄每個resource並驗證。這是JS載入／解析範圍預算，不能冒稱PWA總下載量、延遲或實體平板FPS。
3. 選單只用實際可玩教材的id／title／version。`catalog.json`由真registry產生、CI與單元檢查一致性；不能把未製作單元加入菜單。各課內容以固定白名單動態import，核對id／version／title；缺課不退回U01。
4. 進家長報告時才載入報告所需全課資料；備份匯出只讀catalog的版本與本機DB。審閱頁只載入目前課的題庫。舊遊戲、家長與玩家畫面按路由載入。
5. 失敗或切換：舊課請求晚到不得顯示或保存到新課。瀏覽器可能快取失敗的ES module；載入錯誤提供使用者明確重新載入，恢復連線後可重試，沒有自動強制重載或清DB。生效前不建立該課StudyPlan或Attempt。
6. 完整離線仍包含所有已製作教材、模組與素材；拆JS不會把離線測試範圍縮小。543個素材＋597個PWA precache entries為本批六課實測，全部24課仍待製作與重新量測。沒有把目前容量外推成已驗證的完整包。

本批前：主index約620k、同步registry約634k；拆分後index439123 bytes、單課約100～110k，無超過500k的chunk。U06道館實際14個JS資源722211 bytes，未載入U01～05題庫；原始量測evidence/u06-runtime-script-budget.json。

新增課程時：先完成真內容與素材、登記registry和loader的固定import，再執行`node --import tsx scripts/pack-catalog.ts --write`、`npm run validate:packs`，更新人審／coverage；執行build預算、跨課切換與離線冷啟驗證。內容簽核、實機與全部24課gate不由效能通過取代。
