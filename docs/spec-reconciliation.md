# P0-01 新舊規格與現況對照

基準 `9100671`，2026-10-15。唯一產品規則：[project.md](../project.md)；執行依賴：[tasks.md](../tasks.md)。分類是後續處置，不表示已有功能通過驗收。

## 全路由（App.tsx，含 redirect）

| Hash route | 元件／redirect | 處置 | 後續 task |
|---|---|---|---|
| `/profiles` | `ProfileSelector /` | 保留 | P1-04 |
| `/profiles/new` | `ProfileCreate /` | 保留 | P2-05 |
| `/` | `HomeScreen /` | 修復 | P2-05 |
| `/adventure` | `AdventureMap /` | 修復 | P2-05 |
| `/adventure/level/:levelId` | `LevelEntry /` | 修復 | P2-05 |
| `/adventure/level/:levelId/complete` | `LevelComplete /` | 修復 | P1-05 |
| `/play` | `PlayScreen /` | 合併 | P1-10／P2-03 |
| `/play/kana` | `KanaMatchGame /` | 修復 | P1-10／P2-03 |
| `/play/flashcard` | `FlashCardDeck /` | 合併 | P1-10／P2-03 |
| `/play/quiz` | `ListenQuiz /` | 合併 | P1-10／P2-03 |
| `/play/gallery` | `KanaGallery /` | 合併 | P1-10／P2-03 |
| `/play/kana-catch` | `KanaCatchGame /` | 修復 | P1-01／02 |
| `/play/dakuten-drag` | `DakutenDragGame /` | 修復 | P1-10／P2-03 |
| `/play/kana-write` | `KanaWriteGame /` | 修復 | P1-10／P2-03 |
| `/play/kotodama` | `KotodamaGame /` | 修復 | P1-10／P2-03 |
| `/parent` | `ParentDashboard /` | 修復 | P2-06 |
| `/kid` | `Navigate to="/" replace /` | 合併 | P1-10／P2-03 |
| `/kid/kana` | `Navigate to="/play/kana" replace /` | 合併 | P1-10／P2-03 |
| `/kid/flashcard` | `Navigate to="/play/flashcard" replace /` | 合併 | P1-10／P2-03 |
| `/kid/quiz` | `Navigate to="/play/quiz" replace /` | 合併 | P1-10／P2-03 |
| `*` | `Navigate to="/" replace /` | 合併 | P1-10／P2-03 |

Redirect 合併保留相容入口，不刪舊書籤；* 未知路徑回首頁。遊戲不必改 URL，合併指將自由練習入口整合到冒險，且共用學習紀錄。

## 主要 feature／共用模組

| 範圍 | 處置 | 原因／任務 |
|---|---|---|
| profiles（選擇、新增、重設、刪除） | 修復 | UI 保留；學習、任務與設定必須隔離；P1-03／04 |
| home | 修復 | P2 今天與續學、語言；P2-05 |
| adventure（Map、Entry、Complete、engine） | 修復 | URL guard、交易、解鎖與關卡清單；P1-05、P2-05 |
| kana（配對） | 合併 | 保留自由練習，接共用 Attempt；P1-01、P2-01 |
| flashcard | 合併 | 變教學／詞卡入口，不以翻卡當獨立答對；P2-08 |
| quiz | 合併 | 接聽力播放器，不另創計分；P2-04 |
| play／gallery | 合併 | 冒險內自由練習、假名先修入口；P2-05、P3-01 |
| kana-catch（setup／engine／generators） | 修復 | F-01／02；P1-01／02 |
| dakuten-drag | 修復 | 玩家紀錄／點選替代；P1-04、P2-03 |
| kana-write／StrokeOrderDemo | 保留 | 輔助、不作 N5 主線門檻；資料與 cleanup 仍遵守 P1 |
| kotodama／35 scenes | 修復 | F-04／05，活動可選，不稱發音正確；P1-07／08 |
| parent（PIN、統計、設定、玩家操作） | 修復 | 玩家與能力樣本數、錯誤狀態；P1-04、P2-06 |
| sync（Modal、cloudSync、Express／Sheets backend） | 延後 | 實驗功能，未承諾多家庭正式服務；project §6.3 |
| PetAvatar／PetStage、petEvolution、VictoryCutscene、cosmetics | 保留 | 現有外型／關卡進化保留為參與獎勵；P2 動態／略過規範，不宣稱能力 |
| DailyTasksPanel、dailyTasks、StarCount | 修復 | localStorage 共用與冪等獎勵；P1-03／05 |
| DB v1～v4、Zustand | 修復 | P1-03 遷移，正式資料 IndexedDB；不清真實資料 |
| audio／tts／SpeakButton／mic | 修復 | P1-07／09／10；音訊無法播放不計錯 |
| loaders／schemas／validate-data | 修復 | 現在只驗四份 shape，關聯與 levels 留 P1-11 |
| i18n／useT／CSS | 修復 | 操作繁中、日文教材、token／lang；P2-03 |

## 全 game_mode（src/types/index.ts）

| game_mode | 目前實作／路由 | 處置 |
|---|---|---|
| kana_catch_listen | KanaCatch，listen／listen_katakana | 修復 P1-01／04／09 |
| kana_catch_minimal_pair | KanaCatch，kana 表過濾詞組 | 修復 P1-02 |
| kana_catch_word_to_image | KanaCatch，concept_words | 修復 P1-02／11 |
| dakuten_drag | DakutenDrag | 修復 P1-04、P2 拖曳替代 |
| kotodama_summon | Kotodama | 修復 P1-07／08 |
| karaoke_rhythm | 型別／rhythm_tracks 存在；LevelEntry 偷渡至 kana-catch，無獨立 feature | 延後；不可承諾已實作；P1-02 未知模式 fallback |
| echo_record | 型別存在；Entry 顯 comingSoon，路由 map 至 kana-catch | 延後；不列必做活動；P1-08 |
| write_canvas | KanaWrite | 保留為輔助活動 |

## 被取代與保留規則

| 主題 | 舊 SPEC／KICKOFF／INVENTORY／HANDOFF | 本輪決定 |
|---|---|---|
| 主控文件／停止點 | SPEC 唯一、inventory 後等家長 | project §0.2 主控，使用者已授權 P0 自主執行；僅真正外部決策／人工審核留下 gate |
| 階段與 PR | S0–S7，其他 S8–S13、B1–B6，單階段單 PR | P0–P5 取代舊編號；可多小 PR，每批具獨立驗證 |
| 計分 | 點錯無懲罰、答對數滿才結束 | 溫和回饋但保留首次錯誤；首次答對率與完成率分開，F-01 |
| 麥克風 | offline／enhanced 與發聲主線混用 | 預設 off；offline 不建 SR；發聲非主線必需，F-04／05 |
| 內容 | 六關 Beta／現有十一關、課本進度為主 | 原十一關保留盤點；N5 主線另有 U01–U24，假名先修不計入24 |
| 語言 | SPEC 操作中文但目前 ja 預設且硬編 | 操作繁中、教材日文，年級與程度分開；F-08 |
| 進化 | XP／關卡進化與多時期里程碑 | 保留目前表現；不以進化當掌握度，不新增寵物／建島；P2 規範動畫 |
| backend | SPEC 無後端，現有同步 server | 同步原型實驗；v1 本機＋備份，外部服務待另立安全範圍 |
| schema／共用資料 | 涉 build app 需相容 | 保留；P0 不改既有學習 schema；P1 遷移、P2 契約各自提交 |
| 原創與來源 | 禁提交課本掃描／原文／音檔，需來源授權 | 保留；來源記錄不是自動授權證明；不複製官方試題作教材 |

## F-01～F-08 追蹤

| Finding | 修復 task | 重現／驗證 |
|---|---|---|
| F-01 | P1-01 | 抓抓樂錯點後改點對，完成10題；結果仍100%；P1 用5題3首次對驗60% |
| F-02 | P1-02 | 自由抓抓樂→比較→促音／長音；查看 pageerror 及空畫面；修復後需同對比組選項 |
| F-03 | P1-03／04 | A 建立 session 後切 B，家長報告仍有 A 資料；須遷移 fixture 與雙玩家測試 |
| F-04 | P1-07 | offline 建 mock SR spy＋假麥克風；target 非空時 constructor／start 被呼叫；修復需0 |
| F-05 | P1-08 | mic off，進 L10 必做 kotodama，退回 Entry 仍未完成；修復後三種無 mic 情境走完 |
| F-06 | P1-05 | 新 context 直接開有效 complete URL；讀 IndexedDB 確認未做題已獲完成／XP |
| F-07 | P1-09 | 檢查 sw.js 預快取缺 WAV，已訪問非等於教材包下載；離線首播需另測 |
| F-08 | P0-01、P2-03／04／05 | 舊文件加版本提示；新 context 預設日文、繁中 Entry 仍日文；P2 修復 |

實測結果與限制見 [ui-baseline](verification/ui-baseline.md)，此表的重現步驟不能代替測試證據。

## 2026-10-16：v1.1 冒險方向取代項目

使用者確認第二張旅行手帳插畫、平板優先、自由探索、日語戰鬥、金幣與裝備。來源與提案邊界見[設計契約](design/ADVENTURE_RPG_SPEC.md)；以下更新P2後續目標，不改寫P0／P1已執行證據。

| 舊規則 | v1.1採用規則 | task |
|---|---|---|
| Today每日清單作首頁 | 繼續冒險回世界；建議量與續學移手帳，不阻擋逛街 | P2-05、P2-12 |
| 點編號關卡即開始刷題 | 自由行走、人物對話、靠近道館，再教學／戰鬥 | P2-12、P2-13、P2-14 |
| 柔和島嶼、teal主按鈕、emoji／混合SVG美術 | 一致墨線水彩、暖紙深藍、完整場景人物；功能SVG仍可用 | P2-03、P2-11 |
| 地圖最大960px、固定關卡清單 | 平板可用畫面內探索、可達地點等價清單；正文寬度仍受限 | P2-12、P2-07 |
| 每小節5題被理解為每場戰鬥固定5題 | 每5有效作答一學習小節可跨戰鬥；戰鬥依HP與回合終止 | P2-05、P2-14 |
| 只有XP／寵物成長 | 加wallet ledger、商店與裝備；所有遊戲數值與掌握能力分開 | P2-15、P2-16 |
| P2只驗收單元播放器 | 加入小鎮完整循環、15項gate；U01內容配額全部保留 | P2-08、P2-09 |
| P3只看開始／小節／結果／下一步 | 同一8/9與各組2/3門檻，流程含道館與購物換裝；另觀察倦怠與探索 | P3-03～P3-06 |

未變更：P0／P1已知缺口、人工教材及音訊審核、24單元配額、無mic主線、資料保全、正式模擬測驗與發布授權邊界。P2規劃可先行，前置gate尚未通過的實作task不自動改READY。
