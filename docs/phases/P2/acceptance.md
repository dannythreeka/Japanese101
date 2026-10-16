# P2 驗收紀錄

2026-10-16（Asia/Taipei）｜Phase **IN_PROGRESS：工程執行中**｜正式gate **NO-GO**

基準 `fd4ccd4a168c57c47cbe25ac7ee9408e37c01658`；本文件所屬commit交付文件及概念圖，產品程式沒有變更。P1的187單元／54瀏覽器測試是P1證據，不能當本次新冒險測試結果。此次不宣稱P2 ENGINEERING_READY。

2026-10-16同步基準：PR55已合併為 `0b1cb5e7194f2b46b944857e5817be8bdc1e65b7`，已fetch並包含於本機P1工作分支。PR54仍draft／未合併。以下設計驗收沿用原證據；同步維護不重新完成P2-10，不改P1-12或任何人工／實機狀態。

## 最新前置與執行狀態

使用者已確認P0／P1通過，來源[evidence/predecessor-approval.json](evidence/predecessor-approval.json)。前面關於P1-12未過的段落是本次啟動前歷史；已依真實使用者核准放行P2，沒有產生新的P2人工內容或實機證據。以下原設計證據保留，G2尚未測試者維持NOT_RUN。

## 本次文件驗收

| Task／需求 | 預期 | 實際／證據 | Reviewer |
|---|---|---|---|
| P2-10／RPG-DESIGN | 已確認方向與原型假設分開，規格可執行，引用及依賴一致 | PASS；[設計契約](../../design/ADVENTURE_RPG_SPEC.md)、[圖稿](../../design/concepts/README.md)、[一致性檢查](evidence/design-review.json) | Codex文件工程審查；專案擁有者確認方向，未逐項確認原型數值 |
| 規格同步／依賴核對 | 工作分支包含PR55，P2數量與gate完整，未放行的前置保留 | PASS（文件核對）；[同步證據](evidence/spec-sync.json)，25項／15 gate、未完成task可啟動數0；正式gate仍NO-GO | Codex文件工程審查，無新增人工簽核 |
| 圖稿來源 | 四檔原圖可重取、複製後hash一致，不進runtime包 | PASS；[manifest](../../design/concepts/manifest.json)及檢查報告 | Codex |
| 色碼基礎 | 主／輔文字與預定底色、主按鈕文字對比計算 | PASS；報告列每組色碼與比值；只屬靜態計算，畫面量測NOT_RUN | Codex |
| 產品UI、平板觸控、三引擎 | 真實可操作版本與截圖／trace | NOT_RUN；本次只有設計與規劃 | 待實際UX／QA |
| 教材／音訊人工審核 | U01-V真人逐項簽核 | NOT_RUN；blueprint人審依P0-03仍待確認 | 待日語審核者 |

P2-10為文件DONE；P2-01～09、P2-11～18、U01-M／T／Q1／Q2／A／V／I共24項尚未完成，狀態見tasks.md。前置P1-12未過，不用這份規劃當作工程可放行或可發布。

## G2 完整gate

| 需求 | 對應交付／測試 | 狀態 | 尚缺證據 |
|---|---|---|---|
| G2-1 | U01四主線、配額、人工內容審核 | NOT_RUN | P2-08、U01-V／I |
| G2-2 | 位置、戰鬥與學習續接 | NOT_RUN | P2-05、P2-17 |
| G2-3 | 隔日複習與固定選題 | NOT_RUN | P2-02、P2-05 |
| G2-4 | 60%與獨立能力計算 | NOT_RUN | P2-02、P2-14 |
| G2-5 | 全世界與學習資料A/B隔離 | NOT_RUN | P2-15、P2-17 |
| G2-6 | 手機、平板、鍵盤、縮放、替代流程 | NOT_RUN | P2-07、P2-12、P2-09 |
| G2-7 | 結果與持久資料一致 | NOT_RUN | P2-06、P2-15 |
| G2-8 | 可行走地圖、碰撞與停止輸入 | NOT_RUN | P2-12、P2-13 |
| G2-9 | 三行動、敵方預告與完整回合邊界 | NOT_RUN | P2-14 |
| G2-10 | 合法領獎、冪等／雙分頁 | NOT_RUN | P2-15 |
| G2-11 | 試穿、原子購買與裝備狀態 | NOT_RUN | P2-15、P2-16 |
| G2-12 | 三場景造型一致、來源與真人視覺 | NOT_RUN | P2-11、P2-09 |
| G2-13 | 新資料保全、版本恢復、匯出格式 | NOT_RUN | P2-17 |
| G2-14 | 完整下載後離線冷啟冒險與音訊 | NOT_RUN | P2-17、U01-I |
| G2-15 | 三引擎、實體平板、人工操作／可玩性 | NOT_RUN | P2-09及實際reviewer |

每項正式證據需commit、環境、實際browser／裝置、步驟、預期／實際、trace／截圖與reviewer。概念圖不是測試截圖；人工審查與agent初審分開。正式模擬UI-08與完整備份匯入gate歸P5，P2仍須交付新增資料的匯出格式與既有設定回歸。

## 第一批工程驗證

| Task／範圍 | 預期與實際 | 證據／reviewer |
|---|---|---|
| P2-01 | runtime schema拒絕不明版本、錯誤答案／技能／素材契約；題族不跨partition；正誤／提示／跳過／重試／中斷fixture | DONE；src/content/contracts.ts、learning/rules.test.ts；Codex工程核對 |
| P2-02 | 60%／無樣本、5不同題族／2日／48h、日曆時區／DST、複習與三題補救間隔 | DONE；src/learning/rules.ts及測試；Codex工程核對 |
| P2-15與後續資料基礎 | 10次回合防重、競爭購買、故障rollback、換裝鎖定與快照、v5資料保留 | Unit PASS，整項與UI／雙分頁仍待驗；journey*.test.ts |
| 工程檢查 | 205 tests／22 files、typecheck、lint | PASS；evidence/foundation-unit.txt、foundation-typecheck.txt、foundation-lint.txt；Codex；不作P2瀏覽器／實機結果 |

G2表保留NOT_RUN，後續只有完整情境有操作證據才逐項更新。相關產品程式在本批提交後如再修改，需要重跑受影響檢查。

## 第二批隔離預覽（尚未完成gate）

- 全單元209／23files PASS，typecheck與lint PASS；新增E2E後重查中。審閱build PASS。
- 共用UI五寬、64px、Dialog Escape／焦點、390px模擬200%文字 PASS，evidence/ui-foundation/results.json；Codex已實際看圖。
- 小鎮地點→道館教學→戰鬥第一題入口 PASS，evidence/adventure-integration/smoke.json；不是完整戰鬥／購物gate。
- 新U01、13張正式分層草稿圖與10段新WAV僅工程草稿；日語內容／音訊審聽／真人視覺／實體平板 NOT_RUN。剩4段語音遇429，T13情境圖未補，i18n與版本恢復未完整。
- 全部G2表維持原狀直到完整情境操作與證據齊備；此批不宣稱ENGINEERING_READY。

第二批保存更新：語音429經工作間隔後恢復，14檔已完整生成，仍全為DRAFT。Chromium初次7項有6 PASS，完整循環因雙分頁focus hydration使領獎按鈕更新而timeout；已改以兩頁既有按鈕同時dispatch測競態，重跑待完成。版本恢復與移動dirty checkpoint保全亦已補，後續需驗證。工程摘要evidence/integration-batch.json。

第三批工程驗證：215 tests／24 files、typecheck、lint、validate:data、blueprint（11項含假核准壞夾具）、validate:journey及審閱build PASS。U01升u01-2-draft／item v2，前版原始內容存docs/content/U01/archive；14圖、14音及65題關聯／hash／題型分配檢查通過。release檢查仍須拒絕未審內容。新稿新增四格T13圖、完整日文題目／解說／提示、教學ruby與difficulty；R02擴為六輪跨角色對話。

Chromium與Firefox各15項新suite首次14 PASS／1 FAIL；FAIL為名字selector同時找到header與hidden dialog，已限定header並保持原隔離斷言，待重跑。兩引擎實際六聽力播放、音訊失敗不記錯、storage故障保留答案、版本備份、四播放器、完整金幣購物、五寬、200%文字及真斷站冷啟冒險已PASS（程式隨後加強同版本壞資料／錢包保全並升內容版本，需重跑受影響suite）。新資料損壞不默認清空或重設餘額，PIN後可匯出原始紀錄。

商品版本跨新舊分頁的canonical價格檢查仍需補強，尚不標P2-15 DONE；其他工程task持續待完整三引擎CI與證據。真人review ledger在docs/content/U01/review-ledger.json，全部NOT_RUN。
