# P4 工程驗證

Phase IN_PROGRESS，不是正式P4通過。基準93a5dbd＋本批工具，執行者Codex；真人reviewer待指派。

| 條件 | 實際證據 |
|---|---|
| 75能力逐項教學／primary練習／check／五題族 | src/content/coverage.ts，實際12候選完整、63缺口；報告docs/content/curriculum-coverage.json |
| 次要標籤不能冒充主測量 | coverage.test.ts測試G60只有次要標籤，仍缺practice/check |
| 重排／標點微改不能灌family | 對prompt、選項、來源正規化，保留item IDs，重複check不增加eligible families；語意不同仍需真人證明 |
| 練習題洩漏、跨unit family洩漏、衝突正解 | coverage.test.ts明確拒絕，受污染候選不計獨立覆蓋 |
| 逐項審核hash／身份／日期／版本 | review-audit.test.ts；U01 canonical格式實際149筆全部hash吻合、無stale；四課554筆均缺真實核准 |
| draft與release分離 | draft盤點exit0、缺口明列；release預期exit1，逐項列未審項ID與缺skill／unit，不稱草稿已通過正式gate |

人工語意獨立性、內容正確性與真實reviewer身份，不能由上述程式測試代替。此批只改驗證工具／報告，不改播放器或學習數值，UI沿用93a5dbd證據。最終命令結果追加下方。

最終15測試／4檔PASS（2.96s），typecheck／lint PASS。真實draft inventory exit0，75節點12候選完整／63缺口、554簽核0有效，U01原149筆hash全吻合；`--write`不變更任何既有ledger。正式release實際exit1，逐項內容審核、圖片與世界語音核准、缺skill與U05～24均被拒絕；摘要與報告hash在evidence/release-rejection.json。完整輸出留本機/tmp/j101-p4-release-final.json，可由同命令再生。

隔離CLI測試以副本製造矛盾簽核：exit1且ledger逐字保持；過期hash核准重置NOT_RUN／reviewer與日期清空；原工作樹ledger前後一致。機械重複正規化保留小數點等有意義標點，只忽略空白與尾端句號／問號／驚嘆號，避免把1.5誤認成15。未執行新UI測試，因本批不改runtime或畫面；沿用93a5dbd產品證據。

## U05與領獎導覽回歸（2026-10-30）

基準ecb6c257443d2677736d549cce17a33730c36a07＋本批U05與JourneyScreen修正；測試由Codex執行。Preview `http://127.0.0.1:4248`，dist/index.html SHA256 `1172949c14a6b2e605868b2dd3f855277697ba21ec10e469cf9ae8a4f188910f`。瀏覽器Chromium145.0.7632.6、Firefox146.0.1；桌面模擬，不是實體平板。後續同提交只有文件補記／尚未runtime引用的P5工具，U05與導航產品碼保持測試版本。

- 257單元／33檔PASS（24.04s），typecheck、lint、素材驗證、Preview build PASS。7實際pack含2假名＋5課；18圖片、78課程＋4世界音訊。離線清單524項，PWA544entries約29.9MiB；index與registry有>500kB建置提示，P4-04仍需全課效能處理，沒有掩蓋warning。
- U05：25新詞、5漢字、3文法、4閱讀、6聽力、50練習＋15check、16真WAV。五課盤點125詞250練習；75能力15有候選、60缺口；689課程／素材審核0有效。135筆U05人審NOT_RUN。
- Chromium5測試PASS（1.5m），Firefox7測試PASS（2.5m）；後者額外重測U02及U04四類作答／家長報告。步驟：真UI完成10教學，隔離queue各選詞彙／文法／閱讀／聽力一題，實際作答→刷新解說→領獎→PIN→按單元報告／匯出。保留四筆實際Attempt，舊單元不混入。
- 六段聽力逐一真播放，審閱工具不產生學習Attempt；下載離線教材後停止來源伺服器並斷網，關頁再冷啟可讀教學、播放音訊、顯示新插畫。
- 320／390／768／1024／1440無水平溢出；Codex實際檢視320與768題目及768插畫提示（含最終Firefox圖），各格人數明確、提示／選項可操作。檔案evidence/u05-context-*.png與u05-people-count-hint-768.png。人工視覺、兒童、實機仍NOT_RUN。

CI40937397439：Build、Chromium成功；Firefox59/60，U02領獎後進家長區逾時。以保持coinLedger真實交易再釋放，修正前穩定重現：先到#/parent，交易完成又回#/preview/adventure?unit=U02。JourneyScreen以React Router location.key與卸載保護舊go回呼，保存成功不覆蓋新的路由。修正後兩引擎延遲交易測試均PASS，只有一筆reward與四筆Attempt。沒有延長timeout／刪斷言／重試洗掉失敗。第一個注入嘗試包裝IDBDatabase.transaction未觸發（Dexie已快取），已改成實際coinLedger.add注入；記錄保留此失敗。

完整trace/report：test-results/p4-navigation-before（修正前真正重現），test-results/p4-u05-chromium、test-results/p4-u05-firefox；對應playwright-report目錄。以上本機大檔ignored，選定圖片與重現測試已入repo。WebKit由隔離CI執行，本批結果以實際新run為準，不把舊WebKit未完成當PASS。

U06作者稿批次：基準ec8419a＋本批。python3 scripts/author-u06-base.py實際PASS：25詞與5漢字各自唯一，與U01～05無首次引入重複，10教學／4閱讀／6聽力稿及G16～18吻合manifest。僅作者來源，50題與15check、16音檔、插畫、runtime操作全部NOT_RUN／NOT_PRODUCED，不影響既有可玩pack；不宣稱U06-M/T或P4 DONE。證據docs/content/U06及腳本。


## U06 飲食完整工程草稿

基準5476ccf＋本批，作者／工程操作／畫面檢視Codex；非原作者日語／音訊／真人視覺reviewer待指派。實際50practice＋15check，25新詞5漢字G16～18、10教學、4閱讀6聽力。16真WAV合計3759840 bytes，逐檔腳本／檔hash與PCM在音訊manifest；原創四格食堂插畫381886 bytes，已檢視完整原圖和768裁切畫面，水／牛奶清楚可分，麵包／湯無主物歧義。來源scripts/author-u06.py、docs/content/U06；135人審NOT_RUN。

- 六課curriculumErrors PASS；14題型配額吻合；共用聽力維持同family，G16～18各五check候選，不代表語意獨立人工核准。
- 初輪context image缺必填cell被契約拒絕；改成四題各裁切一格，聽四請求選對應順序，alt不寫正確順序。沒有放寬schema或玩家驗證。
- inventory／journey PASS：8個真pack、19圖片、94教材＋4世界音訊；150詞300practice，75能力18候選完整／57缺口，824筆內容人審0有效。沒有假裝U07～24存在。
- 292單元／38檔PASS（37.56s）、typecheck／lint／Preview build PASS。offline543資產，PWA565entries約34MiB；registry634k與index620k的大chunk警告仍須P4-04處理。
- Chromium145.0.7632.6四操作PASS（1.8m）：真實教學、詞彙／文法／閱讀／聽力四次作答、feedback refresh、正確U06家長報告／匯出；六音檔實際播放且無Attempt；停止origin後冷啟教學／圖／音訊；圖像聽力提示保存hintUsed與audioPlayCount。
- 320／390／768／1024／1440無水平頁溢出，截圖evidence/u06-context-*.png，另u06-cafeteria-request-hint-768.png；實際檢視320文字換行與768圖片／提示／選項，未以產圖成功代替檢視。測試來源e2e/p4-u06.spec.ts，trace/report在test-results/p4-u06、playwright-report/p4-u06。

Firefox操作重驗進行中，最後結果待追加；真人審聽／視覺、實體平板仍NOT_RUN，U06-V BLOCKED、作者／素材IN_REVIEW、I IN_PROGRESS。測試build宣告5476ccf＋未提交修改，提交後若只有紀錄變動不影響已驗產品。

另外讀取ec8419a CI40987944460：build／Chromium成功；Firefox69PASS1FAIL1SKIP、WebKit69PASS1FAIL1SKIP，同一backup320px量到326px。實際讀取CI失敗截圖／DOM，待定位修正，沒有冒稱三引擎全綠。GitHub連接器拒絕1.1GiB artifact，改用有授權的GitHub下載redirect及HTTP Range，只取ZIP目錄和兩個失敗證據檔，未下載整包或輸出憑證。

U06最終Firefox146.0.1四項PASS（2.2m），來源同Chromium，trace/report在test-results/p4-u06-firefox、playwright-report/p4-u06-firefox；最終768圖像截圖已再檢視。dist/index.html SHA256 `69e2252d7d42de0b940562880a72289792fd72d3c5ea4a3b93c1c166556a7cec`。驗證後僅補紀錄與base來源防覆寫，產品未變更。七天圖表已另加回歸測試，修正前Firefox真實重現382px溢出，屬下一獨立修正批次。


## P4-04 課程與路由載入拆分

基準0d440ebb8c14328c59338c96c03f4f59583d6230＋本批。src/content/packs/catalog.json僅真實id／title／version，固定loader每課非同步import、共享成功請求、失敗移除promise、核對實際內容版本；catalog工具與CI／單元核對真registry。選課／家長備份不再同步帶入所有題庫，家長報告才載入實際全課，審閱只載所選課；舊遊戲與家長／玩家畫面按route載入。移除冒險子元件隱性U01 default，必須傳明確pack。

初build拆課後index仍620k，進一步拆舊route後index439123 bytes（原620k），每課100～110k，634k registry同步包消失。scripts/check-build-budget.mjs對真JS檔做500000bytes硬性postbuild檢查，結果dist/build-budget.json；沒有提高Vite warning限額。Chromium乾淨U06道館實際14個JS、722211bytes，900000bytes預算內，只請求u06題庫而未請求U01～05；原始數據evidence/u06-runtime-script-budget.json。完整離線素材543個33865276bytes（32.3MiB），PWA597entries約34MiB；JS拆分不是刪除離線教材。

294單元／39檔PASS（30.23s），後補真實延遲hook競態＋loader一致性三測試PASS（2.13s）；型別／lint／Preview build通過。兩引擎三情境共六測試PASS（17.5s）：單課載入、503後明確重開恢復且不寫Attempt、等待U06時切到U02不顯示／保存舊課。來源e2e/p4-pack-loading.spec.ts，trace/report：test-results/p4-loading、playwright-report/p4-loading。錯誤提供使用者重開，避免瀏覽器ES module失敗快取導致原地retry永久失敗；沒有自動重載。

完整Chromium79項回歸進行中。發現原20次進出測試在lazy畫面出現前就檢查可選setup，結果漏點模式而等不到canvas；不是把zero timers斷言放寬。首修只等setup heading，但第二次是已恢復canvas，因而失敗；已改等實際setup或canvas後再操作，原20次進出、RAF歸零、timer歸零、零mic呼叫全保留。修正後Chromium／Firefox兩項PASS（30.6s），證據test-results/p4-lifecycle-final、playwright-report/p4-lifecycle-final。完整回歸原輪這一失敗需與針對重驗分開記，不宣稱原輪全綠。

預算規範docs/design/PERFORMANCE_BUDGET.md。build宣告0d440eb＋本批，dist/index.html SHA256 `d2a5927d6bd0dcda09dd3b0bb04d09c1fa8af8df98111b35296cc7ecef86b621`。其他引擎全套／實體平板／全部24課仍未完成，P4-04 IN_PROGRESS。

P4-04完整Chromium回歸最終78PASS／1FAIL（23.1m），唯一失敗為上述未等待lazy setup的舊測試；針對修正後該case兩引擎各20次PASS，原輪其餘78項不受測試等待修改影響，涵蓋L0～10三種mic狀態、離線、冒險、所有六課、全備份、升級與SW等待。未把原輪寫成79/79。最終typecheck／lint PASS；code產品與已測build不變。CI0d440 build／Chromium成功，Firefox另發現U02報告匯出無download；已下載真trace確認點擊後尚有約44秒等待，不是時間不足，另開P5-04-R2並以延後anchor dispatch100ms在修正前重現無下載。


## U07 購物數量與實際圖格顯示

基準98bb24d9ea041c6d8dd1a8545dfb75ab82de89a7＋本批。Codex作者／工程驗證／畫面檢視；非原作者日語／音訊／真人視覺reviewer待指派。實際25新詞、5新漢字（一二三四五）、G19～21、10教學、4閱讀、6聽力、50practice＋15check候選、16真WAV4035808bytes、原創蘋果圖426556bytes。175詞350practice；9真pack、20圖片、110教材＋4世界音訊；75能力21候選完整54缺口、959筆人審0有效。作者稿／素材IN_REVIEW、V BLOCKED、I IN_PROGRESS。

- 初輪七課契約／去重／題型／來源引用PASS；296單元／40檔PASS（29.96s）、型別lintbuild與500k budget PASS。
- 初輪Chromium／Firefox各七項共14PASS（4.0m）：U07四主線真實作答與feedback refresh、正確U07家長報告與匯出、六真聽力播放、停止origin後冷啟教學／圖／音訊、hintUsed保存；另分課單課JS／503重開／遲到U06不覆寫U02。證據test-results/p4-u07、playwright-report/p4-u07。
- 五寬度320／390／768／1024／1440無水平頁溢出，evidence/u07-context-*.png；實際檢視320與768提示畫面後發現圖格切半多露出下一列背景，未以測試通過掩蓋。
- 像素讀取定位原圖水平白隙y575～598，採分界587；資產frameWindows上h587，下y587/h667。原PNG與WebP沒有編輯；共用ContextImage改依既有裁切框顯示，均勻舊圖仍200%。art.ts僅引入小型圖格資料，不拖入全部音訊腳本。首次lint拒絕同TSX同時匯出helper，已拆至imageFrame.ts，不停用規則。
- 補後297單元／41檔PASS（30.51s）、型別lintjourney/build/500k PASS。兩引擎重驗圖格、帶圖對戰、離線與載入預算共10PASS（2.8m），來源e2e/p4-u07.spec.ts與p4-pack-loading.spec.ts，trace/report：test-results/p4-u07-frames、playwright-report/p4-u07-frames。
- 四格實際單獨截圖evidence/u07-frame-{0..3}-{chromium,firefox}.png，Codex已逐格檢視Firefox四張：1／2／3／4顆完整蘋果、無鄰格滲入或額外果實，畫面清楚。不是替代真人視覺／適齡簽核。
- 新版U06首次JS727670bytes／900000內，仍只載所選題庫；最大JS439136bytes／500000內。offline562素材38339332bytes，PWA617entries約38MiB。dist/index.html SHA256 `106854d936595e261703435525312f629df9036e0d499b60a86fd5792205be34`；version.json宣告98bb24d＋本批。

舊U04均勻圖格相容重驗進行中，最後結果待追加。WebKit／實機／人工審聽／真視覺仍NOT_RUN或待CI，不標P4完成。另核對先修時發現U01 G02/G03與U06 G16的local grammar prerequisites與P0能力圖不同，U01 teach-G03也少了G02；這是後續P4-03-R1，尚未修正，不把本次機械coverage說成全規格通過。

U07圖格最終相容：舊U04帶圖提示作答Chromium／Firefox兩項PASS（39.2s），test-results/p4-context-compat、playwright-report/p4-context-compat；原畫面與均勻格語意保留。驗證後僅補紀錄，未改產品。

## P4-03-R1：先修漂移與真舊存檔升級（2026-10-30）

工程owner／執行者Codex；baseline d35221c850d92c3b41a1010d2fadba3617e24ec6＋本批來源，測試來源hash與dist index在evidence/prerequisite-upgrade.json，交付後只有紀錄／舊ledger封存差異。P4及真人內容gate仍未完成。

- 新測試先重現四個失敗：U01 G02少K-HIRA、G03少K-HIRA且依錯G01、teach-G03跳過G02；U06 G16依G08而非已核G15。現版u01-3-draft／u06-2-draft對齊既有P0圖，未改P0標準；新增CLI全課比對與教學DAG可達檢查，禁止改名／缺先修／未知能力／局部教學捷徑。transitive真教學鏈允許。
- 原ledger以review-ledger.u01-2-draft.json／review-ledger.u06-1-draft.json原文封存；U01 canonical hash及版本更新、U06現有hash機制重算。959項仍0真人核准，不把舊版結果當新版核准。題目itemVersion與音訊腳本／位元組不變。
- d35221c實際UI各保存四次作答、首勝60、花40購買並裝備旅行帽、開始未完戰鬥，再經PIN完整匯出；兩份匿名QA檔evidence/prerequisite-{u01,u06}-old.json附原build。新瀏覽器只在隔離context注入這些真操作結果，再走實際升版UI；不碰真實玩家。
- Chromium145.0.7632.6／Firefox146.0.1各三項，共6PASS（31.3s）。原始Attempt、wallet20、inventory／equipment／purchase／coinLedger／firstWins／skillReviews逐字相等；舊完結勝利不變；未完戰鬥與教學plan原文歸檔，舊戰鬥標version-recovery撤退，plan改新內容版本；刷新不重複歸檔。G03在G02前按鈕disabled，完成G02才可保存，教學不偽造Attempt。
- 302單元／42檔PASS（31.01s），lint／typecheck／preview build／draft inventory與catalog通過，最大chunk439136/500000。局部教學修訂不改畫面樣式，未新增人工視覺核准；不是實體平板證據。trace／報告見evidence JSON本機位置，重現命令下方。
- 失敗紀錄：預設sandbox spawnSync回EPERM，限定提權執行CLI及完整單元後PASS；第一輪建置漏VITE_P2_REVIEW_PREVIEW而無preview路由，已停止該無效測試、正確重建並清理此輪殘留4264 server；不把無效輪報PASS。沒有改timeout或刪斷言。

重現：Node22；`VITE_P2_REVIEW_PREVIEW=1 npm run build`，`P0_E2E_PORT=4264 npx playwright test e2e/p4-prerequisites.spec.ts --project=chromium --project=firefox`。舊fixture只能從d35221c相符build重建；capture腳本拒絕覆寫，不在新版重跑。

## U08及P4-04-R1：交通教材、真離線就緒（2026-10-30）

baseline662be67e8cee41e1ce5b06fdaa6518588b34e2cf＋本批來源，owner／測試Codex。最終source／dist hash、逐case與批次log在evidence/u08-engineering.json；後續提交僅記錄／未註冊U09來源，不改已測runtime。Chromium145.0.7632.6、Firefox146.0.1，桌面模擬，不是實體平板。preview flag VITE_P2_REVIEW_PREVIEW=1。

- U08完整25新詞、5新漢字行来車入出、G22～24、10教學、4閱讀、6聽力、50practice＋15check。16真WAV3740384 bytes，腳本／hash／來源完整；原創四車圖經image_gen修成完整單節電車，最終transport-v2.webp513466 bytes。教學／題幹用でんしゃ，避免把未教電字加到方法測量；中文解說仍可寫電車。へ／に目的地皆合法，不把另一個當錯項。
- 已接registry／loader／catalog／media／art／introductions／labels，10pack含兩假名＋八課：200詞40字24文法32閱讀48聽力400practice。75能力24有候選、51缺口；1094教材／素材審核0有效，U08共135NOT_RUN。U08-M/T/Q1/Q2/A IN_REVIEW，V BLOCKED缺真人，I IN_PROGRESS，不是正式task DONE。
- 308單元／43檔PASS（43.54s）、typecheck／lint／素材／catalog／preview build通過。離線581資產42604828 bytes；PWA637entries43558.63KiB。最大chunk439788/500000，U06初次JS729454/900000，沒有擴大預算。
- 最終21個不同browser/case通過，分批累積：Chromium11、Firefox10。兩引擎各完成四主線真Attempt→刷新解說→領獎→PIN→按單元報告／真JSON匯出、六段真音訊播放且審閱不寫Attempt、插畫提示作答留下hintUsed、四格裁切、G23假名題實際作答、下載後停止來源／斷網／關頁冷啟教學與音訊／圖片，以及三項按需載入回歸。兩引擎各另驗延後真ready承諾仍下載成功。Chromium額外重驗P5 waiting／失敗更新保留未交答案、所有舊client關閉才啟用。Firefox／WebKit的更新lifecycle harness仍未執行，不偽稱全引擎通過。
- 320／390／768／1024／1440題目無橫向溢出；Codex已實際檢視320題目、768提示、Chrome／FF共8張車輛裁圖，以及兩引擎768離線準備狀態。車輛與輪子完整、沒有鄰格、圖文與按鈕可讀；證據evidence/u08-*.png及offline-preparing-*-768.png。真人視覺與實機NOT_RUN。

P4-04-R1故障與證據：首輪16項15PASS／1FF離線失敗，trace只有28請求且最後是offline-manifest，尚無手動素材下載，UI已顯示error。產品先等SW.ready固定8秒，完整42.6MB precache可能仍在合法安裝；用延後真ready結果10秒（不偽造ready或媒體）在舊build穩定重現FAIL。現以實際註冊／worker狀態等待，真正初裝失敗可回報、下次明確重試可重註冊，已有active worker的更新失敗不撤掉離線能力；畫面顯示準備狀態，關閉／離頁可取消。五項單元覆蓋慢就緒、abort、真register拒絕、舊active更新失敗、明確retry。修後FF延後ready及停止來源冷啟2PASS（1.8m），Chrome同類通過；未改60秒完成斷言、未虛構下載完成。

其他失敗如實保留：原創首圖電車後端被裁，已生成v2並實際看8格；初manifest少frameWindows被validator拒絕，補真格窗後PASS。修後22項大批次完成6項即收到SIGTERM，原因未確認，沒有當成完整全綠；確認runner已終止，清理自己殘留preview後分批接續。另新測試錯把中文「搭電車」當日文題幹，調整為精確檢查引號內「でんしゃ（」，不是刪除日文要求；兩引擎G23真作答2PASS（19.1s）。各失敗與成功log／trace索引見JSON。

恢復：Node22；`VITE_P2_REVIEW_PREVIEW=1 npm run build`。`P0_E2E_PORT=4268 npx playwright test e2e/p4-u08.spec.ts e2e/p4-offline-readiness.spec.ts e2e/p4-pack-loading.spec.ts --project=chromium --project=firefox`；P5更新另跑`e2e/p5-update.spec.ts --project=chromium`。較大trace不入git，保存/tmp/japanese101-recovery/p4-u08-*並有hash／case索引；截圖與資料證據已納入提交。
