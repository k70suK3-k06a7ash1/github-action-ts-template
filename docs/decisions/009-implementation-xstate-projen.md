# ADR-009: XState状態管理とprojenプロジェクト管理の実装

## ステータス

**Accepted**

## コンテキスト

ADR-008で決定したアーキテクチャに基づき、XStateとprojenを実装する。

## 決定

### 1. XState状態マシンの実装

#### 設計

```
┌─────────────────────────────────────────────────────────────────┐
│                    Action State Machine                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────┐    START     ┌────────────┐   VALIDATE_SUCCESS       │
│   │ idle │ ──────────── │ validating │ ─────────────────┐      │
│   └──────┘              └────────────┘                  │      │
│                              │                          │      │
│                   VALIDATE_FAILURE                      ▼      │
│                              │              ┌────────────┐      │
│                              │              │ processing │      │
│                              │              └────────────┘      │
│                              │                    │             │
│                              │     PROCESS_SUCCESS│PROCESS_FAILURE
│                              │                    │             │
│                              ▼                    ▼             │
│                         ┌────────┐         ┌───────────┐       │
│                         │ failed │         │ succeeded │       │
│                         └────────┘         └───────────┘       │
│                           (final)            (final)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 実装ファイル

- `src/machines/action.ts` - ステートマシン定義
- `src/machines/index.ts` - エクスポート
- `__tests__/machines/action.test.ts` - テスト

#### コード構造

```typescript
// 型定義
export type ActionContext = {
  readonly input: string | null
  readonly output: string | null
  readonly error: string | null
}

export type ActionEvent =
  | { type: 'START'; input: string }
  | { type: 'VALIDATE_SUCCESS' }
  | { type: 'VALIDATE_FAILURE'; error: string }
  | { type: 'PROCESS_SUCCESS'; output: string }
  | { type: 'PROCESS_FAILURE'; error: string }
  | { type: 'RESET' }

// XState v5 setup API使用
export const actionMachine = setup({
  types: {
    context: {} as ActionContext,
    events: {} as ActionEvent,
  },
}).createMachine({
  // ...
})
```

### 2. projenプロジェクト管理の実装

#### 設定ファイル

`.projenrc.ts` が唯一の手動編集ファイルとなる。

```typescript
import { javascript, typescript } from 'projen'

const project = new typescript.TypeScriptProject({
  name: 'github-action-ts-template',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,

  // カスタムツール使用（ESLint/Prettier無効）
  eslint: false,
  prettier: false,
  jest: false,

  // 依存関係
  deps: ['@actions/core', '@actions/github', 'effect'],
  devDeps: ['@biomejs/biome', '@fast-check/vitest', 'esbuild', 'vitest', 'xstate'],

  // TypeScript strictest設定
  tsconfig: {
    compilerOptions: {
      strict: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
      // ...
    },
  },
})

// カスタムタスク
project.addTask('build:action', { exec: 'esbuild ...' })
project.addTask('check', { exec: 'biome check .' })
project.addTask('all', { exec: 'npm run check && ...' })

project.synth()
```

#### 生成されるファイル

| ファイル | 説明 |
|----------|------|
| `package.json` | 依存関係とスクリプト |
| `tsconfig.json` | TypeScript設定 |
| `tsconfig.dev.json` | 開発用TypeScript設定 |
| `.gitignore` | Git除外設定 |
| `.gitattributes` | Git属性 |
| `.npmignore` | npm除外設定 |
| `.projen/*` | projen内部ファイル |
| `LICENSE` | ライセンス |

#### Biome除外設定

projen生成ファイルはBiomeのフォーマットと競合するため除外:

```json
{
  "files": {
    "includes": [
      "**",
      "!tsconfig.json",
      "!tsconfig.dev.json",
      "!.projen"
    ]
  }
}
```

### 3. スクリプト体系

| コマンド | 説明 |
|----------|------|
| `npm run all` | 全チェック + ビルド |
| `npm run check` | Biome lint/format チェック |
| `npm run typecheck` | TypeScript型チェック |
| `npm run test:unit` | Vitestユニットテスト |
| `npm run build:action` | esbuildバンドル |
| `npm run format` | Biomeフォーマット |
| `npx projen` | 設定再生成 |

## 結果

### 実装完了項目

| 項目 | 状態 |
|------|------|
| XState状態マシン | ✓ 実装済 |
| XStateテスト (6件) | ✓ 全て通過 |
| projen設定 | ✓ 実装済 |
| Biome除外設定 | ✓ 設定済 |
| npm run all | ✓ 全て通過 |

### テスト結果

```
Test Files  2 passed (2)
     Tests  8 passed (8)
```

- `__tests__/action.test.ts`: 2 tests
- `__tests__/machines/action.test.ts`: 6 tests

### 今後の拡張

1. XStateとEffect TSの統合（`@effect/experimental`のMachineActorを検討）
2. より複雑なワークフローでの状態マシン活用
3. projenカスタムコンポーネントの作成
