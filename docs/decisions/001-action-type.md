# ADR-001: GitHub Actions 実装タイプの選択

## ステータス

Accepted

## コンテキスト

GitHub Actionsを実装する方法は複数存在する：

1. **JavaScript/TypeScript Action**: Node.js上で実行
2. **Docker Container Action**: 任意のコンテナ内で実行
3. **Composite Action**: 既存のstepを組み合わせ（YAMLのみ）
4. **Reusable Workflow**: ワークフロー全体を再利用

テンプレートとしてどのタイプを採用するか決定する必要がある。

## 検討した選択肢

### JavaScript/TypeScript Action

```yaml
runs:
  using: 'node20'
  main: 'dist/index.js'
```

| 観点 | 評価 |
|------|------|
| 起動速度 | ◎ 高速（Node.js事前インストール済み） |
| 柔軟性 | ◎ 任意のロジック実装可能 |
| エコシステム | ◎ npm パッケージ活用可能 |
| 型安全 | ◎ TypeScript対応 |
| 公式サポート | ◎ @actions/core, @actions/github |

### Docker Container Action

```yaml
runs:
  using: 'docker'
  image: 'Dockerfile'
```

| 観点 | 評価 |
|------|------|
| 起動速度 | △ コンテナビルド/プルが必要 |
| 柔軟性 | ◎ 任意の言語/環境 |
| エコシステム | ○ 言語依存 |
| 型安全 | ○ 言語依存 |
| 公式サポート | ○ |

### Composite Action

```yaml
runs:
  using: 'composite'
  steps:
    - run: echo "Hello"
      shell: bash
```

| 観点 | 評価 |
|------|------|
| 起動速度 | ◎ |
| 柔軟性 | △ 既存step/actionの組み合わせのみ |
| エコシステム | △ 他のactionに依存 |
| 型安全 | × YAMLのみ |
| 公式サポート | ◎ |

## 決定

**TypeScript Action** を採用する。

### 理由

1. **起動速度**: Node.jsはrunner上に事前インストールされており、起動が高速
2. **公式SDK**: `@actions/core`, `@actions/github` が充実
3. **型安全**: TypeScriptによる開発時エラー検出
4. **汎用性**: 複雑なロジック、API連携、ファイル操作など何でも実装可能
5. **Marketplace**: 公開・配布が容易

### 他を選ぶべきケース

| ケース | 推奨タイプ |
|--------|------------|
| Python/Go等が必須 | Docker Action |
| 既存step/actionの再利用のみ | Composite Action |
| ワークフロー全体の共有 | Reusable Workflow |

## 結果

- Node.js 20をランタイムとして使用
- TypeScriptでアクションロジックを実装
- `@actions/core`, `@actions/github` を依存として追加
- バンドラーで単一ファイルにビルド（→ ADR-002）
