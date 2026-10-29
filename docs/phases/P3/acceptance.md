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

## 獨立先修檢核最新驗證（覆蓋上方「未完成」工程項）

| 檢查 | 實際 | 證據 |
|---|---|---|
| 未教先檢核、最多5題／組、重整／暫停續做 | PASS | e2e/p3-kana.spec.ts，test-results/p3-placement-final |
| 完整組／合法Attempt才給credit、玩家／文字系統隔離 | PASS | src/db/kana-placement.test.ts，含缺答案／截短題組／錯選項／存檔失敗／重送 |
| 不捏造教學、不降低長期掌握、一般檢核先修不變 | PASS | 同上，taughtCards空、taughtAt空、未stable |
| 全92檢核真音訊連結、同詞共用family | PASS | src/content/packs/kana.test.ts、scripts/kana-inventory.ts |
| reviewer切script、92題選擇、正解稿、不寫Attempt | PASS | e2e/p3-kana.spec.ts |
| 整體單元／lint／型別／build | PASS | 231 tests／26 files，Node22.23.2，4 Chromium21.1s |
| 無人審release封鎖 | PASS（預期exit1） | node --import tsx scripts/kana-inventory.ts --release，human review missing or stale |
| 工程截圖檢視 | PASS（不等於人審） | evidence/kana-placement-result.png，1280px；既有教學320/768/1024 |
| 359項教材音訊人審、實機、兒童 | NOT_RUN | docs/content/kana/review-ledger.json |

上述檢查對應本次P3-01提交的產品內容。提交前後只追加驗證紀錄、CI的validate:kana步驟與tasks狀態敘述，沒有在瀏覽器驗證後修改產品。三引擎新CI待push後確認。

## U02與多單元整合驗收（2026-10-30）

工程owner／執行者：本session Codex；非原作者日語、實體裝置與兒童reviewer待指派。內容135筆NOT_RUN，P3整體IN_PROGRESS，不是完整Phase通過。

| Task／需求 | 預期與實際 | 證據 |
|---|---|---|
| U02-M/T/Q1/Q2 | 實際25詞5漢字3文法4閱讀6聽力50練習＋15獨立check候選；manifest配比／去重／先修／引用PASS，真人待審 | docs/content/U02/README.md、coverage.json、src/content/packs/u02.json |
| U02-A | 16真WAV（6聽力＋10教學）、來源hash與PCM PASS；6段聽力實際Chromium播完，真人審聽NOT_RUN | public/assets/audio/u02/manifest.json、e2e/p3-u02.spec.ts |
| U02-V | BLOCKED，沒有實際審核者與135筆簽核 | docs/content/U02/review-ledger.json |
| U02-I隔離預覽 | 真UI教學後四主線各一題、4個正確Attempt、重整續戰、報告按unit隔離PASS | e2e/p3-u02.spec.ts第一項；為可重現測試設定四題queue，非真實孩子資料 |
| P3-02家長匯出 | 所有unit戰鬥／檢核都保存，不再漏U02，另一玩家不混入PASS | src/db/journey.test.ts新增跨單元export；實際瀏覽器下載JSON含U02 battle及4 Attempts |
| P3-02報告 | G04採U02真教學時間，依教材篩選樣本，練習連結保留unit PASS | src/learning/report.test.ts、e2e/p3-u02.spec.ts |
| P2-18多單元關聯 | 四個真實pack皆有可達dojo、教學／practice／check完整引用，未知unit或漏encounter會FAIL | src/world/validation.test.ts、npm run validate:journey |
| 新素材離線 | 下載467素材；關閉測試專屬origin再關頁冷啟，U02教學／真音訊／新插畫仍可用PASS | e2e/p3-u02.spec.ts第三項；沒有停止共用preview或真主機網路 |
| 視覺 | 320／390／768／1024／1440無橫向溢出；已實際檢視320與768截圖，插畫裁格正確、作答按鈕可見於頁面且可捲動 | evidence/u02-context-*.png；工程檢視，不代替真人核對 |
| 整合回歸 | 240單元／29檔、lint／typecheck／build PASS；P2＋假名＋U02共31 Chromium PASS（5.0m） | test-results/p3-integration、playwright-report/p3-integration；Playwright1.58，Node22.23.2 |
| 正式release gate | 預期FAIL、exit1：缺人審及U03～U24，不把草稿當完整課程 | npm run validate:units:release |
| P3-03人測材料 | 材料已寫，實際九人招募／同意／試用NOT_RUN；fixture待補 | usability/README.md、session-script.md與CSV空表 |

31項回歸的產品版本為4f02a5c基準上的本批工作樹。最後另有U02原稿文字修正：学校促音說明及避免未教否定變化（不改音訊、不改正解ID、也不改P2／假名程式）；受影響內容／世界測試與U02三流程會另重跑，結果追加下方。不要把舊31項綠燈描述為這些文字修訂後已全量重跑。

CI40920767848三引擎各45/46通過；唯一失敗為P2審閱新增教材選單後未命名combobox歧義。測試已明確指定「選擇題目」，31項本機回歸已通過；新提交三引擎CI尚待確認。

最後U02文字修訂後：6項內容／世界關聯測試PASS，型別與preview build PASS；U02三項Chromium再次全部PASS（1.2m），含全部六段音訊與真正來源停機的離線冷啟。證據test-results/p3-u02-text-final、playwright-report/p3-u02-text-final。最後測試後只新增本段證據文字，產品未再修改。
