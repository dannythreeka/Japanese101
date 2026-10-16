# P2 恢復交接：冒險設計已更新

先讀 [project.md](../../../project.md)、[tasks.md](../../../tasks.md)、[設計附錄](../../design/ADVENTURE_RPG_SPEC.md)、[progress](progress.md)及[acceptance](acceptance.md)。這是P2設計準備，不是完成的遊戲版本。

## Checkout與證據

設計分支 `design/adventure-rpg-p2`，基準為P1 head `fd4ccd4a168c57c47cbe25ac7ee9408e37c01658`。本地worktree `/home/yyy/workspace/Japanese101-adventure-design`；原 `/home/yyy/workspace/Japanese101`仍在P1分支，不覆寫其工作。

```sh
cd /home/yyy/workspace/Japanese101-adventure-design
git status --short --branch
git log -4 --oneline
git diff --stat phase/p1-reliability...HEAD
git diff --check phase/p1-reliability...HEAD
```

本設計PR以 `phase/p1-reliability` 為base，避免把PR54程式重複列成設計變更。遠端base日後可能改變，恢復時讀實際PR狀態；P1整合後再更新設計分支並retarget main，不自行合併或正式部署。

## 已完成與下一步

- P2-10已完成文件工程交付；四張圖稿是方向參考。不可直接把完整PNG蓋在Canvas上假裝實作互動；P2-11仍須製作分層正式資產。
- 新的P2共25項（18項P2＋U01七項），gate仍P2-09，條件增加為15項。P2-01～09、11～18及全部U01內容工作未完成。
- 使用者批准冒險方向，沒有補造P1-12、內容人審與實機簽核。先查[P1驗收](../P1/acceptance.md)及[裝置清單](../P1/device-checklist.md)，依tasks.md選真正可執行工作。
- 前置完成後，可從P2-01學習資料、P2-03共用UI、P2-11素材開始；後續按ROADMAP批次。U01內容必須正式ID與真人審核，不拿圖上的「みず」當教材。
- 設計附錄的battle-rules-v0.1與economy-v0.1是可實作原型假設，不是兒童驗證結論。調整時記版本、原因、影響與測試，不變更N5能力標準或減少內容配額。
- 不新增無限世界／物種；P3／P4以manifest接入後續單元，維持正式模擬的獨立測量規則。

## 執行環境

本次只改文件與圖稿，沒有執行新冒險UI／三引擎測試。進入工程後沿用 `.nvmrc`／lockfile及[P1恢復命令](../P1/handoff.md)，再跑相關單元、資料、build與browser驗收；不能以文件檢查替代產品測試。

既有主機是Mac Mini交易主機，禁止為此工作更新apt／核心／Broadcom、重啟Wi-Fi／Tailscale／交易服務或主機。WebKit缺系統依賴時使用既有CI隔離runner；不對主機安裝依賴。網路權限依平台核准，憑證不得入repo、PR、圖稿或測試log。

## 文件檢查方式

確認tasks.md所有`#### ID｜`標題唯一；從各task的「依賴」欄建立圖，檢查所有ID存在、無循環、P2-09遞迴依賴覆蓋全部P2／U01。每個Phase統計需與prompt入口一致：8／13／25／27／145／19，合計237。核對G2-1～15及UI-01～14與六類狀態列；檢查變更Markdown相對連結、概念manifest的SHA256／大小及git diff --check。實際結果已保存於evidence/design-review.json。

人工可玩性及實體平板仍需真正的人與裝置；下一agent不得將此文件作者填成不存在的人工內容或兒童reviewer。
