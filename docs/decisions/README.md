# Architecture Decision Records (ADR)

このディレクトリには、本テンプレートの技術的な意思決定を記録しています。

## ADR一覧

| ADR | タイトル | ステータス | 決定 |
|-----|----------|------------|------|
| [001](./001-action-type.md) | GitHub Actions 実装タイプ | Accepted | TypeScript Action |
| [002](./002-bundler.md) | バンドラー | Accepted | @vercel/ncc |
| [003](./003-testing.md) | テストフレームワーク | Accepted | Vitest |
| [004](./004-linting.md) | リンター/フォーマッター | Accepted | ESLint + Prettier |
| [005](./005-workflow-dsl.md) | ワークフローDSL | Accepted | GitHub Actions YAML |
| [006](./006-package-manager.md) | パッケージマネージャー | Accepted | npm |
| [007](./007-project-scaffolding.md) | プロジェクト構成管理 | Accepted | 手動構成 |

## ADRフォーマット

各ADRは以下の構造に従います：

```markdown
# ADR-XXX: タイトル

## ステータス
Accepted / Proposed / Deprecated / Superseded

## コンテキスト
なぜこの決定が必要だったか

## 検討した選択肢
- 選択肢A
- 選択肢B
- 選択肢C

## 決定
何を選んだか、なぜか

## 結果
この決定による影響
```

## 参考

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions - Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
