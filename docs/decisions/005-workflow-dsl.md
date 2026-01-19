# ADR-005: ワークフローDSLの選択

## ステータス

Accepted

## コンテキスト

CI/CDパイプラインを記述するための言語/プラットフォームを選定する必要がある。

GitHub Actions以外にも、様々なワークフロー記述言語やCI/CDプラットフォームが存在する。

## 検討した選択肢

### 分類

```
┌────────────────────────────────────────────────────────────────────┐
│                    ワークフロー記述言語の分類                        │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│   宣言的      │   型安全      │ プログラマブル │   ポータブル         │
├──────────────┼──────────────┼──────────────┼──────────────────────┤
│ GitHub YAML  │ CUE          │ Dagger       │ Dagger              │
│ GitLab CI    │ Dhall        │ Pulumi       │ Earthly             │
│ CircleCI     │ Pkl          │              │                     │
└──────────────┴──────────────┴──────────────┴──────────────────────┘
```

### GitHub Actions YAML

```yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
```

| 観点 | 評価 |
|------|------|
| 学習コスト | ◎ 低い |
| GitHub統合 | ◎ ネイティブ |
| エコシステム | ◎ Marketplace |
| ローカル実行 | △ act必要 |
| ポータビリティ | × GitHub専用 |
| 型安全 | × |

### Dagger (TypeScript)

```typescript
import { connect } from "@dagger.io/dagger"

connect(async (client) => {
  await client.container()
    .from("node:20")
    .withExec(["npm", "test"])
    .sync()
})
```

| 観点 | 評価 |
|------|------|
| 学習コスト | ○ |
| GitHub統合 | ○ 別途ワークフロー必要 |
| エコシステム | ○ 成長中 |
| ローカル実行 | ◎ 完全対応 |
| ポータビリティ | ◎ どこでも実行 |
| 型安全 | ◎ TypeScript |

### CUE (YAML生成)

```cue
package ci

workflows: ci: {
  name: "CI"
  on: ["push"]
  jobs: build: {
    "runs-on": "ubuntu-latest"
    steps: [
      {uses: "actions/checkout@v4"},
      {run: "npm test"},
    ]
  }
}
```

| 観点 | 評価 |
|------|------|
| 学習コスト | △ 新言語 |
| GitHub統合 | ○ YAML生成 |
| エコシステム | △ |
| ローカル実行 | △ |
| ポータビリティ | ○ YAML生成 |
| 型安全 | ◎ |

## 決定

**GitHub Actions YAML** を採用する。

### 理由

1. **ネイティブ統合**: GitHub上で直接実行
2. **Marketplace**: 豊富なアクションを利用可能
3. **学習コスト**: YAMLベースで習得が容易
4. **情報量**: ドキュメント、サンプルが豊富
5. **目的適合**: このテンプレート自体がGitHub Action

### 他を選ぶべきケース

| ケース | 推奨 |
|--------|------|
| ローカルとCIの完全一致が必要 | Dagger |
| 複数CI/CDプラットフォーム対応 | Dagger / Earthly |
| 大規模YAMLの型安全化 | CUE / Dhall |
| GitLab使用 | GitLab CI YAML |

### Daggerとの併用

GitHub ActionsからDaggerを呼び出す構成も可能：

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dagger/dagger-for-github@v5
        with:
          verb: run
          args: node pipeline.ts
```

## 結果

- `.github/workflows/ci.yml` を作成
- GitHub Actions標準のYAML構文を使用
- Marketplace上の既存アクションを活用
