# P1 驗收

狀態：IN_PROGRESS（工程回歸中，非 COMPLETE）。基準：PR #53 合併 `bc2116ad789d247e3be44d2eba5b5a0e790b73ea`。P0人工審核並行是使用者2026-10-15明確授權的執行例外，未把P0 gate補填PASS。

工程執行／自動化初審：本session Codex。真人日語內容、UX／產品與實機 reviewer 尚未指定／簽核，不能用本表替代。

## 已有的工程證據

| Task | 預期與實際 | 狀態／證據 |
|---|---|---|
| P1-01 | 五題首次3對、2錯後重試：60%／100%；提示、跳過、未答及十次提交有測試。七遊戲共用attempt與結算；詞卡／書寫／發聲標參與 | Unit PASS；Chromium 10題6首次對、十次連點／兩分頁PASS；完整suite見下方 |
| P1-02 | 詞組ねこ/ねっこ、おばさん/おばあさん與同組選項；空／缺ID回復；不支援mode不啟動 | Unit／data validator PASS；L7/L8實際UI納入主線回歸 |
| P1-03 | v1～v4、空庫、原始壞資料、重開及備份失敗rollback；原共用不分配；家長可匯出 | migration.test.ts與reliability.test.ts PASS；Chromium／Firefox匯出PASS；migration.md |
| P1-04 | 固定profileId，延後A不能寫B；設定／錢包／任務／SRS／session隔離；reset/delete保留B和legacy | Unit PASS；Chromium存檔失敗→重試→B新玩家→切A續學PASS |
| P1-05 | 缺結果／直連complete／鎖關零獎勵；game和level交易、單收據、重玩衰減；部分寫入失敗整筆回復 | reliability.test.ts PASS；Chromium十次點選／兩分頁結算PASS |
| P1-06 | 每題保存，refresh續題；存檔錯誤保留待提交、可重試；版本／壞checkpoint保留原紀錄安全恢復 | Unit PASS；Chromium PASS，Firefox壞checkpoint恢復PASS；免費抓抓樂退出／換模式另補回歸 |
| P1-07 | 預設off；offline不建SR；enhanced每次由家長明確同意；拒絕／撤銷／不支援回復並停止tracks | API spy unit PASS；Chromium／Firefox新同意／取消／拒絕UI PASS；實機 NOT_RUN |
| P1-08 | 所有發聲非主線必做，發聲量只標參與 | L0～L10 mic off、模擬拒絕、無裝置全UI回歸中；API mock不能稱為實體拒絕權限 |
| P1-09 | 單一語音，離頁取消回調；完整409資源驗證才標離線，404／quota／hash錯誤可重試 | 音訊／教材包unit PASS；Chromium離線關頁重開、逐資源fetch及真WAV播放曾PASS，最新suite重跑中；實機 NOT_RUN |
| P1-10 | 空／壞設定／IndexedDB錯誤可回復；20次進出無RAF、timer、mic殘留 | Chromium 20次同document測試PASS；Chromium／Firefox受阻IndexedDB、壞checkpoint恢復PASS |
| P1-11 | schema＋unit/item/skill/scene/asset/level關聯＋實際生成選項檢查；11類壞fixture必失敗 | validate:data、contentValidation.test.ts PASS；39缺圖引用修正，人工素材審核 NOT_RUN |
| P1-13 | Node22標準npmci；lint0/0；audit原18逐項分類／相容修補後0，不停規則、不改OS | PASS；dependencies.md與evidence/audit-*.json |
| P1-12 | project §3.2十情境全部證據及指定實機／人工review齊全才放行 | IN_PROGRESS／NO-GO；工程回歸與外部補驗未完成前不可標COMPLETE |

## 目前命令基準

Node22.23.2：181 tests／18 files PASS；typecheck、validate:data、validate:blueprint、lint0/0、build PASS；npmci與audit0 PASS。此為工程結果，未代替人工／實機驗收。最終執行log、commit、環境、三引擎CI與截圖在工程回歸完成後補於本表。

## 已知外部依賴

- P0既有的內容／UX／owner與preview驗證仍待實際承接／簽核；使用者授權P1工程並行，不代表審核完成。
- P1指定實機麥克風權限、音訊、自動播放、Safari／PWA離線、觸控操作，以及37張新增SVG的真人審核尚未執行。逐項腳本見device-checklist.md。
- WebKit本機缺系統庫，依P0診斷在隔離GitHub runner執行；不為測試修改交易主機apt／核心／Wi-Fi。

工程agent已開啟檢查320px配對／濁點、200% CSS縮放及110詞素材contact sheet：未見文字截斷／壞圖，新增簡筆圖可顯示。這是工程初審，`w_rusu`等抽象概念辨識度仍需真人內容審查。P2原定完整UI token／對比／screenreader設計未在本Phase冒稱完成。
