# 完整體驗持續交接

2026-10-30，使用者持續目標：「把所有的 phase 都全部實作完成，我想直接體驗完全體版本」。goal ACTIVE，未完成。project.md的2026-10-30範圍更新授權跨P2～P5工程與隔離預覽，沒有取消真人／教材／實機／兒童gate。不要因缺同一項人審停止全部獨立工程，也不能把目標標COMPLETE。

## 工作目錄與提交

- worktree `/home/yyy/workspace/Japanese101-p2`，branch `phase/full-experience`。命名p2不代表仍只做P2。原P1 checkout勿碰。
- PR57已merge：`9c415fd1a690228838fbfab0afdc8a4e5ef92436`，head327ec61；CI40911695545三瀏覽器全綠。
- 後續draft PR58：https://github.com/dannythreeka/Japanese101/pull/58 。最新已push `3289f0ae477fb745e62f6b6a4b31b38adcd5439e`（U02、完整跨單元匯出與試用材料）；前一提交`4f02a5ca832989be5bd0be746c71e178821895e6`為假名先修檢核。40269c2多單元基礎、bb1aa45假名教學、f7a9cf2交接。
- **本批U03七項瀏覽器已PASS，尚待commit/push**；以git status/log確認，不假稱已提交。所有未提交修改為本session，沒有混入他人修改。
- 4f02a5c的CI40920767848：Test & Build成功；三瀏覽器各45PASS/1FAIL，同一P2審閱測試使用未命名combobox，新增教材select後strict violation。已改明確「選擇題目」，3289f0的CI40925952499建置與三瀏覽器均success。上一版f7的CI40916267390三引擎全綠，不拿它替代新結果。

## 真實工程狀態

- P2工程與預覽可玩，149筆內容人審未回覆，P2人工與實機gate原狀保留。
- P3-01：兩套46字教學、各46練習＋46詞語音訊先修檢核；未教可測，整組完成後合法Attempt才給略過資格，不捏造taughtAt／stable。359筆人審NOT_RUN，task IN_REVIEW。已commit/push。
- P3-02／U02：runtime JSON已實際製作25新詞5漢字3文法4閱讀6聽力50練習＋15獨立check候選；16真WAV與四格原創WebP、135筆人審清單；registry有四pack（假名2＋U01/U02），不是24單元佔位。
- 同批修復跨單元完整export（之前漏其他單元戰鬥/check）、家長各單元報告／實際教學時間／正確練習連結；world manifest追蹤所有pack；generic inventory檢查實際配額／去重／先修／音訊／圖片，不宣稱人工PASS。
- 240單元／29檔、lint／型別／build PASS。U02首次E2E播放label錯誤已依DOM修正，後續31項Chromium P2/P3整合全PASS。原稿最後小修：学校促音說明及避免未教否定句；已重建並重跑6項相關單元與三項U02流程PASS，差異已記acceptance。
- U02新圖內建image_gen產，原PNG>2MiB已用瀏覽器Canvas保留尺寸編碼成385,050bytes WebP；圖在public/assets/img/u02/classroom-contexts.webp，prompt與來源在docs/content/U02/art-prompt.md。未放寬離線單檔限制。
- P3-03：docs/phases/P3/usability 有腳本、同意範本、九個匿名空名額、觀察／缺陷CSV；招募、同意、兒童試用未做，正式fixture仍需工程準備，不把文件算實測。

## 下一步

1. U02批次已commit/push，CI40925952499三引擎success。當前U03已完成教材、16音訊、4格插畫與7項內容關聯測試；U02/U03七項Chromium已PASS、素材與320/768圖已檢視；完成commit／push及PR58更新。
2. U03已完成草稿工程（65題、16音訊、135人審NOT_RUN）；繼續製作U04實際教材與音訊，沿用registry／generic inventory／authoring與review ledger，不用換人名或選項灌family；P3-02需四單元100詞20漢字至少10文法16閱讀24聽力200practice。補P3-03隔離試用fixture。
3. P4全部24單元共600詞100漢字60文法96閱讀144聽力1200練習。獨立檢核不同family且跨日至少48h規則不變；真人語言與音訊審核未取得仍DRAFT。
4. P5原創A/B/C各80題（25/30/25），與練習／check及互相題族隔離；20/40/30分鐘狀態機、交卷冪等、分段／中斷／重做標示、raw報告與7日兩卷內部指標、家長完整備份還原、SW安全更新。
5. 真人／實機、九人與18人14天試用據實處理；不自動招募、發訊息或買服務。現在仍有大量獨立工程，goal不應blocked。

## 恢復與環境

- `export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH`。default Node26不符合repo。
- `npm test`；`npm run typecheck`；`npm run lint`；`npm run validate:journey`；`npm run validate:units`；`npm run validate:kana`。
- `VITE_P2_REVIEW_PREVIEW=1 npm run build`；`P0_E2E_PORT=4248 npm run test:e2e -- e2e/p2-adventure.spec.ts e2e/p3-kana.spec.ts e2e/p3-u02.spec.ts --project=chromium`。
- 需要spawn/browser/network時用平台範圍核准require_escalated；禁止更動交易主機apt、kernel、Broadcom、Wi-Fi、Tailscale、交易排程或重啟。
- `git -c credential.helper= -c 'credential.helper=!python3 /tmp/japanese101-recovery/git-credential.py' -c credential.useHttpPath=true push origin phase/full-experience`。沿用既有授權token但不輸出；不要用固定推p2的/tmp/j101-push-p2.py。
- Playwright trace/report在ignored test-results、playwright-report；選定截圖commit至docs/phases/P3/evidence。WebKit在CI隔離runner跑，本機不要apt install。
