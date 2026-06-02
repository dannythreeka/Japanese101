export type UiLang = 'ja' | 'zh'

export const T = {
  // ── Common ──────────────────────────────────────────────────────────────
  back:             { ja: '← もどる',         zh: '← 返回' },
  backAria:         { ja: 'もどる',            zh: '返回' },
  home:             { ja: 'ホーム',            zh: '首頁' },
  homeAria:         { ja: 'ホームにもどる',    zh: '返回首頁' },
  playAgain:        { ja: 'もういちど！',      zh: '再玩一次！' },
  playAgainAria:    { ja: 'もういちど',        zh: '再玩一次' },
  done:             { ja: 'おわった！',        zh: '完成了！' },
  doneKanaWrite:    { ja: 'おわった！',        zh: '完成！' },
  correct:          { ja: 'せいかい',          zh: '答對' },
  loading:          { ja: 'よみこみちゅう…',   zh: '載入中…' },
  noData:           { ja: 'データなし',        zh: '無資料' },
  listenAgainAria:  { ja: 'もういちどきく',    zh: '再聽一次' },

  // ── PlayScreen ──────────────────────────────────────────────────────────
  appTitle:         { ja: '日語101',           zh: '日語101' },
  stageEgg:         { ja: 'タマゴ',            zh: '蛋' },
  stageBaby:        { ja: 'あかちゃん',        zh: '寶寶' },
  stageKid:         { ja: 'こども',            zh: '小孩' },
  stageAdult:       { ja: 'おとな',            zh: '成年' },
  xpToNext:         { ja: 'あと {n} XP',       zh: '升級還需 {n} XP' },
  letsPlay:         { ja: 'あそぼう！',        zh: '來玩吧！' },
  parentAreaAria:   { ja: 'おやのエリア',      zh: '家長區域' },
  galleryAria:      { ja: 'かなずかん',        zh: '假名圖鑑' },

  // Game names
  gameKanaMatch:    { ja: '🎮 かな マッチ',             zh: '🎮 假名配對' },
  gameFlashcard:    { ja: '🃏 たんご カード',           zh: '🃏 記憶卡片' },
  gameListenQuiz:   { ja: '🎧 きいて クイズ',           zh: '🎧 聽力問答' },
  gameKanaCatch:    { ja: '🫧 かな キャッチ！',         zh: '🫧 接住假名！' },
  gameDakuten:      { ja: '✏️ だくてん ドラッグ',      zh: '✏️ 濁點拖拉' },
  gameKanaWrite:    { ja: '✍️ かな かいてみよう',      zh: '✍️ 寫假名練習' },
  gameKotodama:     { ja: '✨ ことだま しょうかん',     zh: '✨ 言靈召喚' },
  micOffNote:       { ja: '🔒 おやのせってい で ひらく', zh: '🔒 家長設定可開啟' },

  // Kotodama mic setup modal (PlayScreen)
  kotodamaModalTitle:   { ja: 'ことだま しょうかん',                             zh: '言靈召喚' },
  kotodamaModalDesc:    { ja: 'にほんごを よんで、せかいが かわる まほうの ゲーム！', zh: '大聲唸出日語，場景就會改變的魔法遊戲！' },
  kotodamaModalNote:    { ja: 'おやのせってい で マイクを ひらいてね。',          zh: '需要家長在設定中開啟麥克風。' },
  kotodamaModalClose:   { ja: 'もどる',                                          zh: '返回' },
  kotodamaParentLink:   { ja: 'おやのせってい →',                               zh: '家長設定 →' },

  // ── KanaCatch ───────────────────────────────────────────────────────────
  kanaCatchTitle:       { ja: 'かな キャッチ！',            zh: '接住假名！' },
  kanaCatchPrompt:      { ja: 'どんな モード で あそぶ？',  zh: '選擇遊戲模式？' },
  kanaCatchListen:      { ja: 'きく',                       zh: '聆聽' },
  kanaCatchCompare:     { ja: 'くらべる',                   zh: '比較' },
  kanaCatchWord:        { ja: 'ことばを みつけよう',        zh: '找詞語' },
  kanaCatchListenDesc:  { ja: 'おとを きいて かなを みつけよう', zh: '聽聲音找假名' },
  kanaCatchCompareDesc: { ja: 'だくてん は どれ？',         zh: '有濁點嗎？' },
  kanaCatchWordDesc:    { ja: 'えに あう ことばを みつけよう！', zh: '找出符合圖片的詞語！' },
  kanaCatchListen2:     { ja: 'おとを きいて！',            zh: '聆聽聲音！' },
  kanaCatchChangeMode:  { ja: 'モードを かえる',            zh: '換模式' },

  // ── DakutenDrag ─────────────────────────────────────────────────────────
  dakutenQuestion:      { ja: 'どれに {mark} を つける？',                   zh: '哪個要加 {mark} ？' },
  dakutenDragAria:      { ja: '{mark}を ドラッグして ただしい もじに のせよう', zh: '拖動{mark}到正確的文字上' },
  dakutenDragHint:      { ja: 'ドラッグして おこう！',                        zh: '拖動並放置！' },

  // ── FlashCard ───────────────────────────────────────────────────────────
  flashcardFlipBack:    { ja: 'うらを みる',       zh: '翻到背面' },
  flashcardFlipFront:   { ja: 'おもてに もどる',   zh: '翻到正面' },
  flashcardKnow:        { ja: 'わかった！✓',       zh: '記住了！✓' },
  flashcardKnowAria:    { ja: 'わかった',          zh: '記住了' },
  flashcardAgain:       { ja: 'もういちど ✗',      zh: '再看一次 ✗' },
  flashcardAgainAria:   { ja: 'もういちど',        zh: '再看一次' },
  flashcardGreat:       { ja: 'すごい！',          zh: '做得很好！' },

  // ── ListenQuiz ──────────────────────────────────────────────────────────
  listenQuizWhich:      { ja: 'どれ？',            zh: '哪一個？' },
  listenQuizListen:     { ja: 'おとを きいて！',   zh: '聆聽聲音！' },

  // ── KanaMatch ───────────────────────────────────────────────────────────
  kanaMatchWhich:       { ja: 'どの よみかた？',   zh: '哪個讀法？' },

  // ── KanaWrite ───────────────────────────────────────────────────────────
  kanaWriteOrange:      { ja: 'オレンジ = おてほん', zh: '橙色 = 範本' },
  kanaWriteClear:       { ja: 'けす',               zh: '清除' },
  kanaWriteCheck:       { ja: 'かくにん ✓',         zh: '確認 ✓' },
  kanaWriteFinish:      { ja: 'おわり 🎉',          zh: '完成 🎉' },
  kanaWriteNext:        { ja: 'つぎへ →',           zh: '下一個 →' },
  kanaWriteHint:        { ja: 'うすい もじを なぞってみよう！', zh: '試著描繪淡色的字！' },
  kanaWriteReturn:      { ja: 'もどる',             zh: '返回' },
  kanaWriteDemo:        { ja: 'みほん',             zh: '示範' },

  // ── KanaGallery ─────────────────────────────────────────────────────────
  galleryTitle:         { ja: 'かなずかん',         zh: '假名圖鑑' },

  // ── KotodamaGame ────────────────────────────────────────────────────────
  kotodamaDone:         { ja: 'おわった！',             zh: '完成了！' },
  kotodamaBack:         { ja: '← もどる',              zh: '← 返回' },
  kotodamaAgain:        { ja: 'もういちど',             zh: '再玩一次' },
  kotodamaBackAria:     { ja: 'もどる',                zh: '返回' },
  kotodamaNoScene:      { ja: 'シーンなし',             zh: '無場景' },
  kotodamaSuccess:      { ja: 'せいこう！',             zh: '成功！' },
  kotodamaNextWord:     { ja: 'つぎのことばへ…',       zh: '前往下一個詞語…' },
  kotodamaTryAgain:     { ja: 'もう一度どうぞ！',      zh: '再試一次！' },
  kotodamaRecordAria:   { ja: 'ろくおんちゅう',        zh: '錄音中' },
  kotodamaSayAria:      { ja: 'ことだまを となえる',   zh: '唸言靈' },
  kotodamaSaying:       { ja: 'よんでね…',             zh: '請說…' },
  kotodamaInstruct:     { ja: 'おしながら よんでね！', zh: '按住並說出來！' },
  kotodamaRemain:       { ja: 'のこり {n} かい',       zh: '剩餘 {n} 次' },
  outcomeSilent:        { ja: 'もっと おおきな こえで！', zh: '聲音太小了，再試試！' },
  outcomeWeak:          { ja: 'もっとはっきり いってね！', zh: '請說得更清楚！' },
  outcomeGood:          { ja: 'すごい！せいこう！',     zh: '太棒了！成功！' },
  outcomePerfect:       { ja: 'かんぺき！！',           zh: '完美！！' },

  // ── LevelUpModal ────────────────────────────────────────────────────────
  levelUpEvolved1:      { ja: 'しんかした！',   zh: '進化了！' },
  levelUpEvolved2:      { ja: 'つよくなった！', zh: '變得更強了！' },
  levelUpEvolved3:      { ja: 'さいきょう！',  zh: '最強！' },
  levelUpLevel:         { ja: 'レベルアップ！', zh: '升級了！' },
  levelUpPraise:        { ja: 'すごいね！',     zh: '太棒了！' },

  // ── DailyTasksPanel ─────────────────────────────────────────────────────
  dailyTasks:           { ja: 'きょうの ミッション', zh: '今日任務' },

  // ── ParentDashboard ─────────────────────────────────────────────────────
  parentArea:           { ja: '家長エリア',               zh: '家長區域' },
  parentEnterPin:       { ja: 'PINを にゅうりょく',       zh: '請輸入PIN碼' },
  parentPinError:       { ja: 'まちがい',                  zh: '密碼錯誤' },
  parentDashboard:      { ja: '家長 ダッシュボード',      zh: '家長儀表板' },
  parentLoading:        { ja: 'よみこみちゅう…',          zh: '載入中…' },
  parentStudyTime:      { ja: 'がくしゅうじかん',         zh: '學習時間' },
  parentStars:          { ja: 'もらったほし',              zh: '獲得星數' },
  parentAccuracy:       { ja: 'せいかいりつ',              zh: '正確率' },
  parentKanaLabel:      { ja: 'かな',                      zh: '平假名' },
  parentVocabLabel:     { ja: 'たんご',                    zh: '詞彙' },
  parentWeekly:         { ja: 'こんしゅう',                zh: '本週' },
  parentSettings:       { ja: 'せってい',                  zh: '設定' },
  parentAgeMode:        { ja: 'ねんれいモード',            zh: '年齡模式' },
  parentYoung:          { ja: '幼齢 🐣',                  zh: '幼齢 🐣' },
  parentAdvanced:       { ja: '進階 🚀',                  zh: '進階 🚀' },
  parentAgeModeYoung:   { ja: 'ローマ字あり・ゆっくり・清音メイン（6〜8歳向け）', zh: '含羅馬字・節奏較慢・以清音為主（適合6〜8歲）' },
  parentAgeModeAdv:     { ja: 'ローマ字なし・はやい・全かな（9〜12歳向け）',      zh: '不含羅馬字・節奏較快・全部假名（適合9〜12歲）' },
  parentKanaMode:       { ja: 'かなのモード',              zh: '假名模式' },
  parentHiragana:       { ja: 'ひらがな',                  zh: '平假名' },
  parentKatakana:       { ja: 'カタカナ',                  zh: '片假名' },
  parentBoth:           { ja: 'りょうほう',                zh: '兩者皆有' },
  parentDifficulty:     { ja: 'むずかしさ',                zh: '難易度' },
  parentDiff1:          { ja: 'レベル1（せいおん）',       zh: '第1級（清音）' },
  parentDiff2:          { ja: 'レベル2（だくてん）',       zh: '第2級（濁音）' },
  parentDiff3:          { ja: 'レベル3（ようおん）',       zh: '第3級（拗音）' },
  parentDiffAll:        { ja: 'ぜんぶ',                    zh: '全部' },
  parentLessons:        { ja: 'レッスン',                  zh: '課程' },
  parentToggleOff:      { ja: 'オフにする',                zh: '關閉' },
  parentToggleOn:       { ja: 'オンにする',                zh: '開啟' },
  parentMicTitle:       { ja: 'マイク設定（ことだま）',    zh: '麥克風設定（言靈）' },
  parentMicDesc:        { ja: '「ことだま召喚」ゲームで子どもが声を使えるようになります。', zh: '在「言靈召喚」遊戲中讓孩子可以使用語音功能。' },
  parentMicOff:         { ja: 'オフ',                      zh: '關閉' },
  parentMicOffline:     { ja: 'オフライン',                zh: '離線模式' },
  parentMicHigh:        { ja: '高精度',                    zh: '高精度' },
  parentMicStatusOff:   { ja: 'ことだまゲームは利用できません', zh: '言靈遊戲不可使用' },
  parentMicStatusOfl:   { ja: '音量検知のみ · 外部送信なし', zh: '僅偵測音量 · 不傳送至外部' },
  parentMicStatusEnh:   { ja: '音声認識あり · インターネット必要', zh: '語音識別 · 需要網路連線' },
  parentMicPrivacy:     { ja: '🔒 音声データはデバイス内のみで処理されます。', zh: '🔒 語音資料僅在設備內部處理。' },
  parentMicModalTitle:  { ja: 'マイクの許可について',      zh: '關於麥克風授權' },
  parentMicModalDesc:   { ja: 'ことだまゲームのために、マイクへのアクセスを許可します。', zh: '為了言靈遊戲，請允許使用麥克風。' },
  parentMicBullet1:     { ja: '音声はデバイス内でのみ処理されます', zh: '語音僅在設備內部處理' },
  parentMicBullet2:     { ja: '外部サーバーには送信されません', zh: '不傳送至外部伺服器' },
  parentMicBullet3:     { ja: '録音はデフォルトで保存されません', zh: '預設不儲存錄音' },
  parentMicError:       { ja: 'マイクの許可が得られませんでした。ブラウザの設定を確認してください。', zh: '無法取得麥克風授權，請確認瀏覽器設定。' },
  parentMicCancel:      { ja: 'キャンセル',                zh: '取消' },
  parentMicAllow:       { ja: '許可する',                  zh: '允許' },

  // ── HomeScreen ──────────────────────────────────────────────────────────
  homeStartAdventure:   { ja: 'ぼうけんを はじめよう！',   zh: '開始冒險！' },
  homeContinueAdventure:{ ja: 'ぼうけんを つづける',       zh: '繼續冒險' },
  homeFreePlay:         { ja: 'じゆう れんしゅう',         zh: '自由練習' },
  homeSettingsAria:     { ja: 'おやのせってい',            zh: '家長設定' },

  // ── AdventureMap ────────────────────────────────────────────────────────
  mapTitle:             { ja: 'ことだまの島',              zh: '言靈之島' },
  mapLockedHint:        { ja: 'まえのかんを クリアしてね', zh: '請先完成前一關' },
  mapReplayPrompt:      { ja: 'もういちど あそぶ？',       zh: '重玩這一關？' },
  mapBossLabel:         { ja: 'だいまおう',                zh: '大魔王' },
  mapBack:              { ja: '← ホーム',                  zh: '← 首頁' },
  mapBackAria:          { ja: 'ホームにもどる',            zh: '返回首頁' },
  mapRegionLocked:      { ja: '（まだひらかない）',        zh: '（尚未開放）' },

  // ── LevelEntry ──────────────────────────────────────────────────────────
  levelBack:            { ja: '← ちず',                   zh: '← 地圖' },
  levelBackAria:        { ja: 'ちずにもどる',              zh: '返回地圖' },
  levelChallengesTitle: { ja: 'チャレンジ',                zh: '挑戰清單' },
  levelStartBtn:        { ja: 'はじめる！',                zh: '開始！' },
  levelStarsLabel:      { ja: 'ほし',                      zh: '星星' },
  levelXpLabel:         { ja: 'XP',                        zh: 'XP' },
  levelChallengeRequired: { ja: 'ひっす',                  zh: '必要' },
  levelChallengeOptional: { ja: 'おまけ',                  zh: '選玩' },
  levelComingSoon:      { ja: '（S6.6 でつなぎます）',     zh: '（S6.6 接入）' },
} as const

export type TKey = keyof typeof T
