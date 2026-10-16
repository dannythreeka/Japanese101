# P2 執行歷史（截至 911fa44）

這是歷次工作、失敗與修正的原始紀錄；目前狀態只看 progress／acceptance／handoff。歷史 NOT_RUN／NO-GO 或數量不得當作目前驗收結果。

## 原 progress.md

# P2 進度

狀態：**IN_PROGRESS**。工程owner／初審：本session Codex。P2教材、真人UX／可玩性與實體平板reviewer尚待實際簽核，不填假人名。

## 基準與前置

- 分支 `phase/p2-adventure`；worktree `/home/yyy/workspace/Japanese101-p2`。
- 基準main `99b8805`，已包含PR54／55／56、P1工程與配額修正；原工作目錄及使用者修改保留。
- 使用者最新確認「P0 and P1 驗證過了」。來源 [predecessor-approval.json](evidence/predecessor-approval.json)，本批保存核准並更新前置狀態；不虛構個別人審／裝置細節。
- P2共25項，P2-10設計DONE不重做。U01-V及P2-09的人工／實機驗收尚未發生。

## 當前工作

P2-01內容／Attempt契約、P2-03旅行手帳共用UI開始；接續learning規則、正式U01草稿、世界與戰鬥／經濟交易。依tasks依賴小批提交，保留完整25項及15項gate。

## 決策與界線

沿用設計附錄的版本化原型，不調低教材配額或能力門檻。保留舊玩家／夥伴ID與所有歷史；普通戰鬥不倒數，勝負／裝備不改能力。U01草稿與隔離fixture不得冒充人工定稿。

主機為Mac Mini交易機，不改apt、核心、Wi-Fi、Tailscale或交易服務。WebKit系統依賴使用既有隔離CI，不在主機安裝。

## 嘗試與限制

平台仍有前次P0 blocked goal，須先保存使用者核准後完成該goal，再建立P2 goal；不把P2標完成。PR54／56已合併，沒有重新合併或正式發布。

## 第一批工程：契約、學習規則與交易基礎

P2-01／02工程驗收DONE（Codex工程實作與規格核對）。新增unknown輸入驗證、版本／題族隔離、首次／提示／跳過／重試契約，60%與無樣本、五題族／兩天／48h、日曆與時區、複習間隔及補救間隔。P2-03共用元件已建立，尚待實際畫面／焦點／viewport驗證，保持IN_PROGRESS。

P2-15交易工程進行中：世界安全落點與BFS、版本化battle規則、原子回合／Attempt、wallet ledger／首勝鍵、購買並裝備／快照與新資料匯出已作為基礎交付；尚未聲稱UI或完整P2-12～18完成。v6升級先備份v5原始資料，不轉換星星或XP；reset/delete新增資料仍限指定玩家。

首次npm ci在sandbox因esbuild子程序EPERM失敗；依lockfile在核准執行權限下成功，沒有改OS或依賴版本。初次測試定位到測試缺fake-indexeddb初始化與TypeScript不允許parameter property，已修正；lint要求共用音訊函式移到非元件檔，保留規則後通過。

驗證：Node22.23.2，205 tests／22 files PASS，typecheck與lint PASS；紀錄在evidence/foundation-*。這是資料／單元基礎，不是P2三引擎、人工教材、美術或實機gate。imagegen已開始地形／建築／角色分層資產，原圖先保留工具來源，正式資產還需manifest與人工核對。

## 第二批：隔離冒險預覽與U01草稿（執行中）

入口為開發／preview專用 `/#/preview/adventure`；DRAFT教材不替換正式孩子入口。QuestionPlayer四種renderer、手動確認／繼續、獨立check全卷後解說、v7 learningChecks、位置／故事／教學／戰鬥／購物／背包／旅行手帳與PIN後家長報告已串接，完整gate仍待驗。CI建置顯式開啟審閱入口，不變更正式部署設定。

U01草稿：25詞、5漢字、3文法、4閱讀、6聽力、50practice與15check候選，全部DRAFT，未編造reviewer。14類分配與教學先修已建，題族真實獨立性、教材自然度與新詞盤點仍待非作者日語審核。T13目前仍需正式情境圖，日文操作／教材翻譯、ruby亦待補完。

13張原創分層WebP合計5,177,318bytes，來源prompt／hash／尺寸／透明區已存manifest；詳design/JOURNEY_ART.md。工程初看與實際1024畫面已核對；發現fox戰鬥耳朵裁切及對手鄰格殘影，改明確取樣窗後須再看截圖。真人視覺與跨場景裝備對位尚未通過。

共用UI五寬／64px／dialog Escape焦點／模擬200%文字通過，evidence/ui-foundation；已實際看截圖，修正Tailwind reset造成dialog偏左上。初步小鎮→教學→戰鬥入口PASS，evidence/adventure-integration；不是完整循環或G2通過。新完整循環與五寬E2E在e2e/p2-adventure.spec.ts，首次執行中。

本批已跑209 tests／23files PASS，typecheck／lint已通過（新增E2E後再檢查中）；審閱build PASS，預快取434教材資產。正式release審查尚未執行。語音六聽力與四詞卡共10段PCM WAV已生成並保留；首次後段請求逾時、有限次重試多完成一段後HTTP429，剩kanji與三grammar共4段缺件，不再對未變條件持續重試。音檔metadata/hash在public/assets/audio/u01/manifest.json，全部待真人審聽。

下一步：修復新E2E暴露問題，完整版本安全恢復、離線冷啟、兩玩家／雙分頁／故障操作證據、世界／素材關聯validator、日文與ruby、缺圖音，再跑三引擎CI；保持draft PR57。

第二批保存更新：語音429經工作間隔後恢復，14檔已完整生成，仍全為DRAFT。Chromium初次7項有6 PASS，完整循環因雙分頁focus hydration使領獎按鈕更新而timeout；已改以兩頁既有按鈕同時dispatch測競態，重跑待完成。版本恢復與移動dirty checkpoint保全亦已補，後續需驗證。工程摘要evidence/integration-batch.json。

第三批工程驗證：215 tests／24 files、typecheck、lint、validate:data、blueprint（11項含假核准壞夾具）、validate:journey及審閱build PASS。U01升u01-2-draft／item v2，前版原始內容存docs/content/U01/archive；14圖、14音及65題關聯／hash／題型分配檢查通過。release檢查仍須拒絕未審內容。新稿新增四格T13圖、完整日文題目／解說／提示、教學ruby與difficulty；R02擴為六輪跨角色對話。

Chromium與Firefox各15項新suite首次14 PASS／1 FAIL；FAIL為名字selector同時找到header與hidden dialog，已限定header並保持原隔離斷言，待重跑。兩引擎實際六聽力播放、音訊失敗不記錯、storage故障保留答案、版本備份、四播放器、完整金幣購物、五寬、200%文字及真斷站冷啟冒險已PASS（程式隨後加強同版本壞資料／錢包保全並升內容版本，需重跑受影響suite）。新資料損壞不默認清空或重設餘額，PIN後可匯出原始紀錄。

商品版本跨新舊分頁的canonical價格檢查仍需補強，尚不標P2-15 DONE；其他工程task持續待完整三引擎CI與證據。真人review ledger在docs/content/U01/review-ledger.json，全部NOT_RUN。

第四批：v8 catalogVersions保存單調遞增商品revision，舊分頁不能用舊價格購買或覆蓋新版；同物競購回傳already-owned不再假報儲存失敗，餘額競爭刷新實際狀態。題目／美術改版不重置舊practice首勝鍵。新增overflow與非法purchase identity邊界。217單元、typecheck、lint PASS。

前一工程提交dcab575的Test&Build及三引擎全PASS，evidence/ci-dcab575.json；該結果不冒充尚未提交的v8／美術v2。v8局部版Chromium／Firefox各16項全過，包含真斷站冷啟與六WAV；新增長閱讀／防重播／雙分頁同物／審閱console與20次資源檢查待最新suite。Chromium20次世界移動、進出音訊後RAF／interval／45s播放timeout／active audio歸零已PASS，後續完整CI再驗。

P2-03／04／05／12工程驗收DONE（Codex工程reviewer）；P2-11、U01-M已交可審閱結果，IN_REVIEW但真人尚NOT_RUN。其餘task依賴保持真實。U01-T／Q1／Q2／A／V／I正式依賴未滿，草稿可看不等於DONE。真人集中步驟見human-review.md。

新審閱頁 /#/__review/content 可看全部65題與正解、14教材＋4居民WAV、四方向及三戰鬥姿態裝備；完全不寫Attempt／wallet或簽核。居民朗讀已改四段本地WAV，以免依賴平板是否有系統日語聲線；生成時遇429，保留已完成兩檔並經工作間隔有限續作，四檔均已完成DRAFT。美術v2背面視角修正、manifest frameWindows與三場景新截圖保存evidence/gear-visual；Codex已實際看圖，真人核准仍NOT_RUN。

第四批提交前檢查：218 tests／24 files、typecheck、lint、validate:data、blueprint與validate:journey全PASS，審閱build PASS（444離線素材）。新P2 suite共20項，含兩頁同物競購、長閱讀五寬、平板768×1024／1024×768、200%文字、審閱頁無寫入及20次資源檢查；最新全suite待本批提交後重跑。詞／漢字／文法均有明確teaching refs，duplicate item revision壞fixture會失敗。

存檔邊界補驗發現：同worldVersion但position=null／storyFlags型別壞掉時，普通saveWorld原本會覆蓋壞資料；新增拒絕fixture先真實失敗（回傳有效位置卻把bad拆成字元flag），改用完整currentWorld驗證後才允許普通寫入。保留原紀錄，僅明確recover流程先備份再恢復。此修正不改正常世界／戰鬥／學習規則。

三個確定失敗的補驗已修正：同版本壞checkpoint不准普通覆寫；勝利必須有本battle當回合、同題版本的首次正確practice Attempt（跳過／舊回合／無題不發幣）；SRS同日八次答對原會推到11/15，與G2-3翌日複習衝突。已在project §5.4釐清只有到期複習前進間隔，普通未到期練習保留到期日，錯／提示仍回1天；新規則learning-v1.1-spaced，舊衍生排程先備份再依真實Attempt重建，失敗整筆rollback、不清原始作答。個人匯出亦納入只屬於該玩家的恢復快照，不匯出其他玩家或全庫legacy。新增下一天瀏覽器情境；P2 suite現21項。

未領的當版勝利可從手帳／道館續回領取，不因離開結算頁消失；已領返回只導航、不重播獎勵。新檢查不降低五題族／兩日／48h／4/5門檻，工程釐清不代表真人內容核准。

## 第五批：首次引導與讀取失敗復原

新增可略過／重播的暱稱、年級與初始偏好設定，只調整手帳建議量，不產生Attempt、複習或掌握紀錄。戰鬥可暫停且保留選項；結果列實際樣本、提示數及複習日。PIN後家長摘要顯示玩家暱稱、7／30天或全期、可讀技能名稱與弱項入口。

實際故障注入發現「購買交易已提交、後續讀取失敗」誤報還沒存好，已區分交易失敗與刷新失敗，後者僅重讀，不重送購買；作答亦使用相同語義。新瀏覽器回歸驗證購買與答案各只記一次，暫停／續玩和隔日複習保留原斷言。先前CI eb25eb5的隔日情境因測試未等待領獎導航完成便reload而失敗，已等待真實導航後再推時鐘，不變更產品門檻。

222單元／24files、typecheck、lint、data、blueprint11項、journey草稿關聯已PASS。新增作答刷新復原後再跑受影響檢查及完整三引擎；未以舊dcab575綠燈代替新版本驗收。所有P2人工審核與實體平板維持NOT_RUN。

WebKit eb25eb5 CI實際失敗為catalog情境：測試在商店入口存檔仍pending時就切全域商品版本，產品正確提前停用購買，測試卻等待點擊disabled按鈕。現在先等待原版商品可買，再模擬之後改版，仍要求改版文案、零扣款／零持有與revision不倒退。沒有force click、延長timeout或改弱交易斷言。


---

## 原 acceptance.md

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

第四批：v8 catalogVersions保存單調遞增商品revision，舊分頁不能用舊價格購買或覆蓋新版；同物競購回傳already-owned不再假報儲存失敗，餘額競爭刷新實際狀態。題目／美術改版不重置舊practice首勝鍵。新增overflow與非法purchase identity邊界。217單元、typecheck、lint PASS。

前一工程提交dcab575的Test&Build及三引擎全PASS，evidence/ci-dcab575.json；該結果不冒充尚未提交的v8／美術v2。v8局部版Chromium／Firefox各16項全過，包含真斷站冷啟與六WAV；新增長閱讀／防重播／雙分頁同物／審閱console與20次資源檢查待最新suite。Chromium20次世界移動、進出音訊後RAF／interval／45s播放timeout／active audio歸零已PASS，後續完整CI再驗。

P2-03／04／05／12工程驗收DONE（Codex工程reviewer）；P2-11、U01-M已交可審閱結果，IN_REVIEW但真人尚NOT_RUN。其餘task依賴保持真實。U01-T／Q1／Q2／A／V／I正式依賴未滿，草稿可看不等於DONE。真人集中步驟見human-review.md。

新審閱頁 /#/__review/content 可看全部65題與正解、14教材＋4居民WAV、四方向及三戰鬥姿態裝備；完全不寫Attempt／wallet或簽核。居民朗讀已改四段本地WAV，以免依賴平板是否有系統日語聲線；生成時遇429，保留已完成兩檔並經工作間隔有限續作，四檔均已完成DRAFT。美術v2背面視角修正、manifest frameWindows與三場景新截圖保存evidence/gear-visual；Codex已實際看圖，真人核准仍NOT_RUN。

第四批提交前檢查：218 tests／24 files、typecheck、lint、validate:data、blueprint與validate:journey全PASS，審閱build PASS（444離線素材）。新P2 suite共20項，含兩頁同物競購、長閱讀五寬、平板768×1024／1024×768、200%文字、審閱頁無寫入及20次資源檢查；最新全suite待本批提交後重跑。詞／漢字／文法均有明確teaching refs，duplicate item revision壞fixture會失敗。

補驗修正後：221 tests／24 files、typecheck、lint、validate:journey與build PASS。三個真實失敗及修正依據見evidence/boundary-regressions.json；不是刪測試或降低能力門檻。新增21項完整P2 browser suite待本修正提交後跑。

## 第五批：首次引導與讀取失敗復原

新增可略過／重播的暱稱、年級與初始偏好設定，只調整手帳建議量，不產生Attempt、複習或掌握紀錄。戰鬥可暫停且保留選項；結果列實際樣本、提示數及複習日。PIN後家長摘要顯示玩家暱稱、7／30天或全期、可讀技能名稱與弱項入口。

實際故障注入發現「購買交易已提交、後續讀取失敗」誤報還沒存好，已區分交易失敗與刷新失敗，後者僅重讀，不重送購買；作答亦使用相同語義。新瀏覽器回歸驗證購買與答案各只記一次，暫停／續玩和隔日複習保留原斷言。先前CI eb25eb5的隔日情境因測試未等待領獎導航完成便reload而失敗，已等待真實導航後再推時鐘，不變更產品門檻。

222單元／24files、typecheck、lint、data、blueprint11項、journey草稿關聯已PASS。新增作答刷新復原後再跑受影響檢查及完整三引擎；未以舊dcab575綠燈代替新版本驗收。所有P2人工審核與實體平板維持NOT_RUN。


---

## 原 handoff.md

# P2 接續交接

先讀project.md、tasks.md、docs/design/ADVENTURE_RPG_SPEC.md、concepts/README、progress.md與acceptance.md。

分支 `phase/p2-adventure`，worktree `/home/yyy/workspace/Japanese101-p2`，基準main `99b8805`。PR54／55／56已包含。使用者確認P0／P1通過，來源[evidence/predecessor-approval.json](evidence/predecessor-approval.json)。不可再把歷史NO-GO當成目前前置，也不能把此核准當成P2新教材／實機簽核。

目前25項P2 task，P2-10文件DONE；其餘依tasks逐項推進。P2-01／03開始，後續依賴見tasks。每批更新進度、驗收並commit／push，開draft PR；未授權自動merge main或發布。

```sh
cd /home/yyy/workspace/Japanese101-p2
export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH
git status --short --branch
git log -5 --oneline
npm ci
npm run typecheck
npm run validate:data
npm run validate:blueprint
npm run lint
npm test
npm run build
```

瀏覽器使用獨立context、獨立輸出目錄與未占用port。WebKit在隔離CI驗證，不改交易主機OS。保存commit、版本、步驟、截圖／trace；實際檢視圖；不拿WebKit模擬當實體平板。大trace用CI artifact，精選證據入repo。

## 第一批接續

P2-01／02已DONE；P2-03與15進行中。核心為src/content/contracts.ts、src/learning/rules.ts、src/db/journey.ts、journey-models.ts與db v6，純規則在battle／economy／world。共用UI在components/ui；所有正式進度用IndexedDB。

205單元／22檔、typecheck、lint已通過，evidence/foundation-*。下一批做QuestionPlayer、學習／檢核controller及UI狀態頁，再接小鎮、道館、商店與正式U01草稿。保持未審教材與正式入口分離。imagegen資產正在本session生成，來源在generated_images，不可把概念圖當正式地圖；完成後複製到專案並記來源／hash／容量及實際檢視。

## 第二批恢復入口

新增 `src/features/journey` 完整隔離預覽；`npm run dev -- --host 127.0.0.1 --port 4202 --strictPort` → `/#/preview/adventure`。正式build開預覽須 `VITE_P2_REVIEW_PREVIEW=1 npm run build`。CI已以同旗標建置，無正式發布。`P0_E2E_PORT=4213 npm run test:e2e -- e2e/p2-adventure.spec.ts --project=chromium`。

U01為DRAFT，pack與review在src/content/packs及docs/content/U01。13圖全部已保存於public/assets/img/journey，source hashes與prompts已存，不重生已可用資產。10音已保存，4音缺件因tts.quest逾時／429；script可保留已完成檔案續作，勿同條件無限重試。真人內容／語音／視覺／平板全部NOT_RUN。

DB v7新增獨立檢核；不可回頭改已交付v6 stores。完整check與戰鬥分開，check不顯示即時對錯、不發獎。useJourney綁定玩家；root進出音訊清理，parent report僅PIN通過後掛載。世界／內容／戰鬥版本變更除world外的安全恢復仍待完成；report統計、i18n／ruby、T13圖、雙分頁故障／offline／三引擎待驗。

本批209單元已過；E2E首次跑中，下一次先看progress與最新測試結果，不能把初步入口smoke算完整循環。P1詞卡長選單、書寫64px、結算讀取錯誤文案亦已修正，要回歸。

第二批保存更新：語音429經工作間隔後恢復，14檔已完整生成，仍全為DRAFT。Chromium初次7項有6 PASS，完整循環因雙分頁focus hydration使領獎按鈕更新而timeout；已改以兩頁既有按鈕同時dispatch測競態，重跑待完成。版本恢復與移動dirty checkpoint保全亦已補，後續需驗證。工程摘要evidence/integration-batch.json。

第三批工程驗證：215 tests／24 files、typecheck、lint、validate:data、blueprint（11項含假核准壞夾具）、validate:journey及審閱build PASS。U01升u01-2-draft／item v2，前版原始內容存docs/content/U01/archive；14圖、14音及65題關聯／hash／題型分配檢查通過。release檢查仍須拒絕未審內容。新稿新增四格T13圖、完整日文題目／解說／提示、教學ruby與difficulty；R02擴為六輪跨角色對話。

Chromium與Firefox各15項新suite首次14 PASS／1 FAIL；FAIL為名字selector同時找到header與hidden dialog，已限定header並保持原隔離斷言，待重跑。兩引擎實際六聽力播放、音訊失敗不記錯、storage故障保留答案、版本備份、四播放器、完整金幣購物、五寬、200%文字及真斷站冷啟冒險已PASS（程式隨後加強同版本壞資料／錢包保全並升內容版本，需重跑受影響suite）。新資料損壞不默認清空或重設餘額，PIN後可匯出原始紀錄。

商品版本跨新舊分頁的canonical價格檢查仍需補強，尚不標P2-15 DONE；其他工程task持續待完整三引擎CI與證據。真人review ledger在docs/content/U01/review-ledger.json，全部NOT_RUN。

第四批：v8 catalogVersions保存單調遞增商品revision，舊分頁不能用舊價格購買或覆蓋新版；同物競購回傳already-owned不再假報儲存失敗，餘額競爭刷新實際狀態。題目／美術改版不重置舊practice首勝鍵。新增overflow與非法purchase identity邊界。217單元、typecheck、lint PASS。

前一工程提交dcab575的Test&Build及三引擎全PASS，evidence/ci-dcab575.json；該結果不冒充尚未提交的v8／美術v2。v8局部版Chromium／Firefox各16項全過，包含真斷站冷啟與六WAV；新增長閱讀／防重播／雙分頁同物／審閱console與20次資源檢查待最新suite。Chromium20次世界移動、進出音訊後RAF／interval／45s播放timeout／active audio歸零已PASS，後續完整CI再驗。

P2-03／04／05／12工程驗收DONE（Codex工程reviewer）；P2-11、U01-M已交可審閱結果，IN_REVIEW但真人尚NOT_RUN。其餘task依賴保持真實。U01-T／Q1／Q2／A／V／I正式依賴未滿，草稿可看不等於DONE。真人集中步驟見human-review.md。

新審閱頁 /#/__review/content 可看全部65題與正解、14教材＋4居民WAV、四方向及三戰鬥姿態裝備；完全不寫Attempt／wallet或簽核。居民朗讀已改四段本地WAV，以免依賴平板是否有系統日語聲線；生成時遇429，保留已完成兩檔並經工作間隔有限續作，四檔均已完成DRAFT。美術v2背面視角修正、manifest frameWindows與三場景新截圖保存evidence/gear-visual；Codex已實際看圖，真人核准仍NOT_RUN。

第四批提交前檢查：218 tests／24 files、typecheck、lint、validate:data、blueprint與validate:journey全PASS，審閱build PASS（444離線素材）。新P2 suite共20項，含兩頁同物競購、長閱讀五寬、平板768×1024／1024×768、200%文字、審閱頁無寫入及20次資源檢查；最新全suite待本批提交後重跑。詞／漢字／文法均有明確teaching refs，duplicate item revision壞fixture會失敗。

最新核心：SRS learning-v1.1-spaced只在到期日獨立答對前進；未到期不延後due，舊derived review會backup/replay真實Attempts。Journey export含profile-filtered backups，完整全庫匯入仍是P5。reward綁定最後有效當回合題目／版本，普通saveWorld必須先驗證原checkpoint完整；未知／壞原資料只能走先備份recover。未領獎勝利在手帳／道館優先續接，不能自動發或重播。21項P2新瀏覽器情境（含時鐘推一天）需用最新commit跑。

## 第五批：首次引導與讀取失敗復原

新增可略過／重播的暱稱、年級與初始偏好設定，只調整手帳建議量，不產生Attempt、複習或掌握紀錄。戰鬥可暫停且保留選項；結果列實際樣本、提示數及複習日。PIN後家長摘要顯示玩家暱稱、7／30天或全期、可讀技能名稱與弱項入口。

實際故障注入發現「購買交易已提交、後續讀取失敗」誤報還沒存好，已區分交易失敗與刷新失敗，後者僅重讀，不重送購買；作答亦使用相同語義。新瀏覽器回歸驗證購買與答案各只記一次，暫停／續玩和隔日複習保留原斷言。先前CI eb25eb5的隔日情境因測試未等待領獎導航完成便reload而失敗，已等待真實導航後再推時鐘，不變更產品門檻。

222單元／24files、typecheck、lint、data、blueprint11項、journey草稿關聯已PASS。新增作答刷新復原後再跑受影響檢查及完整三引擎；未以舊dcab575綠燈代替新版本驗收。所有P2人工審核與實體平板維持NOT_RUN。
