# 完整體驗持續交接

2026-10-30。使用者目標：「把所有的 phase 都全部實作完成，我想直接體驗完全體版本」。goal ACTIVE，未完成。project.md範圍更新授權跨P2～P5工程／草稿預覽，沒有取消真人／教材／實機／兒童gate。不能以缺同一項人審停止全部獨立工程，也不能將草稿標COMPLETE。

## 工作樹與提交

- `/home/yyy/workspace/Japanese101-p2`，branch `phase/full-experience`；原P1 checkout勿碰。所有本次未提交修改均本session工作。
- PR57已merge9c415fd1a690228838fbfab0afdc8a4e5ef92436，CI40911695545全綠。
- 後續draft PR58：https://github.com/dannythreeka/Japanese101/pull/58 ，不要自動merge／正式發布。
- 最新已push93a5dbda648fa8bc6637cdade3a5a1647e3d997c（首四課與fixture），CI40934773054進行中；前3982b5cc42e00a933c80da7e8e3a4cf3dadc17bc為U03。CI40930288466建置及三引擎success；前3289f0（U02）CI40925952499亦全綠。更早4f02a5c是假名先修檢核。
- U04／首四課整合／fixture已提交93a5dbd；本批P4-02工具狀態以git log/status確認；最終產品測試紀錄在docs/phases/P3/acceptance.md。不要拿舊commit CI替代新變更。

## 實際工程狀態

- P2工程與預覽可玩；U01既有149筆人審、P2人工／實機gate原狀。
- P3-01：平片各46教學46practice46獨立詞語check。完整合法作答才允許略過先修，不捏造教學時間或穩定能力；359筆人審NOT_RUN。
- U01～04實際4單元（加假名共6pack），100唯一詞20漢字12文法16閱讀24聽力200練習。U02～04各65題候選、10教學、16真WAV、原創四格圖，各135人審NOT_RUN。達工程內容量不等於P3 gate。
- 所有pack都有道館入口。各單元battle/check/plans隔離；世界／金幣／裝備依玩家共用，exportJourney匯出該玩家全單元而非只目前unit；報告按unit顯示實際教學時間與Attempt。
- media.ts集中實際音訊／圖片，introductions.ts集中各課介紹；未知單元不回退U01。inventory盤點真實內容與來源hash，release會拒絕缺人審及未做的U05～24。
- 本批246單元／30檔、39 Chromium P2/P3整合PASS（8.0m）；39後修改U04提示為位置／存在用語、補fixture代碼／gradeBand／provenance，最終7項針對重驗全PASS（2.0m），位置提示圖已檢視。沒有改戰鬥經濟數字。
- P3-03：九人試用材料與空名額、匿名本機fixture工具。prepare建立新context，40合成起始金幣、零作答；拒絕覆寫，快照可購物裝備。headful、實體平板fixture、招募、同意與真試用NOT_RUN。

## 接續工作

1. U04已commit/push93a5dbd並更新draft PR58；查CI40934773054。本批P4-02工具與新task P4-GAP-01保存／提交狀態看git log；先讀P4/handoff再接續。
2. P4-02工具已實作完整配額／14題型／skill五題族缺口／逐項hash簽核。報告curriculum-coverage.json：75節點12有候選63缺口，554筆簽核全未核准；P4-GAP-01補15共通skill的primary practice/check，P4 task總146項。下一步開始真實補題，不能宣稱共通skill已覆蓋。
3. 製作U05～24真實原創內容與音訊；不能只換人名／選項來灌family。P4總量600詞100漢字60文法96閱讀144聽力1200practice，人工審核未完成仍DRAFT。
4. P5三份原創80題卷（25/30/25，20/40/30分鐘）及互相／練習題族隔離；時鐘／中斷／冪等交卷、raw報告、7日兩卷指標、完整備份還原、安全SW更新。
5. 真人／實機、九人及18人14天試用只能記真實結果；不自動招募、買服務或發訊息。仍有大量獨立工程，不把goal標BLOCKED或COMPLETE。

## 恢復命令與主機限制

Node22：`export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH`；default Node26不符合repo。
`npm test`、`npm run typecheck`、`npm run lint`、`npm run validate:journey`、`npm run validate:units`、`npm run validate:kana`。
`VITE_P2_REVIEW_PREVIEW=1 npm run build`；`P0_E2E_PORT=4248 npm run test:e2e -- e2e/p3-u04.spec.ts e2e/p3-curriculum.spec.ts e2e/p3-fixture.spec.ts --project=chromium`。
需要spawn/browser/network用平台範圍核准require_escalated；禁止改交易主機apt、kernel、Broadcom、WiFi、Tailscale、交易排程或重啟。WebKit依賴只在CI隔離runner裝。
push：`git -c credential.helper= -c 'credential.helper=!python3 /tmp/japanese101-recovery/git-credential.py' -c credential.useHttpPath=true push origin phase/full-experience`。沿用已授權token不輸出；別用固定推p2的/tmp/j101-push-p2.py。
trace／report在ignored test-results、playwright-report；選定截圖在docs/phases/P3/evidence。作者稿拒覆APPROVED內容；音訊只在稿／檔hash吻合時重用，不重產已成功檔。
