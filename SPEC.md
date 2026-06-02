# japanese101-pet — Production 規格與 Agent 開發規範

> 給孩子(6–12歲)的日文學習 Web App。世界觀:**寵物養成**。
> 第一波核心小遊戲:**假名抓抓樂(かなキャッチ / Kana Catch)**。
> 本文件供 Gemini(資料) / Codex・Claude Code Sonnet(實作) / Haiku(測試) 使用。

---

## 0. 兩個 App 的關係(重要前提)

本專案從 `japanese101-pet` 與 `japanese101-build` 拆成兩個獨立 repo,各自部署。
- 兩者**共用同一套學習資料層**(假名、單字、課本進度對齊),建議抽成獨立 npm package 或共用 `/data` 子模組,避免重複維護。
- 兩者**不共用世界觀與遊戲層**。pet = 寵物養成;build = 島嶼建造。
- 本文件只規範 `japanese101-pet`。build app 另開規格,但資料層 schema 必須一致(見 §4)。

**給 agent 的硬性規則:** 任何對學習資料 schema 的修改,都必須同步反映在共用資料層,並在 PR 描述標註「影響 build app」。

---

## 1. 版權與資料來源規範(不可違反)

這是整個 production 的法律地基,所有 agent 必須遵守。

### 禁止事項
- ❌ 不得將光村圖書(光村図書出版)的課文、插圖、編排、音檔放入 app 的程式碼、public 資源或 build 產物。
- ❌ 不得在 repo 中提交任何掃描 / OCR 自課本的原始檔(圖片、PDF、未改寫的課文文字)。
- ❌ 不得重現課本插圖或其衍生圖。

### 允許事項
- ✅ 可使用「課本第 N 課教了哪些詞彙」這個**事實性清單**作為進度索引(詞彙的選取本身是事實,不受著作權保護)。
- ✅ App 內呈現的所有素材必須是:(a) 原創、(b) CC0 / 公共領域、或 (c) 明確授權可商用且已標註來源。
- ✅ 發音音檔須為自行合成(TTS)或自行錄製,不得取自課本。

### OCR 的正確用途
掃描 / OCR 課本**僅供家長離線備課**,用來整理出「每課要教哪些字」的清單。此步驟產出的詞彙清單(只含:假名、羅馬拼音、中文意思、所屬課次)才可進入 repo。原始掃描檔留在本機,不進版控。

---

## 2. 產品概述

| 項目 | 內容 |
|---|---|
| 對象 | 6–12 歲兒童,在家自學,搭配週末實體日語課 |
| 平台 | Web App(行動裝置優先,平板/手機),PWA 可離線 |
| 世界觀 | 寵物養成:孩子有一隻會成長進化的夥伴,練習餵養牠 |
| 第一波遊戲 | 假名抓抓樂(聽音 → 點落下的正確假名) |
| 語言 | 介面中文,學習內容日文;所有文字可語音播報 |
| 後端 | 無。資料存本地 IndexedDB,保護兒童隱私 |

### 年齡分層(同一遊戲兩種難度)
- **幼齡模式(6–8)**:慢速、少量、圖示提示、無計時壓力、字大。
- **進階模式(9–12)**:快速、含濁音拗音、combo 連擊、有挑戰榜(僅自我紀錄)。
- 模式由家長端設定,或依年齡預設,孩子端不顯示選擇以免分心。

---

## 2.A 世界觀 — ことだまの島 物語

### 設定
雲之上漂浮著一座「**ことだまの島**(言靈之島)」,曾經充滿聲音與色彩。但黑色的「**しずか**(寂靜)」降臨後,全島的聲音與顏色被吸走,變得灰暗安靜。

孩子是被選中的「**ことだま使いの卵**(言靈使者的雛鳥)」,與夥伴(寵物)一起,用聽、讀、寫、說四種力量,逐一喚回島嶼各地的聲音與顏色。

### 為何選擇這個世界觀
1. **與四種能力遊戲完美縫合**:聽辨/看讀/書寫/發聲 = 四種「喚醒之力」
2. **複用 kotodama_scene**:現有資料層的「灰暗 → 彩色」對比天生就是「喚醒」的視覺語言
3. **大魔王有合理身分**:「**しずかの影**(寂靜之影)」,擋住通往下個區域的路
4. **寵物進化有故事理由**:「ことだま」的力量讓夥伴成長

### 不變更的設計原則(冒險模式同樣適用)
- 沒有 ❌、沒有「失敗」「錯誤」字眼
- 沒過 = 「這個地方還沒醒」「夥伴還在睡」「咒語還不夠強」
- 大魔王關連續錯太多 → 自動降低難度(對孩子不可見)
- 「自由練習」永遠可用,不影響冒險進度

---

## 3. 技術架構(硬性約束)

延續現有 repo(React + TS + Vite + Tailwind + Vercel),新增:

```
框架        React 18 + TypeScript(strict)+ Vite
樣式        Tailwind CSS
狀態        Zustand
本地儲存    IndexedDB(透過 Dexie.js)
動畫        Framer Motion(UI 過場/彈跳)
遊戲渲染    Canvas 2D 或 Pixi.js(抓抓樂的落下物與粒子)
音效        Howler.js(連續音效/BGM 用 Web Audio,較 <audio> 穩定)
語音        Web Speech API (SpeechSynthesis, ja-JP) 主用
            預錄 ja-JP 音檔備援(瀏覽器無日語語音時)
寵物動畫    Lottie(向量動畫,輕量可換狀態)或精靈圖
測試        Vitest(單元/元件)+ Playwright(E2E)
部署        Vercel 靜態部署 + Service Worker(PWA)
```

### 程式碼規範
- TypeScript strict;禁用 `any`(必要時 `unknown` + 型別守衛)。
- 函式元件 + hooks;單檔 ≤ 200 行,超過須拆分。
- 命名:元件 PascalCase,hook `useXxx`,常數 UPPER_SNAKE,型別 PascalCase。
- 所有非同步須 try/catch + fallback UI;音訊/語音失敗不得使畫面崩潰。
- 無障礙:可點元素皆有 `aria-label`;對比達 WCAG AA;支援鍵盤操作。
- 禁用 `localStorage`/`sessionStorage` 存學習進度(用 IndexedDB);敏感資料不外傳。
- 提交前須通過:`tsc --noEmit`、`eslint`、`vitest run`。

### UI 兒童化規範
- 主要按鈕最小 64×64px;孩子端標題 ≥ 32px,內文 ≥ 24px。
- 每畫面 ≤ 3 個主要互動;高對比、明亮不刺眼。
- 每個畫面有「喇叭」播報鈕。
- 答對/答錯皆有「視覺 + 聽覺」回饋;**答錯無懲罰**(不扣血、不中斷,只鼓勵重試)。
- 孩子端 (`/play`) 與家長端 (`/parent`) 路由分離;家長端可加 PIN 鎖。

---

## 3.x 麥克風與語音技術規範

### 3.x.1 三層判定 fallback（架構基礎）

| Tier | 機制 | API | 用途 |
|---|---|---|---|
| 1 | 語音識別 | Web Speech `SpeechRecognition`, `lang='ja-JP'` | 識別到正確詞 → 給「超棒」獎勵 |
| 2 | 音量+時長偵測 | Web Audio `AnalyserNode` + RMS | **主判定**：有發聲達標即過 |
| 3 | 純錄音回放 | `MediaRecorder` | こだま遊戲、所有 fallback |

**為何 Tier 2 是主機制：**
- Web Speech Recognition 對兒童音準確率差（訓練資料以成人為主）
- 若以 Tier 1 為主，孩子會頻繁卡關 → 挫折感 → 不玩
- Tier 2 永遠不會誤判，只判斷「有沒有開口、開了多久」
- Tier 1 識別到 → 觸發**特別棒**動畫 + 雙倍 XP（獎勵，不是門檻）

**判定優先序（每次發聲）：**
```
偵測到 Tier 2 達標?
  └─ 是 → 進一步問 Tier 1 識別到目標詞?
            ├─ 是 → outcome = "perfect"   (雙倍 XP，華麗動畫)
            └─ 否 → outcome = "good"      (正常 XP，普通動畫)
  └─ 否 → 有微弱聲音?
            ├─ 是 → outcome = "weak"      (目標微反應，提示「再大聲」)
            └─ 否 → outcome = "silent"    (沒反應)

若連續 attemptsBeforeEasyPass（預設 3）次未達 "good" 以上：
  下次降低 Tier 2 門檻 → 幾乎只要有聲音就 "good"
```

### 3.x.2 隱私模式（家長端設定）

家長端必加開關：
```ts
type MicMode =
  | 'off'        // 預設，所有「說」遊戲在孩子端隱藏入口
  | 'offline'    // 只用 Tier 2/3，完全本地處理
  | 'enhanced'   // 允許 Tier 1（Web Speech，會送雲端）
```

**家長端必須顯示的白話說明：**
- 離線模式：「孩子的聲音只在這個裝置上處理，不會上傳到任何地方。」
- 增強模式：「孩子的聲音會傳送到瀏覽器的語音識別服務（如 Google），用來判斷有沒有念對。如果不希望聲音離開裝置，請選離線模式。」

**第一次啟用時**必須跳家長端 modal 確認，不可由孩子端觸發瀏覽器麥克風權限請求。

### 3.x.3 音量偵測參數（Tier 2 規格）

```ts
interface MicVolumeConfig {
  sampleIntervalMs: 50;
  rmsThreshold: number;           // 0.02 (預設) ~ 0.04 (嚴格)
  minVoicedDurationMs: 300;       // 至少有 300ms 連續發聲才算「有開口」
  maxRecordDurationMs: 4000;      // 單次錄音上限
  silenceTimeoutMs: 1500;         // 沒聲音 1.5 秒自動結束
}
```

連續 3 次未過後降為：
```
rmsThreshold *= 0.5
minVoicedDurationMs = 150
```

### 3.x.4 兒童保護機制

- **每日最大發聲次數**（家長可設，預設 50 次/天），避免孩子嘶吼或長時間使用
- **單次連續發聲超過 4 秒自動切斷**，避免抓 BGM 或環境噪音
- **錄音檔僅暫存於記憶體**（MediaRecorder Blob），除非家長明確開啟「保留錄音」（預設關），否則 round 結束即丟棄
- **若保留**：存 IndexedDB，最多 5 段，逾期自動刪；絕不進 service worker cache、絕不離開裝置

---

## 4. 資料層 Schema（pet 與 build 共用）

放於共用資料層 `/data`,對應 TypeScript 型別放 `/src/types`。

### 4.1 kana.json — 五十音
```json
{
  "id": "ka",
  "hiragana": "か",
  "katakana": "カ",
  "romaji": "ka",
  "row": "k",
  "type": "seion",
  "difficulty": 1
}
```
- `row`: vowel / k / s / t / n / h / m / y / r / w / n_single
- `type`: seion(清音)/ dakuon(濁音)/ handakuon(半濁音)/ youon(拗音)
- `difficulty`: 1(基礎清音)→ 3(拗音)
- 涵蓋:清音 46、濁音/半濁音、拗音。

### 4.2 vocabulary.json — 單字(綁定課本進度)
```json
{
  "id": "word_001",
  "kana": "いぬ",
  "romaji": "inu",
  "meaning_zh": "狗",
  "category": "animal",
  "unit": "mitsumura_g1_u3",
  "image": { "src": "/assets/img/dog.svg", "license": "CC0", "source_url": "..." },
  "audio": { "src": "/assets/audio/inu.mp3", "origin": "tts_generated" }
}
```
- `unit`: 課本進度索引代碼(只是標籤,不含課本內容)。
- `image` / `audio`: **必須標註授權與來源**;無授權者不得提交。

### 4.3 pet_state(僅 pet app,存 IndexedDB,不進 repo)
```ts
interface PetState {
  petId: string;
  species: 'fox' | 'cat' | 'dragon';
  level: number;
  xp: number;
  evolutionStage: number;     // 0,1,2...
  unlockedCosmetics: string[];
  collection: string[];        // 已學會的 kana/word id
  lastPlayed: string;          // ISO
}
```

### 4.4 unit_lessons.json — 教學設計單(每課一筆,進度與遊戲生成的核心)

**這是把實體教材「合法萃取」的成果。** 家長/老師拿到一課課本後,只填寫「教學概念」與「自選詞彙」,不抄課文、不抄插圖、不抄練習題的具體版面。教學概念與教學結構不受著作權保護;具體表達才受保護。

```json
{
  "unit_id": "mitsumura_g1_kaki_to_kagi",
  "source_ref": { "publisher": "光村圖書", "grade": "小1", "page_hint": "p.40-41" },
  "unit_name_zh": "柿子與鑰匙(濁音半濁音入門)",
  "learning_concept": "濁音(゛)與半濁音(゜)會改變發音與意義",
  "sub_goals": [
    "聽辨清音/濁音/半濁音的差異",
    "看辨字形上有無濁點/半濁點",
    "理解一個點點會改變整個詞的意思",
    "能在正確位置加上濁點寫出詞"
  ],
  "target_kana_pairs": [
    ["か","が"],
    ["き","ぎ"],
    ["さ","ざ"],
    ["と","ど"],
    ["ふ","ぶ","ぷ"]
  ],
  "teaching_structure": ["recognize", "minimal_pair", "produce"],
  "suggested_game_modes": [
    "kana_catch_minimal_pair",
    "kana_catch_word_to_image",
    "dakuten_drag"
  ],
  "concept_words": [
    { "id": "w_kasa",   "word": "かさ",   "meaning_zh": "傘",     "pair_with": "w_kazan" },
    { "id": "w_kazan",  "word": "かざん", "meaning_zh": "火山",   "pair_with": "w_kasa"  },
    { "id": "w_tsuki",  "word": "つき",   "meaning_zh": "月亮",   "pair_with": "w_tsugi" },
    { "id": "w_tsugi",  "word": "つぎ",   "meaning_zh": "下一個", "pair_with": "w_tsuki" },
    { "id": "w_mato",   "word": "まと",   "meaning_zh": "箭靶",   "pair_with": "w_mado"  },
    { "id": "w_mado",   "word": "まど",   "meaning_zh": "窗戶",   "pair_with": "w_mato"  }
  ],
  "dakuten_drag_items": [
    { "base": "くき",   "target": "かき",   "meaning_zh": "柿子",   "mark_at": [0], "mark": "dakuten"     },
    { "base": "さふとん","target": "ざぶとん","meaning_zh": "坐墊",  "mark_at": [0,1],"mark": "dakuten"     },
    { "base": "とんくり","target": "どんぐり","meaning_zh": "橡實",  "mark_at": [0,2],"mark": "dakuten"     }
  ]
}
```

**欄位規則(給 Gemini 與家長共同填寫的契約):**

| 欄位 | 來源 | 版權風險 |
|---|---|---|
| `unit_id` | 自訂,規則:`{publisher}_{grade}_{slug}` | 無(事實索引) |
| `source_ref` | 標註課本出處,僅供家長對照 | 無(事實標註) |
| `learning_concept` / `sub_goals` | 家長/老師用**自己的話**寫教學概念 | 無(概念不受保護) |
| `target_kana_pairs` | 語言事實 | 無 |
| `teaching_structure` | 列舉值:`recognize` / `minimal_pair` / `produce` / `listen_pick` / `write` | 無(教學法不受保護) |
| `concept_words` | **自選詞**,不照抄課本詞表;每個詞須有對應 vocabulary.json 條目(自有圖/音) | 無(若詞彙與圖音皆自有) |
| `dakuten_drag_items` | 自選的「無濁點 → 加濁點」題目 | 無(自選即可) |

**禁止寫入此檔的內容**(任何 agent 都不得提交):
- ❌ 課本原文詩句、課文段落
- ❌ 課本插圖檔名或描述性重述(例如「猴子拿著一串鑰匙站在玄關的圖」這類細節描述也避免)
- ❌ 課本練習題的具體題目版面(可參考其**教學結構**,不可複製其**具體選項組合**)

**TypeScript 型別:**
```ts
type TeachingStep = 'recognize' | 'minimal_pair' | 'produce' | 'listen_pick' | 'write';
type GameModeId   = 'kana_catch_listen' | 'kana_catch_minimal_pair' | 'kana_catch_word_to_image'
                  | 'dakuten_drag' | 'kotodama_summon' | 'karaoke_rhythm' | 'echo_record' | 'write_canvas';

interface UnitLesson {
  unit_id: string;
  source_ref: { publisher: string; grade: string; page_hint?: string };
  unit_name_zh: string;
  learning_concept: string;
  sub_goals: string[];
  target_kana_pairs: string[][];
  teaching_structure: TeachingStep[];
  suggested_game_modes: GameModeId[];
  concept_words: ConceptWord[];
  dakuten_drag_items?: DakutenDragItem[];
}
interface ConceptWord {
  id: string; word: string; meaning_zh: string; pair_with?: string;
}
interface DakutenDragItem {
  base: string; target: string; meaning_zh: string;
  mark_at: number[]; mark: 'dakuten' | 'handakuten';
}
```

### 共用規則
- 兩個 app 讀取**相同的 kana.json / vocabulary.json / unit_lessons.json**。
- 任何 schema 變更須向後相容或同步更新兩 app 的型別。
- 所有 JSON 須通過 JSON Schema 驗證(Gemini 須附 schema)。
- **每一筆 `unit_lessons` 在合併進 main 前,須由家長人工 review 並在 PR 勾選「無侵權內容」確認框。**

### 4.5 levels.json — 冒險關卡資料（Adventure 系統）

檔案位置:`data/levels.json`；Schema 位置:`schemas/levels.schema.json`。

```ts
interface Region {
  region_id: string;    // 例:"region_tutorial"、"region_meadow"
  name_zh: string;      // 例:新手村、平原
  order: number;        // 0, 1, 2, ...
  asset_hint: string;   // 給 SVG 繪製者的提示
  level_ids: string[];  // 該區域的關卡清單
}

interface Level {
  level_id: string;             // 例:"lv_01_tutorial"、"lv_06_boss_1"
  level_number: number;         // 1, 2, 3, ...
  level_type: 'tutorial' | 'lesson' | 'boss';
  region_id: string;
  title_zh: string;
  subtitle_zh?: string;
  story_intro_zh?: string;      // 關卡開場一句話
  unit_id?: string;             // 對應 unit_lessons.json；boss/tutorial 可為空
  challenges: Challenge[];      // 該關的小遊戲清單
  boss_review_units?: string[]; // 僅 boss 關:複習哪幾課
  scene_hint?: string;          // 場景視覺提示,給 SVG 繪製者
  xp_reward: number;            // 完成獎勵
  stars_criteria: StarsCriteria;
}

interface Challenge {
  challenge_id: string;
  game_mode: GameModeId;
  config_overrides?: Record<string, unknown>;  // 覆蓋該遊戲的預設 config
  required_for_completion?: boolean;           // 預設 true
}

interface StarsCriteria {
  one: 'complete';
  two: 'one_challenge_above_accuracy';
  three: 'all_challenges_above_accuracy';
  accuracy_threshold: number;  // 預設 0.7
}
```

**大魔王節奏(已確認):每 5 關一個週期 — 4 關內容 + 1 關大魔王。**
- `lv_06_boss_1` 複習 L2–L5；`lv_11_boss_2` 複習 L7–L10；以此類推。

### 4.6 AdventureProgress（IndexedDB,不進 repo）

```ts
interface AdventureProgress {
  current_level_id: string;    // 下一個要玩的關
  completed_levels: {
    [level_id: string]: {
      completed_at: string;    // ISO 日期
      stars: 1 | 2 | 3;
      best_accuracy: number;
      times_played: number;
    };
  };
  unlocked_regions: string[];
  collected_medals: string[];  // 大魔王勳章 ID 清單
}
```

---

## 5. 遊戲規格

### 5.1 假名抓抓樂(Kana Catch)

由 `unit_lessons.json` 的 `suggested_game_modes` 決定要用哪個子模式。三個子模式共用同一套落下泡泡與夥伴接物的視覺骨架,差別只在「目標是什麼」與「泡泡上顯示什麼」。

#### 子模式 A:`kana_catch_listen`(基本聽音點字,五十音學習用)
- 語音念目標音(例:「か」),落下的泡泡上是不同假名。
- 點對的那顆 → 爆開 + 夥伴接住。
- 適用單元:無 `unit_id` 的「自由練習」,或單純五十音複習。

#### 子模式 B:`kana_catch_minimal_pair`(最小對比,對應 recognize/minimal_pair 教學步驟)
- 從 `target_kana_pairs` 取一組(例 `["か","が"]`)。
- 語音念其中一個(「が」),落下的泡泡**同時包含「か」與「が」交替出現**。
- 強迫孩子辨識「有沒有那兩點」。
- 答對泡泡爆開時播放清晰的對比音(把「ka」「ga」並排再念一次),強化聽辨。

#### 子模式 C:`kana_catch_word_to_image`(看圖配詞,對應 minimal_pair → produce 之間的橋樑)
- 畫面中央顯示一張圖(例:鑰匙的圖,取自該 unit 的 `concept_words`)。
- 落下的泡泡上是**詞**(不是單字),例如「かぎ」「かき」「かさ」混合落下。
- 孩子要接住與圖對應的詞(かぎ)。
- 這把「字形差異」連到「意義差異」,是這個遊戲最有教學價值的子模式。

#### 共用難度參數
```ts
type KanaCatchSubMode = 'listen' | 'minimal_pair' | 'word_to_image';

interface KanaCatchConfig {
  subMode: KanaCatchSubMode;
  unitId?: string;             // 若指定,從該 unit 抽題
  fallSpeed: number;           // px/s
  maxBubbles: number;
  showRomajiHint: boolean;     // 子模式 A/B 適用
  showImageHint: boolean;      // 子模式 A 適用(字旁加小圖)
  includeDakuon: boolean;
  includeHandakuon: boolean;
  includeYouon: boolean;
  comboEnabled: boolean;
  roundLength: number;
}
```
- 幼齡:fallSpeed 低、maxBubbles 3、hint 全開、無 combo。
- 進階:fallSpeed 高、maxBubbles 5–6、含濁拗音、combo 開。

### 5.2 拖濁點(Dakuten Drag)— 新玩法,對應 produce 教學步驟

對應課本「自己加上濁點 / 半濁點寫出正確的詞」的練習,但用數位形式才能做到的觸覺互動。

#### 玩法
1. 畫面中央顯示一個**沒有濁點/半濁點的詞**(例:「くき」)+ 對應的圖(柿子的圖)。
2. 語音念出**目標詞的正確發音**(「かき」)。
3. 畫面下方有 1–3 顆可拖曳的「゛」濁點或「゜」半濁點。
4. 孩子要把點點**拖到正確的字上**(拖到「く」變「ぐ」是錯,拖到該變的位置才對)。
5. 拖對:該字「叮」一聲變身、發光、夥伴接住詞、整個詞重新播音。
6. 拖錯:點點彈回原位,**無懲罰**,夥伴歪頭表情 + 再播一次目標音提示。
7. 一個 round 約 6–10 題。

**重要設計:** 這題的「答對」必須是**該字+該點對應到該詞**,而不是「隨便加滿」。如「ざぶとん」要在「さ」與「ふ」兩處都加濁點,任一缺漏都不算完成。

#### 資料來源
直接讀取 `unit_lessons.json` 的 `dakuten_drag_items`。

#### 設定
```ts
interface DakutenDragConfig {
  unitId: string;              // 必填,從該 unit 的 dakuten_drag_items 抽題
  showImageHint: boolean;
  showRomajiHint: boolean;
  autoPlayAudioOnLoad: boolean;
  roundLength: number;
}
```
- 幼齡:hint 全開、自動播音、roundLength 6。
- 進階:hint 關、roundLength 10、可加計時挑戰(可選)。

#### 視覺與動畫要點
- 詞用大字呈現,每個字佔一格,**格子上方有微微脈動的「插槽」提示**(讓孩子知道這裡可以放東西)。
- 拖曳中,目標字格高亮放大。
- 拖對的瞬間:該字從「く→ぐ」做形變動畫(濁點掉下來貼上去 + 字體閃光)。
- 完成整詞:**整個詞被夥伴一口吃掉**,接到 XP 結算。

### 5.3 學習邏輯(三遊戲共用)
- 出題優先抽「最近答錯」與「久未複習」的項目(簡化版 SRS,演算法放 `/src/lib/srs.ts`)。
- SRS 的 unit 是 `kana_id`(子模式 A/B)、`word_id`(子模式 C)、`dakuten_item_id`(5.2)。
- 每答完一題,更新熟練度與 `pet_state.collection`。
- round 結束結算 XP → 餵養夥伴 → 可能觸發進化動畫。

### 5.4 統一遊戲介面(供未來小遊戲擴充)
所有小遊戲實作此契約,新遊戲符合介面即可插入世界觀:
```ts
interface GameModule<TConfig = unknown, TAnswer = unknown> {
  id: GameModeId | 'kana_catch_listen';
  start(config: TConfig): void;
  onAnswer(input: TAnswer): AnswerResult;     // { correct, itemId, latencyMs }
  onComplete(): GameResult;                    // { xpGained, accuracy, items }
  destroy(): void;
}
```
新增小遊戲時:在 `GameModeId` 加新值 → 在 `unit_lessons.suggested_game_modes` 可選用 → 實作 `GameModule`。

### 5.5 寵物養成串接
- `GameResult.xpGained` → 加到 `pet_state.xp`。
- XP 跨過門檻 → `evolutionStage++` → 播放進化 Lottie 動畫 + 音效。
- 連續登入/每日任務(餵 3 次、抓 10 個假名、解 1 個 dakuten 題目)給額外獎勵。
- 圖鑑頁:回看已學假名與詞,可點播發音。

---

## 5.x 「說」的遊戲設計哲學(§5.6–5.8 共用)

「說」不做成評分題,做成**因果互動**:孩子說出一個音 → 世界發生一件事。

**鐵則:**
1. **沒有 ❌、沒有「錯誤」字眼、沒有分數**。沒過就是「目標還在睡」「咒語還不夠強」,而不是「你錯了」。
2. **Tier 2(音量偵測)是主機制,不是 Tier 1(語音識別)**。理由見 §3.x.1。
3. **連續 3 次未過 → 自動降低判定門檻**,避免卡關打擊信心。
4. **麥克風總開關預設關**,且第一次開啟時必須跳過家長端確認。
5. **聲音資料完全本地,不上傳**(離線模式下);若家長開啟增強模式,須明確告知 Tier 1 會送雲端。

### 5.6 ことだま召喚(Kotodama Summon)— 「說」主遊戲

對應 `unit_lessons.json` 的 `concept_words`。每個詞對應一個視覺事件,孩子用聲音召喚它發生。

#### 玩法
1. 場景中有一個「等待被啟動的事物」(種子、燈籠、睡著的夥伴、緊閉的寶箱、被烏雲遮住的太陽……)
2. 畫面上方顯示目標詞:大字假名 + 對應 SVG 圖 + 喇叭鍵(可聽範本,可重複聽)
3. 畫面下方有「按住說話」鍵(walkie-talkie 風格,圓形大按鈕,直徑 ≥ 96px)
4. 孩子按住 → 開始錄音 + 即時聲波視覺化(從麥克風向外擴散的同心圓)
5. 鬆開 → 判定:

| 判定結果 | 視覺反應 | XP |
|---|---|---|
| `perfect`(Tier 1 識別到) | 🎆 華麗版動畫:粒子撒滿畫面、夥伴歡呼跳躍、目標完全綻放 | 雙倍 |
| `good`(Tier 2 達標) | ✨ 普通版動畫:目標啟動但較簡單 | 正常 |
| `weak`(有微弱聲) | 🌬 目標抖一下,提示「再大聲一點?」 | 0 |
| `silent` | 沒反應(避免讓孩子覺得自己「失敗」) | 0 |

6. 嘗試 3 次仍未達 `good` 以上 → 系統自動降門檻(對孩子不可見),下次幾乎只要有聲音就 `good`。
7. 一個 round 約 5–8 個詞,單次 3–5 分鐘。

#### 視覺事件對照(由 `kotodama_scene` 欄位設定)

| 目標詞 | 場景對比 | 設計重點 |
|---|---|---|
| かさ ↔ かざん | 雨停太陽出來 ↔ 火山噴煙震動 | 念錯一個濁點是完全不同的世界 |
| つき ↔ つぎ | 白天變黑夜月亮升起 ↔ 書頁翻過去 | 清音/濁音觸發截然不同的事件 |
| まと ↔ まど | 草地豎起箭靶 ↔ 牆上開窗風吹進來 | 辨識動機自然產生 |
| かみ ↔ かに | 卷軸展開成紙 ↔ 沙裡爬出螃蟹 | 最大化視覺差異 |

`kotodama_scene` 的四個欄位(`initial_state`、`success_state`、`asset_hint`、`anim_hint`)供 Claude Code 繪製 SVG 與編排 Framer Motion 動畫,不需再問設計細節。

#### Config
```ts
interface KotodamaConfig {
  unitId?: string;
  targetWords: string[];              // word_id 陣列;若空,從 unit 抽
  attemptsBeforeEasyPass: 3;
  showRomajiHint: boolean;            // 幼齡模式 true
  autoPlayPronunciationOnLoad: boolean;
  roundLength: 5 | 6 | 7 | 8;
}
```

#### 必測項目
- [ ] Tier 2 主機制:小聲說「ㄚㄚㄚ」(不是目標詞)達 300ms 以上 → `good`(離線模式預設關 Tier 1)
- [ ] Tier 1 增強模式下,清楚說「かさ」→ `perfect`;說「ㄚㄚㄚ」→ `good`
- [ ] 連續 3 次 `weak` → 第 4 次門檻自動降低
- [ ] 家長端關閉麥克風 → 孩子端看不到 ことだま 入口
- [ ] 麥克風權限被拒 → 顯示家長端提示,不崩潰
- [ ] 錄音檔在 round 結束後從記憶體清除(除非家長開啟保留)
- [ ] 永遠不顯示「錯誤」「失敗」「不對」等字眼

---

### 5.7 リズム唱(Rhythm Sing)— 節奏跟唱

訓練日文音拍(mora)感與口語流暢度。**只用 Tier 2**——這遊戲不檢查內容對錯,只檢查「有沒有在 timing window 內出聲」。

#### 玩法
1. 假名/詞從右往左滑過畫面,每個字佔一拍。
2. 字過「判定線」時,孩子要在那一拍唸出來。
3. 判定:在 timing window(±200ms)內偵測到發聲 → `hit`;沒偵測到 → `miss`(但沒懲罰,字繼續飛過去)。
4. 連續 hit 累 combo,夥伴在畫面底部跟著打拍子點頭、combo 越高跳得越高。
5. 一首約 30–60 秒,結束結算 hit 率與最高 combo。

#### 教學價值
日文是音拍語言(mora-timed),每個假名一拍,跟中文/英文不同。跟著節拍唸 → 自然形成「一字一拍」的肌肉記憶。

#### Config
```ts
interface RhythmConfig {
  bpm: 60 | 80 | 100 | 120;         // 幼齡 60-80,進階 100-120
  trackId: string;                  // 對應 src/data/rhythm_tracks.json
  timingWindowMs: 200;
  bgmVolume: number;                // 0-1;MVP 階段用節拍器聲,不需 BGM
}
```

#### 資料層(`src/data/rhythm_tracks.json`)
詳見 `src/data/schemas/rhythm_tracks.schema.json`。曲目的 `sequence` 陣列每個元素佔一拍,可為單一假名或詞。

#### 必測項目
- [ ] 偵測到發聲 → 該字「亮」+ combo +1;沒偵測到 → 字滑過去,combo 歸零(但無扣分、無紅字)
- [ ] 不檢查說的內容對錯,只檢查 timing
- [ ] BGM 音量可獨立調整(避免蓋掉孩子聲音的偵測)
- [ ] miss 動畫不可使用 ❌、紅色、X 等字樣

---

### 5.8 こだま(Echo Record)— 錄音對照

全域功能,不是獨立關卡。任何顯示假名/單字的地方都可長按啟動。

#### 玩法
1. 在單字卡、抓抓樂結算頁、圖鑑等任何字旁,**長按那個字** → 彈出 こだま 介面。
2. 自動播一次範本音 → 「換你說說看」→ 錄 2 秒 → 播孩子錄的 → 可以重來。
3. **完全不評分**,純粹「自己聽自己跟老師有什麼不一樣」。
4. 可選「並排比對」:把範本與孩子的錄音畫成波形並排(不解讀波形,單純視覺化)。

#### Config
```ts
interface EchoConfig {
  modelAudioSrc: string;     // 範本音(TTS 即時或預存)
  recordDurationMs: 2000;
  showWaveform: boolean;     // 預設 true,可在家長端關
  allowRetry: true;
}
```

#### UI 規格
- 全域元件:`<EchoButton word={...}/>`，放在所有單字呈現處
- 長按啟動,避免誤觸
- 介面極簡:三個圓形大鍵 — ⏵範本 / ⏺錄音 / ⏵我的

#### 必測項目
- [ ] 長按單字 → 彈出 こだま 介面;短按不觸發
- [ ] 錄音 2 秒後自動停止
- [ ] 退出介面後錄音 Blob 被釋放
- [ ] 麥克風關閉時,EchoButton 隱藏或灰階(不可點)

---

## 5.y 共通設計細節(§5.6–5.8)

### 視覺
- 麥克風按鈕:**圓形,直徑 ≥ 96px**(比一般按鈕大,易於兒童按住)
- 錄音中:按鈕本身有 pulse 動畫 + 從按鈕發散的聲波同心圓
- **沒有 ❌、X、紅叉**;失敗用「夥伴歪頭」「目標還在睡」這類軟性視覺

### 聲音設計
- 錄音中的提示音:極輕、短(不蓋過孩子)
- 成功音:溫暖、有質感(不要尖銳的 ding)
- 「再試試?」提示音:詢問語氣,不是錯誤音

### 動畫
- ことだま 成功動畫**至少 1.5 秒**,要有戲劇感
- 動畫期間禁用其他互動(避免孩子連點)

### 文案(中文,孩子端)
- ✅「按住說話」「再大聲一點?」「咒語成功了!」「目標還在睡,再試試?」
- ❌「請大聲念」「發音錯誤」「答錯了」「再試一次」

### 無障礙
- 麥克風鍵需有 `aria-label="按住說話"`
- 鍵盤可用:長按空白鍵等同長按
- 聾啞或不便發聲的孩子,家長端可關閉「說」三遊戲,App 仍完整可用

---

## 5.A 冒險模式(Adventure Mode)

> **已確認設計決定（家長 review 後，不必再問）**
>
> | 項目 | 決定 |
> |---|---|
> | 地圖 SVG 視覺風格 | 與 kotodama_scene 一致的童趣 SVG；可參考 irasutoya.com 的插圖風格作為靈感，但所有地圖 SVG 須為原創繪製（不可直接嵌入 irasutoya 圖片，商業用途限制每產品 ≤ 20 張） |
> | 寵物移動方式 | **走路動畫**：完成一關後，寵物在地圖上用循環走路動畫移動到下一關位置 |
> | 大魔王しずか影外觀 | 風格參考：鬼（怖い鬼）× 巨大暗影生物（ビッグフット × ワイバーン）— 黑色雲狀體、兩顆白光眼、周圍漂浮詞彙泡泡；以原創 SVG 繪製 |
> | 星星評分 accuracy 門檻 | **0.7**（spec 預設值，不調整） |
> | XP 數值 | §5.B 數值確認；必須確保「完成新手村 → 觸發第一次進化」 |

### 首頁（`/`）— 雙入口

孩子每次打開 App 看到的第一個畫面。

```
   ╔══════════════════════════╗
   ║    [夥伴的大頭像]         ║
   ║                          ║
   ║   ⚔  繼續冒險(主)        ║
   ║                          ║
   ║   🎯  自由練習(次)        ║
   ║                          ║
   ║   ⚙ (家長,角落)           ║
   ╚══════════════════════════╝
```

- **繼續冒險 / 開始冒險**(同一按鈕,文案依進度切換)
  - 第一次:`開始冒險`,進入「故事開場 → 新手村」
  - 之後:`繼續冒險`,直接進地圖,鏡頭聚焦下一個未完成關卡
- **自由練習**:進入現有 `/play` UI;每完成一 round 給「練習 XP」(冒險 XP 的 30%),不推進地圖
- **家長設定**:小尺寸齒輪放角落,點擊跳 PIN → `/parent`

**路由表更新:**

| 路由 | 用途 |
|---|---|
| `/` | 首頁(雙入口)— **新增** |
| `/adventure` | 地圖總覽 — **新增** |
| `/adventure/level/:level_id` | 進入某一關 — **新增** |
| `/play`(現有) | 自由練習主畫面 |
| `/parent` | 家長端 |

### 地圖（`/adventure`）

橫向可滑動的島嶼地圖;已喚醒區域彩色,未喚醒區域灰階。

- **已完成關卡**:亮的旗幟/燈籠,可重玩
- **下一關**:閃爍脈動的圓點
- **未解鎖關卡**:鎖頭圖案,點擊 → 抖一下 + 提示「先完成上一關」
- **大魔王關**:特殊地標(鳥居/洞穴/塔),壓在跨區域邊界上
- 寵物在地圖上跟著你走,完成一關後以**走路循環動畫**移動到下一關位置（CSS animation 或 Lottie 精靈圖均可）

```
🌫(新手村)══🌳(L2)══🌳(L3)══🌳(L4)══🌳(L5)══[⛩ Boss1]══🌳(L7)══...
   區域 0      ←────── 區域 1:平原 ──────→         ←── 區域 2:森林
```

### 關卡內部（`/adventure/level/:id`）

```
[1. 開場動畫]
   - 場景以灰階呈現(取自 kotodama_scene 對應 unit)
   - 旁白氣泡:「這裡好安靜...讓我們把聲音找回來!」

[2. 挑戰清單頁]
   - 列出本關 3–5 個小遊戲,每個一張卡片
   - 標示「⚪ 未完成」/「✅ 完成」,進度條 0/N

[3. 完成一個小遊戲]
   - 結算:XP + 夥伴動畫 + 對應場景元素恢復顏色
   - 場景元素 ↔ 遊戲類型對應:
     | 遊戲 | 恢復元素 |
     |---|---|
     | kana_catch_* | 天空/雲 |
     | write_canvas | 樹/草/山 |
     | kotodama_summon | 太陽/月亮 |
     | karaoke_rhythm | 風/動物 |
     | echo_record | 細節裝飾(花、石頭) |
     | dakuten_drag | 文字/招牌 |

[4. 全部完成]
   - 場景全彩爆發 + 夥伴歡呼
   - 結算:總 XP、星星評分(1–3)、寵物 XP + 進化檢查
   - 「回地圖」按鈕,地圖上該關亮起
```

**星星評分(每關):**

| 星星 | 條件 |
|---|---|
| ⭐ 1 | 完成所有 `required_for_completion: true` 的挑戰 |
| ⭐ 2 | 1 + 任一挑戰正確率 ≥ `accuracy_threshold`(預設 0.7) |
| ⭐ 3 | 1 + 所有挑戰正確率 ≥ 門檻 |

**重要**:星星不是「過關門檻」,只是「優秀紀錄」。沒拿到星星仍可進下一關,且不顯示為「失敗」。

### 大魔王關（`level_type: "boss"`）

跟一般關完全不同:黑暗場景,中央是「**しずかの影**」——黑色雲狀體、兩顆發白光的眼睛、周圍漂浮著前幾課學過詞彙的「破碎發音泡泡」。外觀風格：鬼＋巨大暗影生物（參考怖い鬼 / ビッグフット / ワイバーン的童趣詭異感），以原創 SVG 繪製。

**三波挑戰:**

| 波次 | 內容 | 題數 |
|---|---|---|
| 1 | 從 `boss_review_units` 隨機抽聽辨/讀題 | 5 |
| 2 | 隨機抽寫字題 + 拖濁點題 | 3 |
| 3 | 從前幾課 `concept_words` 用「說」喚醒 | 3 |

- 每答對一題 → しずか影縮小一點(可見進度)
- 答錯不擴大影、不扣血(維持無懲罰原則)
- 第 3 波連續錯 3 題 → 系統悄悄降低難度(題目更基礎、干擾選項更少)
- **絕不顯示「你失敗了」**

**獎勵:**
- 大量 XP(一般關 3 倍)
- 一枚「**ことだま勳章**」進入收藏冊
- 解鎖下一個區域的關卡

---

## 5.B XP / 經驗值規則(整體經濟設計)

| 來源 | XP |
|---|---|
| 冒險:完成一個小遊戲 | 10–30(依難度) |
| 冒險:完成整關 | +50(bonus) |
| 冒險:整關 3 星 | 額外 +30 |
| 大魔王:完成 | 200 |
| **自由練習:完成一 round** | **冒險的 30%** |
| 重玩已完成關(第 1 次) | 50% |
| 重玩已完成關(第 2 次) | 25% |
| 重玩已完成關(第 3 次起) | 10% |

**寵物進化門檻:**

| 等級 | XP 門檻 | 里程碑 |
|---|---|---|
| Lv 1 → 2 | 300 | 完成新手村 + 第 1 課即可達到(確保孩子早看到成就感) |
| Lv 2 → 3 | 1000 | 約完成大魔王 1 |
| Lv 3 → 4 | 2500 | |
| 之後每升一級 | +2000 | |

**Claude Code 實作時可微調數值,但必須確保「完成新手村就會經歷一次進化」。**

---

## 6. 交付階段(每階段獨立可驗收)

| 階段 | 內容 | 產出 |
|---|---|---|
| S0 | 共用資料層 + 型別 + JSON Schema 驗證(含 unit_lessons) | `/data`, `/src/types`, schema |
| S1 | 專案接線:TTS wrapper、Howler 音效層、IndexedDB(Dexie)、路由 `/play` `/parent` | 可跑骨架 |
| S2 | 寵物系統:pet_state、XP、進化動畫、圖鑑 | 寵物可成長 |
| S3 | 假名抓抓樂 — 子模式 A `listen`(幼齡)+ GameModule 介面 | 可玩 round |
| S4 | 假名抓抓樂 — 子模式 B `minimal_pair`、子模式 C `word_to_image` + SRS 出題 + 課程選擇器(由 unit_lessons 驅動) | 課本進度可選 |
| S5 | 拖濁點(Dakuten Drag)遊戲 | produce 步驟可玩 |
| S6 | 家長端:進度/正確率/時長、PIN、模式設定、unit 啟用切換 | 家長儀表板 |
| **S6.5(新):冒險骨架** | 路由 `/`(雙入口)、`/adventure`(地圖)、`/adventure/level/:id`、levels 資料層、進度 IndexedDB、地圖 UI 骨架(無動畫先做結構) | 地圖可顯示、可點關卡 |
| **S6.6(新):關卡內部** | 挑戰清單頁、串接既有小遊戲、完成流程、星星評分、場景元素上色、結算頁 | 完整關卡流程可走通 |
| **S6.7(新):新手村 + 第 1 課** | 把 levels.json 填上具體內容,讓孩子可實際走完前兩關(真實驗證點) | 可給孩子試玩 |
| **S6.8(新):大魔王關** | 三波戰鬥邏輯、しずか影 SVG、難度救援機制、勳章系統 | 第一個完整冒險循環封閉 |
| S7 | 每日任務 + 裝飾獎勵(Cosmetics) | 打卡遊玩動機 |
| S8 | かな書き練習(Canvas 寫字 + 像素相似度判分) | 「寫」能力可玩 |
| **S9 ことだま 基礎** | Mic 權限流程 + 家長端隱私設定 + Tier 2/3 引擎 + ことだま 主遊戲 + 場景 SVG(先 3 個範例給家長確認風格) | 主「說」遊戲可玩 |
| **S10 リズム唱** | 節奏引擎 + rhythm_tracks 資料 + 節拍器聲 | 節奏遊戲可玩 |
| **S11 こだま 全域** | EchoButton 元件 + 全域接入(單字卡、結算頁、圖鑑) | 錄音對照可用 |
| **S12 增強模式(可選)** | Tier 1 接入 + 家長端切換 + 雙倍 XP 邏輯 | 識別獎勵 |
| **S13 PWA + 打磨** | Framer Motion 過場、音效優化、無障礙審查、Playwright E2E | 可上線 |

每階段須附:該階段測試規格(交 Haiku)+「如何手動驗證」說明。
**順序執行,前一階段測試通過才進下一階段。**

---

## 7. 各 Agent Harness

### Gemini(資料收集)
- 產出 `kana.json`(完整五十音,含難度分級)。
- 依家長提供的「每課詞彙清單」產出 `vocabulary.json`(綁 `unit` 進度碼)。
- 依家長提供的「教學概念摘要」,協助產出 `unit_lessons.json` 草稿,**自選詞由家長最終定稿**(Gemini 不得從課本掃描檔抄詞)。
- 為每個單字建議 CC0/免費商用圖,**逐一標註授權與來源 URL**。
- 調查報告 `licensing_report.md`:光村教材版權邊界、Web Speech ja-JP 各瀏覽器支援現況(2025–2026)、免費 ja-JP TTS 備援方案與授權、台灣個資法與兒童 App 隱私要點。
- 附 JSON Schema 供驗證(含 `unit_lessons.schema.json`)。
- **不寫應用程式碼。不得提交任何課本掃描原文、課文詩句、課本插圖描述。**

### Codex / Claude Code Sonnet(實作)
- 嚴格遵守 §1 版權、§3 技術約束、§4 schema、§5 遊戲規格。
- 按 §6 階段順序實作;每階段一個可獨立 review 的 PR。
- 動畫/音效集中管理(`/src/lib/audio.ts`、`/src/lib/tts.ts`);遊戲難度集中於設定檔。
- 三個 Kana Catch 子模式共用同一個 `KanaCatchEngine`,差別只在「題目來源」與「泡泡內容渲染」,**不可複製貼上成三份**。
- Dakuten Drag 必須驗證「該字+該點對應到該詞」,不可用「加滿就算對」的簡化邏輯。
- 每個 PR 描述須註明:是否影響共用資料層 / 是否影響 build app / 是否新增 GameModeId。
- 提交前通過 `tsc --noEmit` + `eslint` + `vitest run`。

### Haiku(測試)
逐項回報 pass/fail + 失敗重現步驟:

**Kana Catch 共用:**
- [ ] 子模式 A 聽音:點對 → 正回饋+夥伴接住;點錯/落地 → 無懲罰、立即下一題
- [ ] 子模式 B 最小對比:「か/が」目標為「が」時,點到「か」不算對(對比辨識正確)
- [ ] 子模式 C 看圖配詞:圖為鑰匙時,接住「かぎ」算對、「かき」不算對
- [ ] TTS:念 ja-JP 目標音/詞;無語音時 fallback 不崩潰
- [ ] 難度:幼齡/進階參數正確套用
- [ ] SRS:答錯的項目更快重新出現(三子模式各驗一次)

**Dakuten Drag:**
- [ ] 「くき」拖濁點到「く」→ 變「ぐき」→ 算錯,點點彈回,無懲罰
- [ ] 「くき」拖濁點到「き」→ 變「かき」?**注意:此題目標是「かき」需在「く→か」做的不是濁點而是字本身**;確認規則:dakuten_drag 只處理「相同假名+濁點」變化,題目資料須保證 base→target 確實只差濁點位置(`mark_at`)
- [ ] 「さふとん」需在兩處(0,1)都正確加濁點才算完成;只加一處不算完成
- [ ] 完成整詞 → 播放正確發音 + 夥伴吃掉動畫 + XP 結算
- [ ] 拖曳邊界:拖出畫面外 → 彈回;拖到無效格 → 彈回不崩潰

**其他:**
- [ ] 寵物:XP 累積、跨門檻觸發進化、圖鑑可回看與播音
- [ ] 家長端:時長/正確率正確;PIN 有效;模式設定生效;unit 啟用切換正確過濾出題
- [ ] 課程選擇器:依 `unit_lessons.suggested_game_modes` 顯示可玩的遊戲
- [ ] 離線:斷網仍可玩(PWA)
- [ ] 無障礙:按鈕有 aria-label、可鍵盤操作、按鈕 ≥ 64px、對比 AA
- [ ] 邊界:空/壞 JSON、IndexedDB 不可用(隱私模式)、連點快點不亂、孩子亂點不崩
**Adventure Mode(S6.5–S6.8):**
- [ ] 首次進入 App → 看到「開始冒險」,點擊 → 開場動畫 → 新手村
- [ ] 完成新手村 → 地圖第 2 關解鎖、寵物獲得 XP、可能觸發第一次進化
- [ ] 進地圖 → 鏡頭自動聚焦下一個未完成關卡
- [ ] 點未解鎖關卡 → 抖一下不進入,顯示提示「先完成上一關」
- [ ] 點已完成關卡 → 詢問是否重玩
- [ ] 關卡內任一小遊戲完成 → 場景對應元素變彩色、進度 +1
- [ ] 整關完成 → 結算頁顯示星星(1/2/3)、XP、進化檢查
- [ ] 大魔王關:三波結構正確、答錯不擴大影、連續錯 3 題後難度悄悄降低
- [ ] 自由練習完成 round → 給予冒險 30% XP、不解鎖新關卡、不推進地圖
- [ ] 重玩已完成關 → XP 依次衰減(50% → 25% → 10%)
- [ ] 家長端可看到當前進度、星星總數、勳章數
- [ ] 永遠不出現「失敗」「錯誤」字眼(含大魔王關)
- [ ] 離線可玩、進度存 IndexedDB
- [ ] 既有 `/play` 自由練習功能完整保留,無 regression

- 覆蓋率:`/src/lib`、`/src/store` ≥ 80%。

---

## 8. 給家長(你)的執行順序
1. 先讓 Gemini 出 `licensing_report.md` 與 `kana.json`,人工檢查。
2. 你離線 OCR 課本 → 整理出「每課詞彙清單」(只含假名/拼音/中文/課次)→ 交 Gemini 產 `vocabulary.json`。
3. Sonnet 照 S0→S6 做,每階段 Haiku 測過再前進。
4. **每階段讓孩子真的試玩**——6歲的真實反應會推翻假設,這是 agent 測不到的。
5. pet 跑順後,build app 複用資料層,另開規格開發。
