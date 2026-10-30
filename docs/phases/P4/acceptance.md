# P4 工程驗證

Phase IN_PROGRESS，不是正式P4通過。基準93a5dbd＋本批工具，執行者Codex；真人reviewer待指派。

| 條件 | 實際證據 |
|---|---|
| 75能力逐項教學／primary練習／check／五題族 | src/content/coverage.ts，實際12候選完整、63缺口；報告docs/content/curriculum-coverage.json |
| 次要標籤不能冒充主測量 | coverage.test.ts測試G60只有次要標籤，仍缺practice/check |
| 重排／標點微改不能灌family | 對prompt、選項、來源正規化，保留item IDs，重複check不增加eligible families；語意不同仍需真人證明 |
| 練習題洩漏、跨unit family洩漏、衝突正解 | coverage.test.ts明確拒絕，受污染候選不計獨立覆蓋 |
| 逐項審核hash／身份／日期／版本 | review-audit.test.ts；U01 canonical格式實際149筆全部hash吻合、無stale；四課554筆均缺真實核准 |
| draft與release分離 | draft盤點exit0、缺口明列；release預期exit1，逐項列未審項ID與缺skill／unit，不稱草稿已通過正式gate |

人工語意獨立性、內容正確性與真實reviewer身份，不能由上述程式測試代替。此批只改驗證工具／報告，不改播放器或學習數值，UI沿用93a5dbd證據。最終命令結果追加下方。

最終15測試／4檔PASS（2.96s），typecheck／lint PASS。真實draft inventory exit0，75節點12候選完整／63缺口、554簽核0有效，U01原149筆hash全吻合；`--write`不變更任何既有ledger。正式release實際exit1，逐項內容審核、圖片與世界語音核准、缺skill與U05～24均被拒絕；摘要與報告hash在evidence/release-rejection.json。完整輸出留本機/tmp/j101-p4-release-final.json，可由同命令再生。

隔離CLI測試以副本製造矛盾簽核：exit1且ledger逐字保持；過期hash核准重置NOT_RUN／reviewer與日期清空；原工作樹ledger前後一致。機械重複正規化保留小數點等有意義標點，只忽略空白與尾端句號／問號／驚嘆號，避免把1.5誤認成15。未執行新UI測試，因本批不改runtime或畫面；沿用93a5dbd產品證據。

## U05與領獎導覽回歸（2026-10-30）

基準ecb6c257443d2677736d549cce17a33730c36a07＋本批U05與JourneyScreen修正；測試由Codex執行。Preview `http://127.0.0.1:4248`，dist/index.html SHA256 `1172949c14a6b2e605868b2dd3f855277697ba21ec10e469cf9ae8a4f188910f`。瀏覽器Chromium145.0.7632.6、Firefox146.0.1；桌面模擬，不是實體平板。後續同提交只有文件補記／尚未runtime引用的P5工具，U05與導航產品碼保持測試版本。

- 257單元／33檔PASS（24.04s），typecheck、lint、素材驗證、Preview build PASS。7實際pack含2假名＋5課；18圖片、78課程＋4世界音訊。離線清單524項，PWA544entries約29.9MiB；index與registry有>500kB建置提示，P4-04仍需全課效能處理，沒有掩蓋warning。
- U05：25新詞、5漢字、3文法、4閱讀、6聽力、50練習＋15check、16真WAV。五課盤點125詞250練習；75能力15有候選、60缺口；689課程／素材審核0有效。135筆U05人審NOT_RUN。
- Chromium5測試PASS（1.5m），Firefox7測試PASS（2.5m）；後者額外重測U02及U04四類作答／家長報告。步驟：真UI完成10教學，隔離queue各選詞彙／文法／閱讀／聽力一題，實際作答→刷新解說→領獎→PIN→按單元報告／匯出。保留四筆實際Attempt，舊單元不混入。
- 六段聽力逐一真播放，審閱工具不產生學習Attempt；下載離線教材後停止來源伺服器並斷網，關頁再冷啟可讀教學、播放音訊、顯示新插畫。
- 320／390／768／1024／1440無水平溢出；Codex實際檢視320與768題目及768插畫提示（含最終Firefox圖），各格人數明確、提示／選項可操作。檔案evidence/u05-context-*.png與u05-people-count-hint-768.png。人工視覺、兒童、實機仍NOT_RUN。

CI40937397439：Build、Chromium成功；Firefox59/60，U02領獎後進家長區逾時。以保持coinLedger真實交易再釋放，修正前穩定重現：先到#/parent，交易完成又回#/preview/adventure?unit=U02。JourneyScreen以React Router location.key與卸載保護舊go回呼，保存成功不覆蓋新的路由。修正後兩引擎延遲交易測試均PASS，只有一筆reward與四筆Attempt。沒有延長timeout／刪斷言／重試洗掉失敗。第一個注入嘗試包裝IDBDatabase.transaction未觸發（Dexie已快取），已改成實際coinLedger.add注入；記錄保留此失敗。

完整trace/report：test-results/p4-navigation-before（修正前真正重現），test-results/p4-u05-chromium、test-results/p4-u05-firefox；對應playwright-report目錄。以上本機大檔ignored，選定圖片與重現測試已入repo。WebKit由隔離CI執行，本批結果以實際新run為準，不把舊WebKit未完成當PASS。

U06作者稿批次：基準ec8419a＋本批。python3 scripts/author-u06-base.py實際PASS：25詞與5漢字各自唯一，與U01～05無首次引入重複，10教學／4閱讀／6聽力稿及G16～18吻合manifest。僅作者來源，50題與15check、16音檔、插畫、runtime操作全部NOT_RUN／NOT_PRODUCED，不影響既有可玩pack；不宣稱U06-M/T或P4 DONE。證據docs/content/U06及腳本。
