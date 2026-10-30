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

U02提交3289f0ae477fb745e62f6b6a4b31b38adcd5439e已push，CI40925952499 Test & Build、Chromium、Firefox、WebKit全部success。這是3289f0的結果，不能替代後續U03工作樹的驗證。

## U03 時間與日常工程驗收（2026-10-30）

基準3289f0＋本次U03變更；執行者Codex，Playwright1.58／Node22.23.2。P3整體IN_PROGRESS，真人日語／音訊／實機／兒童均NOT_RUN。

| 需求 | 實際結果 | 證據 |
|---|---|---|
| U03-M/T/Q1/Q2 | 25新詞5漢字G07～09、10教學、4閱讀6聽力、50practice＋15check候選；跨U01～03去重及14類配比PASS | docs/content/U03/README.md、coverage.json、scripts/author-u03.py |
| U03-A | 16真WAV來源／稿hash／檔hash／PCM PASS；六段聽力實際播放完 | public/assets/audio/u03/manifest.json、e2e/p3-u03.spec.ts |
| U03-V | BLOCKED，135筆真實人審NOT_RUN；檢核題族與語音自然度尚未核准 | docs/content/U03/review-ledger.json |
| U03-I四主線 | 教學真UI、四題測試queue、4真Attempt，重整保留回饋，報告與匯出歸屬U03 PASS | e2e/p3-u03.spec.ts第一項 |
| 肯否混淆 | 把べんきょうしません誤選成します，解說與唯一錯答重整後仍在，敵HP不減、不寫假檢核 PASS | e2e/p3-u03.spec.ts第四項 |
| 離線與新圖 | 下載486素材，關閉測試專屬來源及頁面後冷啟，U03教學、插畫與聽力可用 PASS | 第三項；只停止測試來源，不改主機網路 |
| U02回歸 | 四主線、六音訊、離線冷啟全PASS；共7個Chromium流程PASS，2.5m | test-results/p3-u03、playwright-report/p3-u03 |
| 音訊服務長稿 | 原40s等待在G07超時；保留前12檔，改單一已接受job最長120s後完成剩餘4檔；永久pending確實超時、不中途重送，4測試PASS | src/content/audio-source.test.ts、scripts/audio-source.ts |
| 插畫與畫面 | 四格原稿與320／768截圖實際工程檢視；五寬度320/390/768/1024/1440無橫向溢出，窄版長頁可捲動 | evidence/u03-context-*.png、public/assets/img/u03/daily-routine.webp；非真人／實機PASS |
| 靜態檢查 | typecheck、lint、preview build、unit inventory、journey關聯PASS；7項內容／世界單元測試PASS | 本次命令結果；離線PWA506entries，約22.2MiB |
| 正式release | 預期FAIL（exit1）：U01～03缺人審，U04～24尚缺21單元 | node --import tsx scripts/unit-inventory.ts --release |

U03不改戰鬥／經濟數值，不把新單元或先修檢核當已熟練。共享Playwright教學／播放／queue helpers只作用於新建測試context，不修改真玩家。作者序列化拒絕直接覆蓋已APPROVED教材。上述瀏覽器之後未修改產品內容；最終單元回歸結果另記下方。

最終全量單元回歸：243 tests／29 files全部PASS（21.36s），涵蓋新增長稿等待／永久pending終止測試。與七項Chromium使用相同產品內容，後續僅追加交接與驗證紀錄。

U03提交3982b5cc42e00a933c80da7e8e3a4cf3dadc17bc的CI40930288466：Test & Build、Chromium、Firefox、WebKit全部success；不是下方U04尚未提交工作樹的CI。

## U04／首四單元工程驗收（2026-10-30）

基準3982b5c＋本批U04與fixture。工程執行者Codex，Playwright1.58／Chromium145.0.7632.6／Node22.23.2。非原作者日語、實體平板、真人可玩性與兒童試用仍NOT_RUN，P3整體IN_PROGRESS。

| Task／條件 | 實際狀態 | 證據 |
|---|---|---|
| U04-M/T/Q1/Q2 | 25新詞5漢字G10～12，10教學卡4閱讀6聽力50practice＋15check候選；原創稿與逐項引用、配比PASS | docs/content/U04/README.md、coverage.json、scripts/author-u04.py |
| U04-A | 16真WAV來源／腳本hash／PCM PASS；六聽力實際Chromium播放完 | public/assets/audio/u04/manifest.json、e2e/p3-u04.spec.ts |
| U04-V | BLOCKED；135筆人審NOT_RUN | docs/content/U04/review-ledger.json |
| P3-02內容量 | 真實U01～04合計100唯一詞、20漢字、12文法、16閱讀、24聽力、200練習，達工程配額；review依賴仍未通過 | src/content/inventory.test.ts、validate:units |
| 素材完整關聯 | 六個實際pack含兩套假名；17插畫、62課程音訊＋4世界音訊hash／路徑PASS，另有假名專用inventory | scripts/validate-journey.ts、src/content/packs/media.ts |
| 四課切換 | 真UI完成每課教學與一個正確Attempt，各自保存feedback／HP／題目，逐課返回重整仍正確，四Attempt無複製 | e2e/p3-curriculum.spec.ts，16.7s |
| 整合回歸 | 246單元／30檔、lint／typecheck／build PASS；39 Chromium P2＋P3 PASS，8.0m，包含存檔故障、雙分頁、版本恢復、四播放器、音訊、離線、玩家隔離及五寬度 | test-results/p3-four-unit、playwright-report/p3-four-unit |
| 視覺 | 原創位置圖與320／768畫面實際工程檢視；五寬度無橫向溢出。長頁需垂直捲動，可收合對戰場景 | evidence/u04-context-*.png、art-prompt.md；不等於真人／實機驗收 |
| P3-03 fixture | prepare／storageState還原／40初始補助購物／拒覆寫兩項PASS；零假作答／教學／獎勵。初次CLI實際輸出0600檔，匿名B-1對應gradeBand2 | scripts/usability-fixture.mjs、e2e/p3-fixture.spec.ts、usability/README.md |
| release gate | 預期exit1：缺U01～04真人核准與U05～24內容 | validate:units:release；不是把未做內容視為PASS |

已處理的驗證失敗：media測試最初未考慮U01教學重用同audioSrc的listening稿，改為解析實際已存在來源並仍要求稿完全相符；新增fixture mjs供TS測試使用時缺型別，新增明確.d.mts介面，未關閉strict檢查。

39項整合後有一項教材修改：U04練習提示從時間／動作用語改為位置／存在用語，不改正解、音訊或戰鬥規則；另將fixture代碼與年級組對齊既有匿名空表，新增基準工作樹與預覽hash記錄。受影響的10個內容／素材單元檢查已PASS；新位置圖＋提示、U04既有流程、四課切換與fixture共7項須以後續重建結果為準，不以39項替代。Headful操作、實體平板fixture交付、九人招募／同意／試用沒有發生。

最終重建與受影響驗證：10個內容／media／world單元檢查PASS，lint／型別／build PASS；U04四項＋四課切換＋fixture兩項共7 Chromium全部PASS（2.0m），結果test-results/p3-u04-final、playwright-report/p3-u04-final。已實際檢視evidence/u04-position-hint-768.png：單格貓在桌下裁切正確、音訊按鈕與中文位置提示可讀、選項換行保留內容；這不是真人核准。

fixture最終代碼C2正規化C-2且gradeBand3有實測；已有教學紀錄拒覆寫且原計畫保留。CLI首次借用測試埠時遇測試完成自動關閉服務而connection refused，改用自己專用4250服務，未改產品或放寬測試。

最終fixture CLI於專用4250成功；evidence/fixture-cli.json保存基準3982b5c、workingTreeDirty=true、預覽入口hash、Chromium版本、匿名B-1／gradeBand2、0600檔權限及零battle／Attempt／check／ledger計數。完整瀏覽器state只留本機/tmp，未提交。最終測試後僅更新文件／證據，無產品修改。
