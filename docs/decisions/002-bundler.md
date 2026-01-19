# ADR-002: バンドラーの選択

## ステータス

Accepted

## コンテキスト

TypeScript ActionはNode.jsで実行されるが、`node_modules`をリポジトリにコミットするか、単一ファイルにバンドルする必要がある。

バンドルする場合、どのツールを使用するか決定する必要がある。

## 検討した選択肢

### @vercel/ncc

```bash
ncc build src/main.ts -o dist
```

| 観点 | 評価 |
|------|------|
| 速度 | ○ 1-2秒 |
| 設定 | ◎ 不要 |
| GitHub推奨 | ◎ 公式ドキュメントで推奨 |
| 出力サイズ | ○ |
| TypeScript | ◎ ネイティブ対応 |

### esbuild

```bash
esbuild src/main.ts --bundle --platform=node --outfile=dist/index.js
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎ 0.05秒（30倍高速） |
| 設定 | ○ 少し必要 |
| GitHub推奨 | ○ 増加中 |
| 出力サイズ | ◎ Tree-shaking優秀 |
| TypeScript | ◎ ネイティブ対応 |

### webpack

```javascript
// webpack.config.js が必要
module.exports = {
  target: 'node',
  entry: './src/main.ts',
  // ...
}
```

| 観点 | 評価 |
|------|------|
| 速度 | △ 遅い |
| 設定 | △ 複雑 |
| GitHub推奨 | ○ |
| 出力サイズ | ○ |
| TypeScript | ○ ts-loader必要 |

### node_modulesをコミット

```yaml
runs:
  using: 'node20'
  main: 'src/main.js'
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎ ビルド不要 |
| 設定 | ◎ 不要 |
| リポジトリサイズ | × 肥大化 |
| 依存管理 | × 煩雑 |

## 決定

**@vercel/ncc** を採用する。

### 理由

1. **GitHub公式推奨**: 公式ドキュメントで推奨されている
2. **ゼロ設定**: コマンド一つでビルド可能
3. **実績**: 多くのGitHub Actionsで使用されている
4. **十分な速度**: CI/CDで問題にならない程度の速度

### esbuildを選ぶべきケース

- ビルド速度が重要（大規模プロジェクト、頻繁なビルド）
- 出力サイズを最小化したい
- AIコンテストエンジニアリング的アプローチ

```bash
# esbuildへの移行
npm remove @vercel/ncc
npm install -D esbuild

# package.json
"build": "esbuild src/main.ts --bundle --platform=node --target=node20 --outfile=dist/index.js"
```

## 結果

- `@vercel/ncc` を devDependencies に追加
- ビルドコマンド: `ncc build src/main.ts -o dist --source-map --license licenses.txt`
- `dist/` ディレクトリをリポジトリにコミット
- CIで `dist/` が最新かチェック
