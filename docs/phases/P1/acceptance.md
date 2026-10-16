# P1 驗收

> 最新狀態：**COMPLETE（專案擁有者gate確認）**。2026-10-16使用者於本對話確認「P0 and P1 驗證過了」，接受既有工程交付並放行P2。核准來源與基準見[前置核准](../P2/evidence/predecessor-approval.json)。下方先前NO-GO／IN_REVIEW／BLOCKED為歷史紀錄，保留原始證據；本次沒有虛構個別裝置、日語審核人名或重新測試結果。P2新教材、視覺與實體平板驗收不在此核准範圍。

狀態：**ENGINEERING_READY**；正式 Phase gate **NO-GO**，不是 COMPLETE。P1-01～11、P1-13工程已交付並驗證，task仍IN_REVIEW；P1-12因P0簽核與指定人工／實機補驗為BLOCKED。

基準：PR #53已依使用者指示合併，merge `bc2116ad789d247e3be44d2eba5b5a0e790b73ea`。使用者2026-10-15允許P0人審與P1工程並行，沒有把P0 gate補填PASS。工程執行／自動化初審：本session Codex；真人日語、UX／產品與實機reviewer待實際指派／簽核。

2026-10-16規格同步：PR55已合併到P1分支，merge `0b1cb5e7194f2b46b944857e5817be8bdc1e65b7`；本機fetch後已包含，PR54仍draft／未合併。設計整合及本次交接維護只改文件／概念圖，不改產品程式、測試或CI；下列回歸沿用其實際測試SHA，未在本次重跑。新版P2設計不取代P0／P1人審、既有37圖語義核對或實體裝置補驗；所有task狀態保持不變。同步／依賴核對見[P2證據](../P2/evidence/spec-sync.json)。

## 最終工程版本與結果

- 最後產品程式commit：`4f2c948d2eba3e5666e99bf5769d9b87227c06d5`。
- 完整回歸head：`036a7806f5c58676edf26393fe79b1f821b9a29b`；其相較產品版本只調整WebKit CI為1worker及紀錄，不改產品／測試斷言／逾時。CI實際checkout合成merge：`a5fb128ba3a5119076478c2f1130205a3a070ccd`，由artifact version.json核對。
- [完整CI](https://github.com/dannythreeka/Japanese101/actions/runs/38743653858)：Test & Build與三引擎job均SUCCESS；Chromium、Firefox、WebKit各18 PASS，合計54 PASS／0 FAIL／0 SKIP，沒有重試。
- Node22.23.2：187單元測試／19檔PASS；標準npm ci、typecheck、validate:data、validate:blueprint、lint 0 errors／0 warnings、build均PASS。npm audit 0，原18項分類見dependencies.md與audit-before/after.json。
- 精確job／artifact連結、head／checkout、測試摘要：`evidence/ci/summary.json`及同目錄txt；三引擎實際版本：`environment-*.json`。完整trace／影片／其餘圖於CI artifact保存14日，選定圖與文字納入git。
- 本驗收文件及索引整理為後續文件提交；不能宣稱CI已執行該文件commit。若後續改產品、測試或CI，需重跑受影響檢查。

## Task驗證

| Task | 預期與實際 | 工程結果／證據 |
|---|---|---|
| P1-01 | 5題首次3對、2錯後重試：60%／100%；提示、跳過、未答分開，十次同提交不重複；七遊戲共同契約 | Unit PASS；三引擎10題6首次對、十次連點／兩分頁PASS；詞卡／書寫／發聲只標參與 |
| P1-02 | ねこ/ねっこ、おばさん/おばあさん同組對比；空／缺ID／未知mode可回復 | Unit／data validator PASS；L7／L8真實UI PASS |
| P1-03 | v1～v4、空庫、壞原始資料、重開、備份失敗rollback；共享不猜分配 | migration.test.ts、reliability.test.ts PASS；三引擎家長匯出PASS；migration.md |
| P1-04 | 每次IO固定profileId，延後A不能寫B；設定／錢包／任務／SRS隔離；reset/delete保留B及legacy | Unit PASS；三引擎保存失敗→重試→B新玩家→切A續學、延後家長授權PASS |
| P1-05 | 缺結果／直連／鎖關零獎勵；交易單收據、重玩衰減；部分寫入失敗回復；已存才完成 | Unit PASS；三引擎防重／兩分頁、receipt故障重試、重玩預覽40–55與實際計算一致PASS |
| P1-06 | 每題保存、refresh續學；保存失敗保留答案；未知版本保留原歷史並安全重開 | Unit、三引擎restore／壞checkpoint／免費抓抓樂退出與換模式PASS |
| P1-07 | off預設；offline不建SR；enhanced每次明確家長同意；拒絕／撤銷／不支援停止資源 | API spy unit、三引擎同意／取消／延後A隔離PASS；實機NOT_RUN |
| P1-08 | 發聲非主線必做，聲量只標參與 | 每引擎L0～L10於off／模擬拒絕／無裝置各全UI完成，合計99關／198必做challenge；主線getUserMedia呼叫0。實體權限非本測試 |
| P1-09 | 單一語音，離頁取消；409資源完整驗證才標離線；404／quota／hash錯誤可重試 | Unit PASS；三引擎停止隔離origin→無SW負控失敗→原頁關閉重開→409素材與真WAV完成PASS；實機NOT_RUN |
| P1-10 | 空／壞設定／IndexedDB錯誤可回復；20次進出無RAF／timer／mic殘留 | Unit、三引擎20次同document進出與故障恢復PASS |
| P1-11 | schema及unit/item/skill/scene/asset/level關聯、正解唯一、題組／mode檢查 | 11類壞fixture、好資料及110詞contact sheet無壞圖PASS；39缺圖引用修正，37原創圖真人語義／適齡審核NOT_RUN |
| P1-13 | 原semver相容修補；保留lint規則，不改主機OS | npm ci、audit0、lint0/0與三引擎回歸PASS；dependencies.md |
| P1-12 | project §3.2十情境、必要review與依賴齊全才放行 | 工程回歸PASS；人工／實機與P0依賴未齊，正式gate BLOCKED／NO-GO |

## project §3.2逐項索引

以下PASS僅指所列工程證據；完整Phase仍受上述人工／實機依賴阻擋。

| 需求 | 預期 | 實際／證據 |
|---|---|---|
| G1-1 | 5題3首次對、重試後全完＝60%／100% | PASS：attempts／engine unit；三引擎UI等比例6/10與100% |
| G1-2 | 同提交十次只一筆／一獎勵 | PASS：交易unit；三引擎連點與兩頁結算 |
| G1-3 | 重開／直連不可憑空XP | PASS：缺結果／鎖關／直連與receipt故障unit及三引擎UI |
| G1-4 | A切B不污染學習／時長／任務 | PASS：明確profileId unit及三引擎切換／延後授權 |
| G1-5 | refresh保留已存答案並續題 | PASS：checkpoint unit、三引擎配對／抓抓樂恢復 |
| G1-6 | mic關閉／拒絕仍走完主線 | PASS：三引擎、三mic配置全11關；拒絕／無裝置是API模擬，實機NOT_RUN |
| G1-7 | offline不啟動SpeechRecognition | PASS：constructor/start spy及UI分支；實機權限／瀏覽器服務行為NOT_RUN |
| G1-8 | 促音／長音詞組題，空池可回復 | PASS：generator unit與L7／L8全UI |
| G1-9 | 完整下載後斷網文字／圖／教學音訊可用 | PASS：409資源及原生WAV三引擎；實機Safari／PWA NOT_RUN |
| G1-10 | 離遊戲停止迴圈／timer／音訊／mic | PASS：unit及每引擎20次同document進出；實機指示器／審聽NOT_RUN |

## 證據界線與視覺審查

工程agent已實際開啟320px配對／濁點／詞卡／書寫、200% CSS layout zoom、60%／100%結果、主線結果、110詞contact sheet、鍵盤焦點與最終WebKit離線／結算錯誤／重玩預覽截圖核對。選定圖在`evidence/screenshots/`與`evidence/ci/`。未見本Phase新增文字截斷或壞圖；這是工程初審，不能代替真人UX／日語簽核。200%是CSS layout zoom，不包裝成實機瀏覽器文字放大驗證。

WebKit setOffline有自身重現的internal error，背景與上游issue見progress.md。自動化改停下test-owned origin，無SW新context必須連線失敗；仍要求離線重開、409素材及原生WAV完成，未skip／expected-fail。Chromium／Firefox另維持setOffline旗標。這不是實機飛航模式。CI的PulseAudio null sink只在隔離runner，是真WAV的輸出端，不是人工審聽；本機WebKit缺庫，不修改交易主機apt。

早期失敗並未被覆蓋：原本完整Chromium12項／雙引擎核心24項、追加邊界／鍵盤／離線／結算等歷史log保留；`ci-4f2c948-webkit-failure.txt`記錄前輪53 PASS／1 FAIL及trace定位，最終結果以本頁完整CI為準。

## 最小外部解阻

1. 完成並記錄P0內容藍圖、UX、實際責任人及可存取preview／SHA的核准；若規格變更，先評估本Phase影響。PR merge不代替P0 gate。
2. 依[device-checklist.md](device-checklist.md)在實體裝置執行mic拒絕／撤銷／晚回應、Safari音訊／PWA離線及觸控／鍵盤，填真實reviewer、日期、裝置、版本與證據。
3. 真人審核[assets.md](assets.md)所列37原創SVG的語義與適齡性，特別是`w_rusu`等抽象詞。工程圖可見不等於教材核准。

P0既有UI限制：詞卡單元列表在320px首屏很長、書寫舊返回／示範控制尺寸及淺色提示對比待P2-03／P2-09；未宣稱十畫面完整a11y／UX gate通過。結算故障頁的重試／返回已驗證，但仍沿用「無法準備題目」泛用文案；P2-03狀態元件需區分準備題目與結算保存失敗，這是已揭露的文字精確度限制，不影響本Phase交易與恢復斷言。Build仍有單bundle >500kB的提示，沒有為消警關閉規則；效能不由build成功推論。後續P2保持TODO，未自行跨Phase或發布。
