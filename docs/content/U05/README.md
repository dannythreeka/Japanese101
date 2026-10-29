# U05 家庭：可操作草稿

DRAFT，非原作者日語審核NOT_RUN。`/#/preview/adventure?unit=U05&scene=dojo`；逐題審閱`/#/__review/content?unit=U05`。25新詞、5新漢字（父母兄姉子）、G13～15、10教學卡、4閱讀、6聽力、50練習與15延後檢核候選；14類練習配額與manifest一致。首五課125唯一詞、25漢字、15文法、20閱讀、30聽力、250練習。

先教自己的家人與對他人的稱呼，再介紹と並列、ひとり／ふたり／よにん特殊讀音、人物が＋人數＋います及いません。所有故事人物為虛構，孩子不必提供家人資料。家庭組成不預設為單一形式；不把未提到的家人當作不存在，也不從插畫年齡或衣著推測親屬。

`scripts/author-u05.py`逐題作者稿，16真WAV見`public/assets/audio/u05/manifest.json`，含腳本與檔案hash、PCM、來源及授權條款。四格原創人數插畫467,082 bytes，依序1／2／3／4人；生成提示與工程目視紀錄見art-prompt.md。AI生成與工程目視不代替真人審聽／教學審查。

15候選check：並列／所有關係差異、句序、遺漏成員比對、合併存在句、並列可推論範圍；一人與四人讀音、排除非人類、詢問人數、把說話者納入計數；人數位置、否定回應、介紹句序、存在與身分差異、年長年幼對照。題族名稱不是語意獨立性證明，必須真人審核。聽力共用稿的題目維持同family；48h／跨兩天／五題族4/5無提示門檻不變。

`review-ledger.json`135筆NOT_RUN。人審重點：對內外稱呼情境是否自然、年長年幼說明適齡、一人／二人／四人發音、祖父母與親戚詞義、聽力輔助語與閱讀長度、圖片數量唯一性。U05-V受缺真實日語reviewer阻擋；其餘作者稿IN_REVIEW、整合IN_PROGRESS，不代表正式教材放行。

恢復命令：Node22；`python3 scripts/author-u05.py`、`npm run gen:voice:unit -- U05`、`node --import tsx scripts/unit-inventory.ts --write`。語音與稿吻合才重用；禁止覆寫APPROVED教材。瀏覽器驗證結果見docs/phases/P4/acceptance.md。
