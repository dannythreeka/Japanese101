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

## 4. 資料層 Schema(pet 與 build 共用)

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
type GameModeId   = 'kana_catch_minimal_pair' | 'kana_catch_word_to_image' | 'dakuten_drag';

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
| S7 | PWA + 每日任務 + 收集獎勵 + 打磨動畫音效 | 可上線 |

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
- 覆蓋率:`/src/lib`、`/src/store` ≥ 80%。

---

## 8. 給家長(你)的執行順序
1. 先讓 Gemini 出 `licensing_report.md` 與 `kana.json`,人工檢查。
2. 你離線 OCR 課本 → 整理出「每課詞彙清單」(只含假名/拼音/中文/課次)→ 交 Gemini 產 `vocabulary.json`。
3. Sonnet 照 S0→S6 做,每階段 Haiku 測過再前進。
4. **每階段讓孩子真的試玩**——6歲的真實反應會推翻假設,這是 agent 測不到的。
5. pet 跑順後,build app 複用資料層,另開規格開發。
