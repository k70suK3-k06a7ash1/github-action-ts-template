---
name: projen-config
description: projen設定を更新。依存関係追加、スクリプト追加、TypeScript設定変更など。「projen」「依存追加」「npm script」などのキーワードで起動。
allowed-tools:
  - Bash
  - Read
  - Edit
---

# projen設定更新スキル

`.projenrc.ts` を編集してプロジェクト設定を更新します。

## 重要

**直接編集禁止ファイル:**
- `package.json`
- `tsconfig.json`
- `tsconfig.dev.json`
- `.gitignore`
- `.github/workflows/*` (projen生成分)

これらは `.projenrc.ts` 経由で管理します。

## 依存関係の追加

`.projenrc.ts` を編集:

```typescript
const project = new typescript.TypeScriptProject({
  // 本番依存
  deps: [
    '@actions/core',
    '@actions/github',
    'effect',
    'new-package',  // 追加
  ],

  // 開発依存
  devDeps: [
    '@biomejs/biome',
    'vitest',
    'new-dev-package',  // 追加
  ],
})
```

## スクリプトの追加

```typescript
project.addTask('new-task', {
  description: 'タスクの説明',
  exec: 'command to run',
})
```

## TypeScript設定の変更

```typescript
tsconfig: {
  compilerOptions: {
    // 新しいオプション
    newOption: true,
  },
},
```

## 同期手順

1. `.projenrc.ts` を編集
2. `npx projen` を実行
3. 生成されたファイルを確認
4. `npm run all` で検証

## よくある操作

### 新しい依存追加
```bash
# .projenrc.ts を編集後
npx projen
```

### GitHub Actions ワークフロー変更
projen の TypeScriptProject は以下のワークフローを自動生成:
- `build.yml`
- `release.yml`
- `upgrade-main.yml`

カスタムワークフローは `.github/workflows/` に直接追加可能（projen管理外）

### gitignore パターン追加
```typescript
gitignore: ['dist/*.map', 'coverage/', '.env', 'new-pattern/'],
```
