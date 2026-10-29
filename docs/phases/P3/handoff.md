# P3 恢復

先讀 ../full-experience.md、progress.md、acceptance.md、project.md、tasks.md。worktree Japanese101-p2，branch phase/full-experience；原P1 checkout勿碰。goal仍ACTIVE，使用者授權完整體驗跨phase工程，不得假造人工gate。

## 已交付

- kana-2-draft：平片各46教學、46練習、46獨立詞語檢核；整組完成才給略過先修資格，不寫taughtAt／stable。359人審NOT_RUN，commit4f02a5c已push至draft PR58。
- U02：25新詞5漢字3文法4閱讀6聽力50practice＋15check候選，10教學卡16真WAV、原創四格WebP。135人審NOT_RUN。入口`/#/preview/adventure?unit=U02&scene=dojo`、審閱`/#/__review/content?unit=U02`。
- 新registry實際4pack。world manifest由registry產可達dojo關聯；generic inventory盤點真實U01/U02，明列其餘22單元未完成，release確實阻擋。
- exportJourney修正全玩家所有單元battle/check匯出，state仍只取目前unit；勿再把兩處同樣篩選。家長報告讀全部plan，用實際教學時間，選課篩選與正確續學連結。
- 31項P2＋假名＋U02 Chromium已全PASS；240單元／29檔、typecheck、lint、build PASS。最後U02作者稿僅修學校促音說明和去掉未教否定前提，最後6項相關測試及三流程已重驗PASS，詳acceptance。此批是否已commit/push以git log/status為準。
- P3-03試用材料在usability/，匿名9空名額非已招募，fixture尚未準備；真人同意／兒童操作NOT_RUN。

## 下一工作

先保存此批最新驗證／commit／push並更新draft PR58，確認CI。4f02a5c的CI三引擎唯一失敗為舊P2 reviewer combobox定位歧義，已改明確名稱並在31項回歸通過；不能直接宣稱新CI全綠。

接續U03／U04：依docs/content/n5-manifest.json與tasks配額，先去重U01/U02新詞／漢字。教學內容／練習／獨立check需原創，不靠換名灌family。`scripts/author-u02.py`只作已寫出的U02作者稿，別直接換單元ID來湊新課程。腳本語法／素材來源／hash檢查可重用；新音訊用`npm run gen:voice:unit -- U03`，明確檢查已有檔稿版本。

P3-02最終四單元100詞20漢字至少10文法16閱讀24聽力200練習尚未達標。P4、P5全部仍待工程／內容，goal不可COMPLETE或BLOCKED。U02等主task須有人審後才能DONE。

## 命令與證據

Node22：`export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH`。
`npm run validate:units`、`npm run validate:journey`、`npm run validate:kana`；人審清單產出`node --import tsx scripts/unit-inventory.ts --write`（相同ID/hash才保留原review）。
`VITE_P2_REVIEW_PREVIEW=1 npm run build`；`P0_E2E_PORT=4248 npm run test:e2e -- e2e/p2-adventure.spec.ts e2e/p3-kana.spec.ts e2e/p3-u02.spec.ts --project=chromium`。

Playwright trace：ignored test-results/p3-integration，最後U02文字版test-results/p3-u02-text-final。選定畫面docs/phases/P3/evidence，320與768已看；未檢視寬度不可偷填人審。新原創圖及完整prompt見docs/content/U02/art-prompt.md；PNG曾超2MiB，已用原尺寸WebP385050bytes，沒有放寬上限。

勿apt install、改kernel/Wi-Fi/Tailscale或重啟交易主機。WebKit依賴只在CI隔離runner安裝。push目標phase/full-experience，憑證helper見完整體驗交接，勿印token。PR57已merge9c415fd，PR58維持draft。
