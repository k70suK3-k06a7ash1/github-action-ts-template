# ADR-006: パッケージマネージャーの選択

## ステータス

Accepted

## コンテキスト

Node.jsプロジェクトの依存関係を管理するパッケージマネージャーを選定する必要がある。

## 検討した選択肢

### npm

```bash
npm install
npm run build
```

| 観点 | 評価 |
|------|------|
| 速度 | ○ |
| ディスク効率 | △ |
| デフォルト | ◎ Node.js同梱 |
| CI対応 | ◎ キャッシュ標準サポート |
| lockfile | package-lock.json |

### pnpm

```bash
pnpm install
pnpm run build
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎ 2倍高速 |
| ディスク効率 | ◎ シンボリックリンク |
| デフォルト | × 別途インストール |
| CI対応 | ◎ |
| lockfile | pnpm-lock.yaml |

### yarn (v4/berry)

```bash
yarn install
yarn build
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎ |
| ディスク効率 | ◎ PnP |
| デフォルト | × 別途インストール |
| CI対応 | ◎ |
| lockfile | yarn.lock |

### bun

```bash
bun install
bun run build
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎◎ 最速 |
| ディスク効率 | ◎ |
| デフォルト | × 別途インストール |
| CI対応 | ○ 成長中 |
| lockfile | bun.lockb |

## 決定

**npm** を採用する。

### 理由

1. **標準**: Node.jsに同梱、追加インストール不要
2. **GitHub Actions親和性**: `actions/setup-node`でキャッシュ標準サポート
3. **テンプレートとしての汎用性**: 誰でもすぐに使える
4. **十分な速度**: CI/CDで問題になるレベルではない

### pnpmを選ぶべきケース

- インストール速度を重視
- ディスク容量を節約したい
- 厳格な依存関係管理（phantom dependency防止）
- モノレポ構成

```bash
# pnpmへの移行
npm install -g pnpm
rm -rf node_modules package-lock.json
pnpm install
```

### GitHub Actionsでのpnpm使用

```yaml
- uses: pnpm/action-setup@v2
  with:
    version: 8

- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'

- run: pnpm install
```

## 結果

- `package-lock.json` を使用
- `npm ci` をCI/CDで使用（クリーンインストール）
- `npm run build`, `npm test` でスクリプト実行
