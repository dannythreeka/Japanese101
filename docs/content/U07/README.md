# U07 購物數量：可操作草稿

2026-10-30，DRAFT，作者Codex；非原作者日語／音訊／適齡reviewer待指派。`/#/preview/adventure?unit=U07&scene=dojo`；逐題審閱`/#/__review/content?unit=U07`。25新詞、5新漢字（一二三四五）、G19～21、10教學、4閱讀、6聽力、50練習與15延後候選。全七課175詞、35漢字、21文法、28閱讀、42聽力、350練習。

scripts/author-u07.py為完整作者稿，source-draft.json同步供review；base腳本不覆蓋完整題庫或APPROVED來源。production-plan記實際65題、16音檔、一張原創圖與候選check family；新詞／漢字與前六課去重、14題型配額與引用檢查通過。數量／價格／總價／找零不混讀；助數詞本・枚・冊，其他讀法未經真人核對不拿來當錯誤干擾項。故事標價不是遊戲金幣匯率、不要求付款。

16真WAV共4035808bytes，來源／腳本hash／檔hash／PCM／授權見public/assets/audio/u07/manifest.json。原創四格蘋果圖426556bytes；1、2、3、4顆，音訊順序3／1／4／2，alt只描述看得到的物品，不能直接給出答案序號。四題共用聽力五同一family。生成提示、原圖hash與工程目視紀錄見art-prompt.md。

實際畫面檢視發現生成圖的上下分割不在精確50%，原本DOM固定切半會露出下一格背景。已依實際frameWindows裁切（上587px，下667px），共用ContextImage套用既有資產裁切資料，不改原始位圖。均勻舊圖格仍是200%背景。四格各自實際瀏覽器截圖核對；結果見P4 acceptance。

G19候選分別核對訂單尚缺數量、數量範圍、全部的範圍、人與物品數法、兩種訂單的數量歸屬；G20核對三種物品、一本／一冊音變、紙張修正、名詞ほん與冊的功能；G21核對提問、價格與數量、找零不等於售價、未提供價格不得推論、同總價不同數量。候選命名不是語意獨立人工批准；48h、跨日、五題族4/5無提示門檻不變。正文已補所需訂單比對說明。

review-ledger.json的135筆全NOT_RUN。真人需要核對計數音變自然度、語境唯一解、提示是否洩漏、聽力速度與截斷、閱讀長度、圖片數量與裁切。工程／AI目視不代替真人審查，U07-V BLOCKED，作者／素材IN_REVIEW、I IN_PROGRESS。

恢復：Node22，python3 scripts/author-u07.py；npm run gen:voice:unit -- U07；node --import tsx scripts/pack-catalog.ts --write；node --import tsx scripts/unit-inventory.ts --write。腳本與音檔hash一致才重用，禁止覆寫APPROVED來源。
