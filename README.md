# Japanese101 - 兒童日語學習 App

這是一個專為 6-12 歲兒童設計的日語學習 Web App，結合了寵物養成與各種趣味小遊戲。

## 語音合成 (VOICEVOX)

本專案整合了 [VOICEVOX](https://voicevox.hiroshiba.jp/) 技術來生成高品質的日語發音。

### 如何增加音檔
1. 在 `src/data/vocabulary.json` 或 `kana.json` 增加新的單字或假名。
2. 執行生成腳本：
   ```bash
   npm run gen:voice
   ```
   腳本會自動掃描資料並補齊缺失的音檔。更多詳細操作請參考 [VOICEVOX 使用指南](./doc/skills/VOICEVOX.md)。

### 目前使用的參數
* **角色**: 四國めたん (Speaker 2)
* **特點**: 針對學習者優化，語速設定為 `0.87` (稍慢)，增加抑揚頓挫，語氣親切。

### 授權與商用
VOICEVOX 及其角色（如四國めたん）支援**免費商用**。在發佈產品時，請確保遵守相關的[利用規約](./doc/skills/VOICEVOX.md#授權說明)。

## 既有功能

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
