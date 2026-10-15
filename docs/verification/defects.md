# P0 缺陷清單與追蹤

基準runtime：`9100671`；只建立重現與修復任務，尚未實作P1修復。每項都有owner角色，實際承接與簽核見P0 acceptance。

| ID | 實際結果／原因 | 證據 | 修復task／角色 |
|---|---|---|---|
| F-01 | 10題中前兩題先點錯再點對，結算仍10/10；錯點未進首次結果 | F01-catch.json、F01.png；Audio播放stub及Canvas座標觀測，未改題目狀態 | P1-01／工程 |
| F-02 | 點促音比較入口後`Cannot read properties of undefined (reading 'id')`，停在0/10 | probes.json、F02.png；實際UI | P1-02／工程／內容 |
| F-03 | 明確為A建立的合成舊schema資料，切B後家長頁仍顯1分、假名60% | probes.json、F03.png；不是重現真孩子資料 | P1-03／04／工程 |
| F-04 | offline＋target仍建SR1次、start1次；stop沒有停止SR（0次） | F04-mic-spy.json；source module API spy，非實體裝置／雲端傳輸量測 | P1-07／工程／QA |
| F-05 | 已解鎖L10fixture，mic off點必做言靈後回Entry，該挑戰未完成 | probes.json、F05.png；合成先修資料，未宣稱全主線已走完 | P1-08／工程／內容 |
| F-06 | 全新context直接開L0 complete，沒有session仍新增完成紀錄、寵物XP50 | probes.json、F06.png；實際DB讀回 | P1-05／工程 |
| F-07 | SW ready後160筆cache，WAV0筆；從未播放的kana_a.wav離線fetch失敗 | interactions.json；真SW context，與smoke的SW block分開 | P1-09／工程 |
| F-08 | 初始介面日文、HTML lang=en；切繁中後Entry仍顯日文game labels／故事，歷史文件階段衝突 | CI三引擎首頁、ui/unit-390.png、spec-reconciliation.md；歷史提示已補 | P0-01已處理文件；P2-03／07處理介面 |
| BASE-NODE26 | 原始Node26三測試localStorage undefined；同程式Node22 132/132 | initial-unit.txt→node22-unit.txt；.nvmrc | ENV-01／P0-04已處理支援環境；未宣稱支援Node26 |
| BASE-LINT | 28error／1warning：effect setState、render purity、refs、unused、throw cause | initial-lint.txt及final-lint.txt完整檔案／行號；CI保留紅燈 | P1-13／工程 |
| BASE-AUDIT | npm audit 18項（2low／6moderate／9high／1critical，實際以JSON為準）；需分runtime／build影響 | npm-audit.json；沒有直接audit fix升級 | P1-13／工程 |
| UX-SIZE | Home三顆header鈕40px、Entry「開始玩」高32px、write返回24×32、sync關閉32px；未達64／44 | ui/metrics.json；尺寸為CSS px | P2-03／09／前端／QA |
| UX-ZOOM | 390px文字200%家長頁scrollWidth489；地圖標籤重疊，單元遊戲名稱被截斷 | ui/*-text200.png、metrics.json | P2-03／07／09／前端／UX |
| UX-FOCUS | 僅瀏覽器預設1px outline，未實作規範3px／2px；sync非dialog role且未trap／restore焦點 | ui/keyboard.png、metrics.json；SyncModal source | P2-03／07／前端 |
| UX-CANVAS | 假名抓抓樂只有Canvas點選，書寫／拖曳缺等價DOM流程 | 操作截圖與feature source | P2-07／前端／QA |
| UX-EMPTY | 家長無紀錄顯0%而非尚未檢核；未知level只有loading無回復入口 | ui/parent-390.png、LevelEntry source | P1-10、P2-06／工程 |
| UX-NEXT | Entry主要開始鈕disabled，需從多個小挑戰鈕自行判斷；手機地圖無關卡清單，需拖移 | ui/unit-320.png、adventure-320.png | P2-05／08／前端／UX |
| BASE-BUNDLE | 原build單一JS超過500kB警告 | initial-build.txt／final-build.txt | P4-04／工程 |
| DEPLOY-ACCESS | preview部署success，但HTTP200是Vercel登入HTML，無法讀取version.json核SHA | deployment-access.json／branch-deployment.json | P0-06／專案擁有者（外部權限） |

以上證據路徑均相對本目錄`evidence/P0/`。預期行為及修復後案例以project.md及tasks.md為準；現有錯誤不得改成通過斷言。UI基準已記錄的缺陷不要求本P0跨界實作P1／P2。
