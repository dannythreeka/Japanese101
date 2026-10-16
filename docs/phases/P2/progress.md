# P2 進度

日期：2026-10-16（Asia/Taipei）｜狀態：**IN_PROGRESS（設計交付；產品工程尚未開始）**

## 基準與責任

- 原設計分支：`design/adventure-rpg-p2`；原worktree：`/home/yyy/workspace/Japanese101-adventure-design`。當前接續分支為 `phase/p1-reliability`，checkout `/home/yyy/workspace/Japanese101`。
- 原設計基準：`fd4ccd4a168c57c47cbe25ac7ee9408e37c01658`；設計提交 `225ab6e7a70583980f6a9d27bdc3759cfc87c77f` 已經由[PR55](https://github.com/dannythreeka/Japanese101/pull/55)合併，merge `0b1cb5e7194f2b46b944857e5817be8bdc1e65b7`。本次fetch確認P1遠端及本機均已包含；[PR54](https://github.com/dannythreeka/Japanese101/pull/54)仍open／draft／未合併，base main仍為 `bc2116ad789d247e3be44d2eba5b5a0e790b73ea`。
- 本次設計／文件工程與一致性審查：Codex；產品方向由本對話的專案擁有者確認。實際日語內容審核者、人工 UX／QA、實機 reviewer 尚待原 gate 名單確認，不填虛構姓名。
- P1 現況仍是 ENGINEERING_READY／gate NO-GO；P0／P1人工補驗不由新美術方向確認抵銷。

## 已交付

P2-10：主規格 v1.1、[冒險設計](../../design/ADVENTURE_RPG_SPEC.md)、四張風格／畫面圖稿與來源、P2-01～18＋U01七項，共25項、15項G2驗收與UI-01～14索引、P2／後續prompt、跨Phase影響與本交接。此task只驗文件，不宣告玩法／素材／教材已完成。

## 決策

1. 旅行手帳插畫、平板優先、自由探索、日語答題戰鬥、金幣／裝備採使用者確認方向。
2. P2只交付一鎮完整循環，保留U01完整配額與人審；P3再做兒童可用性，不把概念圖的吸引力當可玩性證據。
3. 五有效作答小節與戰鬥終止分開；world／battle／economy／learning分責，裝備不改日語能力。
4. HP、傷害、金幣、商品價格是設計附錄唯一維護的原型假設；依版本測試與調整，不把圖上數字當規則。
5. 原P2 task ID與gate P2-09保留，新增P2-10～18；P3／P4沿用同世界接教材，不直接增加24張地圖。
6. 設計PR55以P1分支為base並已依使用者指示合併。設計現在隨PR54等待P1正式整合，不再要求重新開設計PR或retarget已合併的PR55；不自行合併PR54或發布。

## 嘗試與驗證

- 預設sandbox的GitHub讀取因網路限制失敗；使用既有已授權憑證的受控讀取在核准的網路權限下成功，未輸出憑證。GitHub外掛亦已成功讀取PR54狀態。沒有改主機系統、網路或交易服務。
- 文件／依賴／hash／色碼檢查見 [acceptance](acceptance.md)；本次不改runtime，未重新宣稱P1測試為P2結果。

## 2026-10-16 規格同步與接續判斷

本次執行／文件reviewer：Codex；人工內容、UX及實機reviewer仍待實際承接。本次已重讀使用者指定的六份文件，查閱P0／P1 gate、device-checklist及全部task依賴；fetch成功，工作分支起始乾淨且已包含PR55，不需要重複merge。當前工作是同步progress／acceptance／handoff與依賴核對，不重做P2-10或新增產品範圍。

- P2仍25項；P2-10文件DONE，其餘24項TODO。P2-09覆蓋全部25項，G2-1～15仍NOT_RUN。
- P2-01／03／11的直接前置包含BLOCKED的P1-12；U01-M的直接前置是IN_REVIEW的P0-03。其餘task沿依賴鏈受阻；符合全部依賴DONE的未完成task為0，不自行跳過前置。
- PR55及本次交接相較已驗證P1版本沒有變更產品程式、測試或CI；187／54 PASS仍只引用原P1 run，不宣稱本次重跑。核對結果保存於[evidence/spec-sync.json](evidence/spec-sync.json)。
- 未發現可不依賴外部簽核而繼續的P1工程漏項；沒有重複執行已通過的長回歸。新規格下的UI改造按P2-03／11～18接續，P1既有素材語義與實機驗收保留。
- 首次commit因本checkout未設定Git作者身分而失敗，尚未產生提交；改沿用本repository先前提交的既有noreply身分，以單次Git參數提交，不改全域設定。

## 下一步與外部條件

P1-12依原device-checklist補齊實機與人審，P0-03內容blueprint確認。設計可審閱；教材草擬可獨立準備但不冒充人審。前置具備後按tasks.md推進P2-01／03／11，再串世界、戰鬥、商店與U01。恢復時先讀handoff與最新遠端狀態。
