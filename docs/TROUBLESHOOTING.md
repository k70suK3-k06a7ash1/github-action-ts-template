# トラブルシューティング: CI "dist/ is out of date" エラー

## 問題

```
dist/ is out of date. Run 'npm run build' and commit the changes.
```

CIでビルドした結果とコミットされたdist/の内容が一致しない。

## 第一原理からの調査

### 1. エラーの直接原因

```bash
git diff dist/
```

差分を確認すると `.d.ts.map` ファイルに差異がある：

```diff
-"sources":["file:///Users/kyosukekobayashi/Apps/github-action-ts-template/src/action.ts"]
+"sources":["file:///home/runner/work/github-action-ts-template/github-action-ts-template/src/action.ts"]
```

### 2. 根本原因

```
┌─────────────────────────────────────────────────────────────────┐
│ @vercel/ncc の --source-map オプション                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ncc build src/main.ts --source-map                            │
│                    ↓                                            │
│  .d.ts.map に「絶対パス」が埋め込まれる                          │
│                    ↓                                            │
│  ローカル: /Users/kyosukekobayashi/Apps/...                     │
│  CI:       /home/runner/work/...                                │
│                    ↓                                            │
│  パスが異なるため git diff で差分検出                           │
│                    ↓                                            │
│  CI失敗                                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. なぜこれが問題か

GitHub Actions（JavaScript/TypeScript Action）は：
- `dist/index.js` をコミットする必要がある（action.yml で指定）
- CIで「dist/が最新か」をチェックするのはベストプラクティス
- しかし、source-mapに絶対パスが含まれると環境依存になる

## 解決策

### 解決策A: source-mapを無効化（推奨）

```json
// package.json
{
  "scripts": {
    "build": "ncc build src/main.ts -o dist --license licenses.txt"
    // --source-map を削除
  }
}
```

**メリット**: シンプル、環境非依存
**デメリット**: デバッグ時にsource-mapがない

### 解決策B: .d.ts.map を .gitignore に追加

```gitignore
# dist内のsource-map（環境依存のパスが含まれる）
dist/*.d.ts.map
```

**メリット**: source-mapはローカルで利用可能
**デメリット**: 部分的なdist/コミットになる

### 解決策C: dist/ 全体を .gitignore + CI でビルド

```gitignore
/dist
```

```yaml
# ci.yml - dist/をビルドしてからテスト
- run: npm run build
- uses: ./  # ビルドされたdist/を使用
```

**メリット**: 環境依存の問題を完全回避
**デメリット**: dist/がリポジトリにないため、タグ/リリース時に別途ビルドが必要

### 解決策D: CIのチェックを削除

```yaml
# ci.yml から削除
# - name: Check dist is up to date
#   run: git diff --exit-code dist/
```

**メリット**: 即座に解決
**デメリット**: dist/の更新忘れを検出できない

## 推奨: 解決策A

source-mapは開発時のデバッグに便利だが、GitHub Actionsでは通常不要。

```bash
# 修正手順
1. package.json の build スクリプトから --source-map を削除
2. npm run build
3. 変更をコミット
```

## 教訓

```
環境依存の要素をコミットする場合：
  - 絶対パスを避ける
  - 相対パスまたはパスなしにする
  - または、その要素をgitignoreする
```
