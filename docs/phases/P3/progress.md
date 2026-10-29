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

## U02、多單元報告與離線資產（2026-10-30）

- U02實際作者稿、可操作教材與原創四格插畫已製作：25詞／5漢字／3文法／4閱讀／6聽力／50practice＋15獨立check候選，10教學卡、16真實WAV；135筆人工ledger全部NOT_RUN。U02-M/T/Q1/Q2/A進IN_REVIEW，V因缺實際審核者BLOCKED，I工程IN_PROGRESS，未通過前置gate的正式整合沒有冒稱DONE。
- 修正作者稿中的學校促音說明，去掉未教的否定變化作為理解前提；同一聽力稿不同問題共享family，獨立check五family/skill仍待教學審查。
- registry只加入真實U02；世界manifest追蹤四pack（平／片假名＋U01/U02）的教學、practice、check與可達道館；漏單元或失效關聯驗證會失敗。
- P3-02實際缺陷：exportJourney過濾目前unit，導致U01家長匯出漏掉U02戰鬥與檢核。已改全玩家所有unit匯出並加回歸，仍排除另一玩家。報告改讀所有plan，G04不再誤用U01教學時間；按教材看樣本、弱項連回正確單元。兒童畫面移除KANA-HIRA/KATA技術ID。
- 通用inventory僅盤點真實教材，配額、去重、四主線、題型分配、教學先修、真WAV／插畫hash都檢查；明列U03～U24未完成。release檢查已實際exit1，不能以草稿數量宣稱完整24單元。
- 音訊首次合成遇429，加入尊重Retry-After、最多3次且≤30秒等待的有限處理與測試，完成16檔，未換假音檔。新版generator檢查音檔來源與文字稿hash才重用。
- 原PNG超過既有2MiB離線上限，轉為原尺寸WebP385,050bytes；保留原作於generated_images並記出處，不放寬上限。offline manifest改收全部素材子目錄manifest與PNG，避免新增教材資產遺漏。
- 240單元／29檔PASS、lint／typecheck／build PASS，467個離線資產；三項U02瀏覽器首次因測試誤用音訊按鈕可見文字作accessible name失敗，按實際「停止播放」名稱與兩頁實際播放文字修正。舊P2審閱測試在4f02a5c三引擎CI均因未命名combobox定位不唯一失敗；已指定「選擇題目」，未放寬斷言。完整新回歸進行中，以最後acceptance紀錄為準。
- P3-03已產九人試用材料與匿名CSV空表。沒有招募、家長同意或兒童紀錄；不能把九個名額當九位參與者。試用fixture、reviewer與人測仍待完成。

本批最後結果：31項Chromium整合全部PASS（5.0m）；最後U02文字小修後6項相關單元及三項U02Chromium再次PASS（1.2m），完整建置PASS。剩下為新提交CI與真人依賴；工程可接續U03，不重做U02已驗證流程。

## 2026-10-30 U03 工程批次

Owner：Codex；真人審核人待指派。基準3289f0（U02 CI40925952499三引擎success）。U03已完成實際65題、10卡、16音訊與原創插畫，三單元共75新詞15漢字150練習，缺U04後才到P3四單元工程配額。135人審NOT_RUN，U03-M/T/Q1/Q2/A IN_REVIEW，V BLOCKED，I IN_PROGRESS。

失敗與修復：音訊G07長稿40s排程等待超時，未刪已生成12檔；單job等待設120s截止並新增長稿及永久pending測試，剩餘4檔成功。首次手動Node檢查省略副檔名載到JSON而非TS，補.ts後配額檢查PASS，未改產品來掩蓋。

7項U02/U03 Chromium PASS（2.5m）：四主線、真音訊、重整／匯出／離線及否定錯答保存；五寬度截圖，已看320與768。release仍exit1是正確防護。準備提交／推送並接續U04，不重做U02與已驗證假名。
