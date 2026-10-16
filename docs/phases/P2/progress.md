# P2 進度

日期：2026-10-16（Asia/Taipei）｜狀態：**IN_PROGRESS（設計交付；產品工程尚未開始）**

## 基準與責任

- 文件分支：`design/adventure-rpg-p2`；worktree：`/home/yyy/workspace/Japanese101-adventure-design`。
- 基準：`fd4ccd4a168c57c47cbe25ac7ee9408e37c01658`，來自 `phase/p1-reliability`／[draft PR54](https://github.com/dannythreeka/Japanese101/pull/54)。遠端確認仍未合併；main 為 `bc2116ad789d247e3be44d2eba5b5a0e790b73ea`。
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
6. 本PR以P1分支為base，隔離本次設計差異；待P1正常整合後再調整base／解決衝突，不自行合併PR54或發布。

## 嘗試與驗證

- 預設sandbox的GitHub讀取因網路限制失敗；使用既有已授權憑證的受控讀取在核准的網路權限下成功，未輸出憑證。GitHub外掛亦已成功讀取PR54狀態。沒有改主機系統、網路或交易服務。
- 文件／依賴／hash／色碼檢查見 [acceptance](acceptance.md)；本次不改runtime，未重新宣稱P1測試為P2結果。

## 下一步與外部條件

P1-12依原device-checklist補齊實機與人審，P0-03內容blueprint確認。設計可審閱；教材草擬可獨立準備但不冒充人審。前置具備後按tasks.md推進P2-01／03／11，再串世界、戰鬥、商店與U01。恢復時先讀handoff與最新遠端狀態。
