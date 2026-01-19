# 技術スタック選定サマリー

詳細な意思決定記録は [docs/decisions/](./docs/decisions/) を参照してください。

---

## 採用技術

| カテゴリ | 採用 | 代替案 | ADR |
|----------|------|--------|-----|
| Action実装タイプ | TypeScript Action | Docker, Composite | [001](./docs/decisions/001-action-type.md) |
| バンドラー | @vercel/ncc | esbuild, webpack | [002](./docs/decisions/002-bundler.md) |
| テスト | Vitest | Jest, Node.js test | [003](./docs/decisions/003-testing.md) |
| Lint/Format | ESLint + Prettier | Biome | [004](./docs/decisions/004-linting.md) |
| ワークフローDSL | GitHub Actions YAML | Dagger, CUE | [005](./docs/decisions/005-workflow-dsl.md) |
| パッケージマネージャー | npm | pnpm, yarn, bun | [006](./docs/decisions/006-package-manager.md) |
| プロジェクト構成 | 手動 | projen, Nx | [007](./docs/decisions/007-project-scaffolding.md) |

---

## 構成方針

### 現在の構成（安定性重視）

```
@vercel/ncc + ESLint + Prettier + Vitest + npm + 手動構成
```

- GitHub公式推奨ツール
- 業界標準、情報が豊富
- 追加依存が少ない

### 速度重視の代替構成

```
esbuild + Biome + Vitest + pnpm
```

- CI時間: 約3.5倍高速
- 設定ファイル: 削減
- 依存パッケージ: 削減

詳細は各ADRを参照。

---

## 関連ドキュメント

- [docs/decisions/](./docs/decisions/) - Architecture Decision Records
- [PROJECT_GENERATORS.md](./PROJECT_GENERATORS.md) - projen等のプロジェクト構成管理ツール比較
