# P3 恢復

先讀 ../full-experience.md、progress.md、acceptance.md、project.md、tasks.md；worktree Japanese101-p2，branch phase/full-experience，勿切回P1覆寫。

新入口：/#/preview/adventure?unit=KANA-HIRA&scene=learn、KANA-KATA；道館有選課與獨立先修檢核。kana-2-draft每script46教學＋46單字音practice＋46詞語位置check。僅完整完成的合法無提示Attempt給略過先修資格，不寫taughtAt或stable。不要把184假名題算入正式1200練習配額。

下一步：U02～U04實際教材、音訊、inventory、審閱與多單元報告／複習。U02草案構思尚未寫入檔案；依manifest的G04/G05/G06（これそれあれ／このそのあの＋N／NのN）、25新詞5漢字3文法4閱讀6聽力50練習編寫。去除U01既有詞彙；同義變體與名字替換不可灌題族。現有registry只3個真實pack，勿將24單元blueprint當完成教材。

本批231單元、lint、型別、build、4項ChromiumPASS；新release validator已實際以exit1阻擋359項人審NOT_RUN。證據evidence/kana-placement-result.png已檢視；trace為ignored test-results/p3-placement-final、playwright-report/p3-placement。審閱頁用明確aria-label避免select內容污染label。

Node22：export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH。npm test；npm run validate:kana；VITE_P2_REVIEW_PREVIEW=1 npm run build；P0_E2E_PORT=4248 npm run test:e2e -- e2e/p3-kana.spec.ts --project=chromium。

不要在交易主機apt install或重啟網路。CI在隔離runner裝三引擎。P2人審、kana人審與實體平板仍NOT_RUN，但完整體驗目標授權繼續工程；不阻塞全部後續工作。PR57已merge9c415fd；後續PR58 draft，push目標phase/full-experience。最新SHA由git log確認。
