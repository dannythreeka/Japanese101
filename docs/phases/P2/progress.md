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
