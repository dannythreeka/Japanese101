# P1 執行紀錄

狀態：IN_PROGRESS。基準：`bc2116ad789d247e3be44d2eba5b5a0e790b73ea`（PR #53合併）；分支phase/p1-reliability。
工程執行：本session Codex。2026-10-15使用者明確指示合併PR53並開始P1，P0人工驗證同步進行。這是執行順序的授權例外，沒有把P0-03／05／06／07改成DONE或捏造簽核。P0後續人審修訂需同步評估P1影響。

範圍P1-01～P1-13；先共用作答契約／出題安全，再玩家遷移、持久session／交易／恢復，並處理mic／音訊、CI缺陷。主機apt／核心／Wi-Fi／交易服務不變動。

PR53已依使用者授權merge；P1只授權push工作分支／開PR，沒有自動merge或正式發布P1授權。

## P1-01／02 第一批

新增首次作答／提示／跳過／完成率契約；Canvas pointer事件重現五題三首次對、兩題錯點重試，onComplete只一次且回傳3/5。詞組比對支援vocabulary、同組干擾選項；0/1或未知詞回復empty，UI可返回／重試；卸載取得真正engine cleanup。針對三檔27個測試PASS、typecheck PASS。其他遊戲出口與持久化尚待整合，不把P1-01完整標DONE。
