# U08 交通與目的地：可操作草稿

2026-10-30，u08-2-draft，作者Codex；真人reviewer待指派，非原作者日語／音訊／適齡審核NOT_RUN。入口`/#/preview/adventure?unit=U08&scene=dojo`；逐題審閱`/#/__review/content?unit=U08`。25首次引入詞、5新漢字（行来車入出）、G22～24、10教學、4閱讀、6聽力、50練習＋15延後檢核候選。數量、全課去重及操作結果以P4 acceptance為準，不以這份說明取代驗收。

`author-u08.py`是完整作者稿，base只定義來源，不能覆蓋已有完整題庫。source-draft.json同步可玩資料；production-plan逐題連結4閱讀／6聽力與五候選題族／文法。題型配額14類依n5-manifest，50練習與15check分開計數。G22先修G21、G23依G22、G24依G23，另均依K-HIRA；教學鏈由kanji到G22／23／24再到情境卡。

目的地「へ行きます」與「に行きます」都可，へ作助詞讀え；不可把另一個合法助詞當錯項。交通方法用交通工具で，同行者用人と；「あるいて行きます」「ひとりで行きます」以固定搭配教學，不把步行加で，也不把獨自等同步行。行／来依說話者位置區分，入口／出口依標示讀，不憑門在左右猜用途。

所有人物與目的地均為虛構，不記錄孩子住址、實際路線或定位，不新增可探索城鎮或真實交通功能。G22題族候選分別核對兩種合法目的地助詞、へ讀音、來去的參照、行程不等於已抵達、否定目的地的範圍。G23核對工具與同行助詞、同地不同方法、方法不等於位置、未知方法、兩段路線綁定。G24核對人／工具欄位、未知其他同行者、問句相關性、獨自與方法分離、多人物行程配對。這些只是作者候選，仍需真人確認測量與語意獨立性，不降低48h、跨兩日、五題族4/5首次無提示門檻。

16真WAV含6聽力與10教學，共3740384 bytes，來源、腳本／檔案hash、PCM參數及授權見public/assets/audio/u08/manifest.json；合成不等於真人審聽。原創交通圖見art-prompt.md及圖片manifest；T13每次裁一格，比對四段方法說法，同一音訊的題目共用family。alt只描述車種，不說答案序號。

真人審核重點：へ／に與来ます視角是否自然、のる／おりる只作已教詞彙、不把未教句法帶進題目、長聽力人物配對負荷、圖中電車與公車的區別、音訊助詞讀音／截斷／速度，以及五check題族是否真能測量所標文法。review-ledger全項NOT_RUN；人工視覺、兒童與實體平板證據也不可由自動測試替代。

恢復：Node22，`python3 scripts/author-u08.py`、`npm run gen:voice:unit -- U08`、`node --import tsx scripts/pack-catalog.ts --write`、`node --import tsx scripts/unit-inventory.ts --write`。不要重跑base覆蓋65題來源；已有音檔只在腳本／檔案hash吻合時重用，不覆寫APPROVED稿。

2026-10-30雙語修訂：u08_localization.py完整撰寫65組日文題幹／解析與10段教學／例句說明；Q47日文也明示「あねと」，不再遺失姊姊情境。257選項以lang逐項聲明145日文／112繁中，畫面、排序與作答回饋都使用聲明語言，不按字形或介面猜測。舊版review-ledger原文封存review-ledger.u08-1-draft.json；135項仍NOT_RUN。

pack升u08-2-draft，65題item revision升2；原始中文、答案ID／選項文字／family／難度／材料與16WAV逐項不變，不重製成功音檔。舊Attempt保留原版本，舊教學／未完戰鬥先歸檔再重開，金幣／持有物／裝備／receipt不變。真48167bd舊存檔與新版本驗證見P4 acceptance。這是U08修復，其他課的雙語與語言標記仍由P4-03-R2追蹤，不能當成全課完成。

修訂後語言資料原則見ENGINEERING_RULES.md；draft允許舊資料未填lang以相容舊稿，release會拒絕未明示語言的題目。lang有效不代表自然度或語意核准，仍需要真實reviewer。
