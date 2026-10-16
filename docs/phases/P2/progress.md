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
