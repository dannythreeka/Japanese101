# Claude Code 開工指令(KICKOFF)

> **這份是你的工作流程主控文件。每次 session 開始,先讀本檔再讀其他檔。**
> 對象:Claude Code(sonnet,實作)。
> 目標:在現有 repo 上接續 MVP,演進為 production 級的 japanese101-pet。

---

## 0. 第一件事:Inventory(必做,不可跳過)

你接手的是已存在的 repo。動工前先做完整 inventory,而不是憑想像寫碼。

**先讀這幾份(本目錄):**
1. `KICKOFF.md`(本檔)
2. `SPEC.md`(產品規格,所有規範來源)
3. `unit_lessons.example.json`(第一課的教學設計單範例)
4. `data/kana.json`、`data/vocabulary.json`(MVP 學習資料)
5. `schemas/*.json`(資料驗證 schema)

**再讀現有程式碼:**
- `package.json`、`vite.config.ts`、`tsconfig*.json` — 確認既有依賴與設定
- 整個 `src/` — 列出已有元件、hook、store、路由
- `public/` — 列出既有素材
- `.github/workflows/` — 既有 CI

**完成 inventory 後,先輸出一份 `INVENTORY.md`(放在 repo 根目錄),內容包含:**

```markdown
# Inventory(YYYY-MM-DD)

## 既有功能
- (列出目前 MVP 已實作的功能,逐項標註對應 SPEC 哪一節)

## 既有檔案結構
- (主要目錄與用途,一句話描述)

## 與 SPEC 的差距
- 缺什麼:...
- 與 SPEC 衝突的設計:...
- 可重用的部分:...

## 我建議的合併策略
- (S0 應該怎麼做才能不破壞既有功能)

## 我有疑問要請家長決定的事
- (條列,每項給出選項與你的推薦)
```

**輸出後停下來,等家長 review,不要逕自動工。**

---

## 1. 工作模式硬性規則

### 一次只做一階段
按 SPEC §6 的階段順序:S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7。
**每階段一個 PR,跑完測試,等家長 review 後才進下一階段。**
不可一次做兩階段、不可跳階段、不可把多階段塞同一個 PR。

### 每階段結束須產出三樣
1. **程式碼變更** + 通過 `tsc --noEmit` + `eslint` + `vitest run`
2. **HANDOFF.md**(放本階段 PR 內),內容:
   - 本階段做了什麼(對應 SPEC 哪幾節)
   - 哪些檔案新增/修改
   - **給家長的手動驗證腳本**(逐步,寫給 6 歲孩子的家長能照做)
   - 已知限制與下階段建議
3. **測試結果**:Vitest 通過清單、覆蓋率報告

### 不可自作主張的事(必須先問家長)
- 視覺設計方向(寵物外型、配色、整體風格)
- 加新依賴超過 5 個(列出來請家長同意)
- 修改 `SPEC.md` 或 schema
- 修改 `unit_lessons.example.json` 的「教學概念」相關欄位(只可改你發現的範例資料錯誤,並在 PR 中標記)
- 任何牽涉版權判斷的事(若不確定,當作違規,改走自製路線)

### 問問題的方式
在 PR 描述開頭用一個明確區塊:
```
## 需要家長決定
- [ ] 問題 1:... (我推薦 A,因為...)
- [ ] 問題 2:... (我推薦 B,因為...)
```
**不要一次問超過 5 個問題。** 不重要的決定你自己定,在 HANDOFF.md 標記「我自己決定的事」。

---

## 2. 第一輪具體任務:S0(共用資料層 + 型別)

完成 INVENTORY.md 並等家長確認後,開始 S0。

### S0 範疇
1. 把 `data/kana.json`、`data/vocabulary.json`、`unit_lessons.example.json` 放進 repo 適當位置(建議 `src/data/`,或如既有結構不同,在 INVENTORY 階段討論)。
2. 在 `src/types/` 建立完整 TypeScript 型別:
   - `Kana`、`Word`、`Asset`、`UnitLesson`、`ConceptWord`、`DakutenDragItem`、`TeachingStep`、`GameModeId`
   - 型別必須與 `schemas/*.json` 完全對應
3. 建立資料載入器 `src/data/loaders.ts`:
   - `loadKana(): Promise<Kana[]>`
   - `loadVocabulary(): Promise<Word[]>`
   - `loadUnitLessons(): Promise<UnitLesson[]>`
   - `getLessonById(id): UnitLesson | null`
   - `getWordById(id): Word | null`
   - `getKanaByHiragana(char): Kana | null`
   - 每個 loader 都要 try/catch,失敗時 throw 帶上下文的 error
4. 建立 schema 驗證腳本 `scripts/validate-data.ts`:
   - 用 `ajv` 驗證三份 JSON 對應 schema
   - 加入 npm script:`"validate:data": "tsx scripts/validate-data.ts"`
   - 加入 CI:在 `.github/workflows/` 既有 workflow 加一步,或新增 workflow
5. 寫 Vitest:
   - loaders 各一個 happy path + 一個錯誤路徑(壞 JSON、找不到 id)
   - schema 驗證腳本對「故意壞掉的測試資料」要回報失敗
6. 更新 `package.json` 加必要依賴(`ajv`、`tsx` 等),**列出來在 PR 描述**。

### S0 不做的事
- ❌ 不寫遊戲邏輯
- ❌ 不寫 UI
- ❌ 不動 IndexedDB(那是 S1)
- ❌ 不生 SVG 圖片(那是 S4 真的要用時才生)

### S0 完成的驗收
- [ ] `pnpm validate:data`(或 npm/yarn 等等)通過
- [ ] `pnpm test` 通過
- [ ] `pnpm tsc --noEmit` 通過
- [ ] `pnpm lint` 通過
- [ ] 既有 MVP 功能**沒有壞**(這點最重要,在 HANDOFF.md 明確列出你怎麼驗證)
- [ ] HANDOFF.md 寫好

---

## 3. 圖片素材方針(SVG 簡筆)

S4 開始會用到 vocabulary 的圖。屆時請依下列規則生成。**S0 不要生圖。**

### 規則
- 每個 `vocabulary.json` 的 word.image.src 對應 `public/assets/img/svg/<id>.svg`
- 用純 SVG(`<svg viewBox="0 0 100 100">`),不用 base64、不用 raster
- 風格:**圓潤、童趣、高對比、3–5 種顏色內**
- 每張 SVG 檔案大小 < 5KB
- `license: self-created`(因為是你畫的)
- 每張圖要能讓 6 歲孩子一眼認出(月亮要圓+黃、傘要有把手、火山要有噴煙)
- 不模仿任何特定卡通角色;不使用任何商標
- 同一份 vocabulary 內風格要統一(配色協調、線條粗細一致)

### 生成前先給家長看 3 張範例
S4 開始時,**先生 3 張代表性 SVG(かさ、かざん、つき)放在 PR 中等家長確認風格**,再批次生其他。不要一口氣生 8 張結果風格被否決重做。

---

## 4. 版權鐵則(任何階段都必須遵守)

抄自 SPEC §1,但加重提示:
- ❌ Repo 內**永遠不可出現**:課本掃描檔、課本原文詩句、課本插圖、課本插圖的細節描述(連描述都不行)
- ❌ 不可用 OCR 工具去讀任何使用者可能上傳的課本圖片並輸出文字
- ✅ 可使用:`unit_lessons.json` 的教學概念與自選詞、`kana.json`(語言事實)、自畫 SVG、Web Speech TTS
- 任何時候不確定,**當作違規處理,改走自製路線並在 HANDOFF.md 報告**

---

## 5. 與既有 MVP 的相處原則

你接手的是有人寫過的程式碼。

- **優先重用**現有元件、現有 store、現有路由,而不是平行蓋一套。
- 若既有實作與 SPEC 衝突,**先在 INVENTORY.md 提出**,讓家長決定保留或重寫。
- 既有檔案如果只需調整,用 patch;不要整檔重寫(diff 會難讀)。
- 既有功能在你的 PR 後**必須仍可運作**,在 HANDOFF.md 寫驗證步驟。

---

## 6. 溝通格式(每個 PR)

```markdown
## 階段 SX:<標題>

### 對應 SPEC
- §X.X、§X.X

### 變更摘要
- (3–5 條,每條一句話)

### 新增依賴
- (套件名 + 版本 + 為何需要)

### 需要家長決定
- [ ] ...

### 我自己決定的事
- (你自行拍板的小決定,讓家長知道)

### 測試
- Vitest:X passed
- 覆蓋率:src/lib XX%、src/store XX%
- 手動驗證腳本:見 HANDOFF.md

### 已知限制
- (要在後續階段處理的事項)
```

---

## 7. 開工

讀完本檔後,從 **第 0 節 Inventory** 開始,輸出 `INVENTORY.md` 並停下。

不要直接進 S0。等家長 review INVENTORY.md 之後給綠燈,你才開始 S0。
