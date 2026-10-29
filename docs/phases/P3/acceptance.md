# P3 驗收

整體 IN_PROGRESS；P3-01、P3-02均未DONE，其餘P3 task未完成。

| 檢查 | 實際 | 證據 |
|---|---|---|
| 同玩家兩單元的戰鬥／check／恢復隔離 | PASS，含同version／question ID的混淆案例 | src/db/journey.test.ts，225項完整單元回歸 |
| U01回歸 | PASS，40269c2，24項Chromium | test-results/multi-unit、playwright-report/multi-unit |
| 92字形／音訊／script skill隔離 | PASS，2項單元測試 | src/content/packs/kana.test.ts |
| 假名教學保存、重整、真WAV後作答、切文字系統、切回續戰 | PASS | e2e/p3-kana.spec.ts |
| 未知unit顯示恢復入口 | PASS | e2e/p3-kana.spec.ts |
| 跳級／獨立檢核與人工內容審核 | NOT_RUN／未完成 | 不把practice複製成check |
| 兒童／實體平板 | NOT_RUN | 不以工程模擬替代 |

初次kana單元測試抓出音訊路徑缺前導斜線、跨partition複製題族與同item版本；路徑已依契約修正，重複檢核移除而未放寬驗證器。首次typecheck發現測試檔node:fs型別缺失，加入測試檔專用node reference，未變更全域TS設定。之後typecheck／lint／build及2項Chromium通過。

最終本批單元回歸227項／25檔案PASS，typecheck與lint PASS。下拉選字修正後2項Chromium再次PASS（9.2s），並涵蓋320／768／1024寬度；已檢視320截圖，教學不再被46按鈕推到長頁下方。此輪截圖後僅加手帳due篩選目前單元skill；該行已通過最後型別／lint／單元，瀏覽器回歸需由新PR CI再確認。證據為本資料夾evidence/kana-teaching-*.png，trace位於test-results/p3-kana-final。
