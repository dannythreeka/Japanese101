# U06 飲食：可操作草稿

DRAFT，非原作者日語／音訊／適齡審核NOT_RUN。作者Codex，reviewer待指派。`/#/preview/adventure?unit=U06&scene=dojo`；逐題審閱`/#/__review/content?unit=U06`。25新詞、5新漢字（食飲水魚肉）、G16～18、10教學卡、4閱讀、6聽力、50練習與15延後檢核候選。與前五課新詞／漢字去重通過；全六課150詞、30漢字、18文法、24閱讀、36聽力、300練習。

題型14類配額符合manifest。`scripts/author-u06.py`實際作者稿；`source-draft.json`同步可玩內容供review，`production-plan.json`保留材料與預定ID，並記實際65題／16音檔。base腳本只定義教學／素材，不可用來覆蓋已有完整題庫；恢復請用full作者稿。

主題小鎮食堂，區分吃喝的對象（を）、個人喜好（が好き／嫌い）與請求物品（をください）。不要求孩子透露過敏、宗教或家庭飲食；不把不吃視為討厭、不把請求視為收到或吃完、不從未提資訊猜喜好。漢字以食べます／飲みます的送り仮名示範，字與整詞讀音分開。

16真WAV含6聽力與10教學，腳本／hash／PCM／授權見public/assets/audio/u06/manifest.json。原創水、麵包、湯、牛奶插畫381886 bytes，提示與工程目視見art-prompt.md。T13裁切一格，聽四個請求後選相符順序；alt只描述物品，不揭露音訊的順序。共用聽力維持同family。

G16候選：修正對象助詞、辨識被吃的對象、動作否定意義、飲食動詞切換、回答喝什麼。G17：限制推論、喜好歸屬、喜好與請求差別、否定喜好的資訊範圍、修正助詞。G18：請求與收到差別、向店員提出需求、修正請求助詞、依供應請求、辨認請求物品。五種family只是候選，仍需真人審核語意獨立性；48h／跨日／4/5無提示門檻不變。

review-ledger.json的135筆保留NOT_RUN。人審重點：漢字讀音與兒童可理解性、好き／嫌い情境自然度、請求與動作的唯一解、四序聽力不看稿辨識、音訊是否截斷或太快、菜單的明示資訊、圖片水與牛奶區別。工程驗證結果見docs/phases/P4/acceptance.md，不代表正式教材放行。

恢復：Node22，`python3 scripts/author-u06.py`、`npm run gen:voice:unit -- U06`、`node --import tsx scripts/unit-inventory.ts --write`。音檔只在稿／檔hash吻合時重用，禁止覆寫APPROVED內容。
