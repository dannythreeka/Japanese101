# P4 進度

2026-10-30，IN_PROGRESS。工程owner：Codex；實際內容／音訊審核者待指派。依project.md完整體驗授權提前推進草稿與工具，P3人工gate未變。

基準93a5dbda648fa8bc6637cdade3a5a1647e3d997c已push draft PR58，首四課工程已交付；P4-02目前實作內容覆蓋與hash審核工具。P4-01正式內容排程與兒童試用回饋仍未核准，P4其他人工gate未PASS。

發現：75個blueprint能力中12文法有五題族候選，63缺口＝15共通技能＋48未製作文法；沒有機械完全重複題被拆成多family。四課149＋135×3＝554筆內容／素材審核全部NOT_RUN，另有假名獨立359筆，不混入這個554數字。

新增必要task P4-GAP-01，列明15技能與驗收；P4 task總數145→146，prompt及README同步。後續正式放行還需原定配額與人審，沒有減少內容或放寬五題族規則。

工具保留U01原有canonical sorted JSON hash與PASS/version格式，不覆寫舊ledger；新單元用現行hash／APPROVED。過期hash、缺reviewer、日期無效、作者自審、重複簽核均不能過release；--write遇重複記錄保留原檔，不挑一筆批准洗掉矛盾。

新增隔離CLI實測：複製U02到臨時目錄，製造矛盾簽核後--write確實exit1且原ledger逐字不變；過期核准hash會重置NOT_RUN／清除reviewer與日期；正式工作樹ledger不變。首輪14項相關測試、型別與lint通過。後續補上小數標點不被當成同題的測試，最終結果見acceptance。

U05草稿與16音訊／人數插畫已整合，135人審NOT_RUN；目前五課，能力候選15／75，缺60，689審核0有效。U05-M／T／Q1／Q2／A IN_REVIEW，V BLOCKED缺真人，I IN_PROGRESS。P2-09-R2修正CI發現的領獎後覆蓋家長區導覽：真交易延遲重現前FAIL、修正後Chromium與FirefoxPASS；詳acceptance。257單元與兩引擎新課回歸通過，未改經濟或掌握門檻。

2026-10-30 U06開始：scripts/author-u06-base.py與docs/content/U06/source-draft.json交付25不重複新詞、5新漢字、G16～18、10教學、4閱讀、6聽力文字。production-plan固定14題型與素材預定題ID；尚無真題／音訊／插畫，不加入registry、不改runtime完整內容數。U06-M／T IN_PROGRESS，其他未開始，人工NOT_RUN。下一步接續作者稿產生50真題＋15獨立check，再真WAV與插畫／整合。既有工程ec8419a已push，完整目標未完成。

U06完整工程接續：50真練習＋15check、16真WAV、原創水／麵包／湯／牛奶圖已整合可玩preview。六課150詞300practice，18能力候選完整57缺口、824人審0核准。292單元及型別lintbuild、Chromium四項1.8m PASS；Firefox最終見acceptance。U06-M/T/Q1/Q2/A IN_REVIEW、V BLOCKED、I IN_PROGRESS。不要重跑base覆蓋來源，請用author-u06.py。另ec8419 CI發現備份320px在FF/WK溢出6px，正在讀真CI證據定位；先修後再承接U07與共通15skill／真MA/B/C／mockUI。goal ACTIVE。

P4-04提前工程：課程metadata＋各課lazy import、明確pack、不再隱性載U01；舊route也lazy。index439123bytes、U06首次JS722211bytes、單chunk500000硬性build guard。catalog需新增課後執行pack-catalog.ts --write及validate:packs，CI會核對。兩引擎載入／503重開／延遲切換六項PASS，294單元＋三相關PASS。完整Chromium79項跑在session4992、port4258，原第7項生命週期setup等待失敗，已修等待實際setup或已恢復canvas，針對兩引擎各20次資源歸零PASS；原全套最後結果待取。U07作者稿／65題與真音訊／蘋果圖正獨立製作，未註冊，不要在session4992結束前改runtime或重建dist。工程與U07分批提交。

載入優化最終：完整Chromium78PASS／1舊setup等待競態FAIL（23.1m），該case修正後兩引擎20次進出／零RAF／零timers PASS；其他78項產品驗證有效。新載入六項與294單元＋三相關、型別lint及439k build通過。下一步先修Firefox下載：CI trace點擊後還有44s但無download，延後anchor dispatch100ms已在現版重現；JourneyReport與LegacyBackup立即revokeObjectURL，FullBackup已延後，需統一可靠下載helper並真實驗證。U07已65題＋16WAV＋蘋果圖完成素材，尚未registry／loader／catalog／media註冊；要整合後再跑操作。session4992已終止，不重跑79整套，除非後續實質改動需再擴驗。

U07整合：50真練習＋15候選、16WAV、蘋果圖已接9pack，七課175詞350practice、21候選54缺口、959人審0核准。初輪兩引擎14PASS；目視發現不均勻圖格，改DOM依manifest.frameWindows（非編輯位圖），297單元及型別lintbuild／500k guard通過，兩引擎補10PASS，四格FF實圖已逐張檢視。舊U04相容測試session46024結果待取。U08作者來源已25詞5漢字10教學4閱讀6聽力稿，未出題／音訊／圖／註冊。接續P4-03-R1：local prerequisites U01G02/G03、U06G16與已核能力圖不一致，U01教學G03也少G02；需保留舊稿／review、採新draft版本與來源hash，不能悄改已發布版本。先保存U07，再修此缺口與新增防回歸檢查。

2026-10-30 P4-03-R1工程完成：U01升u01-3-draft、U06升u06-2-draft，依既有P0先修圖修四處漂移，舊ledger原文封存，新增全課grammar／教學鏈檢查。d35221c真UI舊存檔已兩引擎6PASS，保留四筆Attempt、20coin、帽裝備與交易，歸檔舊plan／未完戰鬥後安全重開；302單元PASS。trace／hash／命令見acceptance與evidence/prerequisite-upgrade.json。勿重跑capture覆寫舊fixture；不更動已完成工程或真人狀態。下一步U08完整65題／16WAV／原創交通插畫／註冊，再續U09～24／共通15skill／真模擬考及UI。P4-03主task仍TODO，959審核0真人核准，goal ACTIVE。
