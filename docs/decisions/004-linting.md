# ADR-004: リンター/フォーマッターの選択

## ステータス

Accepted

## コンテキスト

コードの品質を保ち、一貫したスタイルを維持するために、リンターとフォーマッターを選定する必要がある。

## 検討した選択肢

### ESLint + Prettier

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"]
}

// .prettierrc
{
  "semi": false,
  "singleQuote": true
}
```

| 観点 | 評価 |
|------|------|
| 速度 | △ 遅い |
| 設定ファイル | △ 複数必要 |
| エコシステム | ◎ プラグイン豊富 |
| IDE統合 | ◎ |
| 依存パッケージ | △ 5+パッケージ |

### Biome

```json
// biome.json
{
  "linter": { "enabled": true },
  "formatter": { "enabled": true }
}
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎ 100倍高速 |
| 設定ファイル | ◎ 1ファイル |
| エコシステム | ○ 成長中 |
| IDE統合 | ○ VS Code対応 |
| 依存パッケージ | ◎ 1パッケージ |

### dprint

```json
// dprint.json
{
  "typescript": {},
  "json": {}
}
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎ Rustベース |
| 設定ファイル | ○ |
| エコシステム | △ 限定的 |
| IDE統合 | ○ |
| 依存パッケージ | ○ |

## 決定

**ESLint + Prettier** を採用する。

### 理由

1. **業界標準**: 最も広く使われている組み合わせ
2. **情報量**: ドキュメント、Stack Overflow、ブログ記事が豊富
3. **IDE統合**: VS Code、WebStormなどで優れたサポート
4. **プラグイン**: TypeScript、React、Node.js用プラグインが充実
5. **チーム採用**: 多くのチームが既に使用している

### Biomeを選ぶべきケース

- ビルド速度が重要
- 設定をシンプルにしたい
- 依存関係を減らしたい
- AIコンテストエンジニアリング的アプローチ

```bash
# Biomeへの移行
npm remove eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D @biomejs/biome

# biome.json を作成
npx biome init
```

### 設定ファイル

```
.eslintrc.json    # ESLint設定
.prettierrc       # Prettier設定
.prettierignore   # Prettierの除外設定
```

## 結果

- ESLint + Prettier を devDependencies に追加
- TypeScript用プラグイン: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
- npm scripts: `lint`, `format`, `format:check`
- CIでformat:checkを実行
