# P3 進度

2026-10-30，狀態 IN_PROGRESS。依使用者完整體驗目標提前推進工程；P2人工gate沒有補成PASS。

- 工程owner：本session Codex。真人教材／兒童／平板reviewer仍待指派。
- 基準327ec61；多單元基礎40269c2；分支phase/full-experience。
- P3-02工程前置：獨立unitId的戰鬥／檢核／恢復，複用教學與戰鬥播放器；225單元與24項P2 Chromium回歸通過。
- P3-01部分實作：兩份實際46字教學包、各46道聽音練習，沿用46個本機WAV；不同script有獨立skill／study／battle。道館選課、重整續學與未知單元恢復完成。內容全部DRAFT；不算U01～U24的1200題配額。
- P3-01未完成：獨立跳級檢核、題族／延後能力設計、真人逐字與音訊確認。不能把練習題換ID當獨立檢核；初稿被現有bank檢查抓到跨partition同題族，已移除重複檢核，保留真實缺口。を／お不互為聽音干擾項。
- 尚未實作U02～U24／A～C完整內容、正式mock與全庫備份還原。不得用本次先修功能宣稱完整體驗已完成。

工程視覺檢查發現46按鈕將教學卡推到長頁下方，已改用64px原生選字select並保留前後操作；U01原9卡導航不變。手帳到期數限目前教材的skill，避免別單元待複習卻無可作答題。

## 2026-10-30：獨立先修檢核交付

- P3-01工程新增：每個script另有46道詞語音訊位置辨識題，分10組每組最多5題；未教可先檢核，暫停／重整保留實際作答。整組完成才依合法、無提示、首次正確且播放過音訊的Attempt給先修資格。練習可略過該字教學，不寫入假taughtAt，不宣稱stable mastery。
- 同詞不同位置共享題族；與單字音practice題族分離。「ほんをよみます」另生成真實VOICEVOX音檔，PCM檢查通過，人工審聽NOT_RUN。所有素材仍DRAFT。
- 審閱頁可切兩script、檢視92題及音訊；359筆hash綁定ledger（92教學／92練習／92檢核／83音訊）。重新生成只保留同ID同hash的原review，版本改動不挪用簽核。正式檢查確實以exit1拒絕未人審內容。
- 231單元／26檔PASS，lint、型別與preview build PASS；4項Chromium PASS（21.1s）。本機沒有安裝瀏覽器系統依賴。上一版f7a9cf2的CI40916267390三引擎全綠；本批三引擎以push後新CI為準。
- 失敗與修正：Node匯入JSON補import attribute；重整測試先等待已保存的回饋；修正測試與實際返回按鈕文字差異；原生select的label文字包含options造成getByLabel exact失配，已補明確aria-label，保留92個選項斷言及實際selectOption操作。沒有放寬斷言或宣稱未跑項目通過。
- 工程已檢視kana-placement-result.png：5/46先修通過、可練習、一般延後檢核仍鎖定。兒童畫面尚有KANA-HIRA/KATA技術ID，下一批選課整理時移除；不把工程視覺檢查當真人核准。
- P3-01主task仍TODO（P2人工gate及內容人審尚缺）；P3全體IN_PROGRESS。
