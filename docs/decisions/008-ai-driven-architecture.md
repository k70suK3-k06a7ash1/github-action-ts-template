# ADR-008: AIエージェント制御を前提としたアーキテクチャ

## ステータス

**Accepted**

## コンテキスト

AIエージェント（Claude Code、Cursor等）がコードを制御することを前提とし、**堅牢さを最優先**としたアーキテクチャを選定する。

学習コストは無視する。堅牢さと学習コストは正比例するため、堅牢さを得るために必要なコストは受け入れる。

### アブダクション

```
前提1: AIは型情報・制約から推論する
前提2: AIはフィードバックループで学習する
前提3: 堅牢なシステムは制約が明示的
前提4: 学習コストは堅牢さのコスト

結論: 最も堅牢な構成 = 最もAI制御に適した構成
```

## 決定: 堅牢さ最優先の構成

### 確定技術スタック

| カテゴリ | 採用 | 理由 |
|----------|------|------|
| 言語 | **TypeScript (strictest)** | 最も厳格な型チェック |
| スキーマ | **@effect/schema** | Effect統合、実行時検証 + 型生成 |
| バンドラー | **esbuild** | シンプル、予測可能、高速 |
| Lint/Format | **Biome** | 単一ツール、厳格、高速 |
| テスト | **Vitest + fast-check** | プロパティベーステスト |
| 設定言語 | **Pkl** | Apple製、型安全、バリデーション |
| 構成管理 | **projen** | 一貫性の自動強制 |
| エフェクト | **Effect TS** | 型安全な副作用、依存性注入、並行処理 |
| 状態管理 | **XState** | 明示的状態遷移、予測可能な振る舞い |
| ドキュメント | **CLAUDE.md + ADR** | AI向け明示的指示 |

### なぜ Effect TS + XState か

```
┌─────────────────────────────────────────────────────────────────────┐
│                    堅牢さのレイヤー                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ XState: 状態遷移の明示化                                     │  │
│  │ - 不正な状態遷移をコンパイル時に検出                          │  │
│  │ - 複雑なワークフローを視覚化可能                              │  │
│  │ - AIが状態マシン図から振る舞いを理解                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Effect TS: 副作用の型レベル追跡                              │  │
│  │ - どの副作用が発生するか型で表現                              │  │
│  │ - 依存性注入が型安全                                         │  │
│  │ - エラーが型レベルで追跡可能                                  │  │
│  │ - リトライ、タイムアウト、並行処理が宣言的                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ @effect/schema: 実行時検証 + 型生成                          │  │
│  │ - Effect TSとシームレスに統合                                 │  │
│  │ - エンコード/デコードが型安全                                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### アーキテクチャ原則

#### 関数型プログラミングの原則

```
┌─────────────────────────────────────────────────────────────────────┐
│                    関数型堅牢設計の5原則                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. 参照透過性 (Referential Transparency)                          │
│     - 同じ入力 → 常に同じ出力                                      │
│     - 副作用なし（Effect TSで明示的に管理）                         │
│                                                                     │
│  2. 不変性 (Immutability)                                          │
│     - データは変更しない、新しいデータを返す                        │
│     - readonly修飾子、Immutable構造体                              │
│                                                                     │
│  3. 合成可能性 (Composability)                                     │
│     - 小さな関数を組み合わせて大きな処理を構築                      │
│     - pipe, flow, compose                                          │
│                                                                     │
│  4. 代数的データ型 (ADT)                                           │
│     - Sum Type: A | B (Union)                                      │
│     - Product Type: A & B (Intersection)                           │
│     - Tagged Union: { _tag: 'A', ... } | { _tag: 'B', ... }        │
│                                                                     │
│  5. 型による制約 (Type-Driven Development)                         │
│     - 不正な状態を型で表現不可能にする                              │
│     - "Make illegal states unrepresentable"                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Effect TSによる関数型パターン

```typescript
// Effect<A, E, R>
// A: 成功時の値の型
// E: 失敗時のエラーの型
// R: 必要な依存関係（Requirements）の型

// 純粋な値
const pure: Effect<number, never, never> = Effect.succeed(42)

// 失敗
const fail: Effect<never, Error, never> = Effect.fail(new Error('oops'))

// 依存関係を要求
const needsGitHub: Effect<string, never, GitHubActions> =
  Effect.flatMap(GitHubActions, (gh) => gh.getInput('name'))

// 合成
const program = pipe(
  getInput,           // Effect<Input, ValidationError, GitHubActions>
  Effect.flatMap(process),  // Effect<Result, ProcessError, GitHubActions>
  Effect.flatMap(output),   // Effect<void, never, GitHubActions>
)
```

#### 具体的な設計ルール

```
型レベル:
  1. any禁止、unknown推奨
  2. 全てのデータに型定義
  3. Union型でエラーを網羅
  4. ReadonlyArray, ReadonlyRecord使用
  5. as禁止（型ガードを使用）

関数レベル:
  6. 純粋関数を基本とする
  7. 副作用はEffect TSで包む
  8. 例外を投げない（Effect.fail使用）
  9. nullish回避（Option使用）
  10. 部分適用で依存を注入

モジュールレベル:
  11. 1ファイル50行以下
  12. 1モジュール1責務
  13. 循環依存禁止
  14. レイヤー構造を明確に
```

#### 不変データ構造

```typescript
// Bad: 可変
interface User {
  name: string
  age: number
}

// Good: 不変
interface User {
  readonly name: string
  readonly age: number
}

// Better: Effect TSのData
import { Data } from 'effect'

class User extends Data.Class<{
  readonly name: string
  readonly age: number
}> {}

// 構造的等価性が自動実装される
const user1 = new User({ name: 'Alice', age: 30 })
const user2 = new User({ name: 'Alice', age: 30 })
user1 === user2 // true (構造的比較)
```

#### Option型（nullish回避）

```typescript
import { Option } from 'effect'

// Bad
function findUser(id: string): User | null {
  // ...
}

// Good
function findUser(id: string): Option.Option<User> {
  // ...
}

// 使用
pipe(
  findUser('123'),
  Option.map((user) => user.name),
  Option.getOrElse(() => 'Unknown')
)
```

#### パターンマッチング

```typescript
import { Match } from 'effect'

type Event =
  | { _tag: 'Started'; input: string }
  | { _tag: 'Completed'; output: string }
  | { _tag: 'Failed'; error: Error }

const handle = Match.type<Event>().pipe(
  Match.tag('Started', ({ input }) => `Processing: ${input}`),
  Match.tag('Completed', ({ output }) => `Done: ${output}`),
  Match.tag('Failed', ({ error }) => `Error: ${error.message}`),
  Match.exhaustive
)
```

### ディレクトリ構造

```
.
├── CLAUDE.md                    # AIへの指示書
├── .projenrc.ts                 # projen設定（唯一の手動編集ファイル）
├── biome.json                   # 生成される
├── package.json                 # 生成される
├── tsconfig.json                # 生成される
├── action.pkl                   # 型安全なaction定義
├── src/
│   ├── main.ts                  # エントリーポイント (10行)
│   ├── schemas/
│   │   ├── input.ts             # 入力スキーマ (Zod)
│   │   └── output.ts            # 出力スキーマ (Zod)
│   ├── action/
│   │   ├── run.ts               # メインロジック (Result型)
│   │   └── effects.ts           # 副作用（GitHub API等）
│   └── lib/
│       ├── result.ts            # Result型ユーティリティ
│       └── validation.ts        # バリデーション
└── tests/
    ├── unit/                    # ユニットテスト
    └── property/                # プロパティベーステスト
```

### コード例

**1. @effect/schema による型定義**

```typescript
// src/schemas/input.ts
import { Schema } from '@effect/schema'

export const InputSchema = Schema.Struct({
  exampleInput: Schema.String.pipe(
    Schema.nonEmptyString(),
    Schema.withDefault(() => 'default value')
  ),
})

export type Input = Schema.Schema.Type<typeof InputSchema>

// Effect統合のデコード
export const decodeInput = Schema.decodeUnknown(InputSchema)
```

**2. Effect TSによるサービス定義（依存性注入）**

```typescript
// src/services/github.ts
import { Context, Effect, Layer } from 'effect'
import * as core from '@actions/core'

// サービスインターフェース
export class GitHubActions extends Context.Tag('GitHubActions')<
  GitHubActions,
  {
    readonly getInput: (name: string) => Effect.Effect<string>
    readonly setOutput: (name: string, value: string) => Effect.Effect<void>
    readonly setFailed: (message: string) => Effect.Effect<void>
    readonly info: (message: string) => Effect.Effect<void>
  }
>() {}

// 本番実装
export const GitHubActionsLive = Layer.succeed(GitHubActions, {
  getInput: (name) => Effect.sync(() => core.getInput(name)),
  setOutput: (name, value) => Effect.sync(() => core.setOutput(name, value)),
  setFailed: (message) => Effect.sync(() => core.setFailed(message)),
  info: (message) => Effect.sync(() => core.info(message)),
})

// テスト用モック
export const GitHubActionsTest = Layer.succeed(GitHubActions, {
  getInput: (_name) => Effect.succeed('test-value'),
  setOutput: (_name, _value) => Effect.void,
  setFailed: (_message) => Effect.void,
  info: (_message) => Effect.void,
})
```

**3. Effect TSによるエラーハンドリング**

```typescript
// src/errors.ts
import { Data } from 'effect'

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string
  readonly field: string
}> {}

export class ProcessingError extends Data.TaggedError('ProcessingError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

export type ActionError = ValidationError | ProcessingError
```

**4. Effect TSによるメインロジック**

```typescript
// src/action/run.ts
import { Effect, pipe } from 'effect'
import { GitHubActions } from '../services/github'
import { decodeInput, Input } from '../schemas/input'
import { ValidationError, ProcessingError } from '../errors'

// 型シグネチャが副作用とエラーを明示
// Effect<Output, ActionError, GitHubActions>
export const run = Effect.gen(function* () {
  const github = yield* GitHubActions

  // 入力取得と検証
  const rawInput = yield* github.getInput('example-input')
  const input = yield* decodeInput({ exampleInput: rawInput }).pipe(
    Effect.mapError((e) => new ValidationError({
      message: 'Invalid input',
      field: 'example-input',
    }))
  )

  // ビジネスロジック
  const result = yield* processInput(input).pipe(
    Effect.mapError((e) => new ProcessingError({
      message: 'Processing failed',
      cause: e,
    }))
  )

  // 出力設定
  yield* github.setOutput('example-output', result)
  yield* github.info('Action completed successfully')

  return { exampleOutput: result }
})

const processInput = (input: Input) =>
  Effect.succeed(`Processed: ${input.exampleInput}`)
```

**5. XState による状態マシン（複雑なワークフロー向け）**

```typescript
// src/machines/action.machine.ts
import { setup, assign } from 'xstate'

type Context = {
  input: string | null
  output: string | null
  error: string | null
  retryCount: number
}

type Events =
  | { type: 'START'; input: string }
  | { type: 'PROCESS_SUCCESS'; output: string }
  | { type: 'PROCESS_FAILURE'; error: string }
  | { type: 'RETRY' }

export const actionMachine = setup({
  types: {
    context: {} as Context,
    events: {} as Events,
  },
  guards: {
    canRetry: ({ context }) => context.retryCount < 3,
  },
}).createMachine({
  id: 'action',
  initial: 'idle',
  context: {
    input: null,
    output: null,
    error: null,
    retryCount: 0,
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'processing',
          actions: assign({ input: ({ event }) => event.input }),
        },
      },
    },
    processing: {
      on: {
        PROCESS_SUCCESS: {
          target: 'success',
          actions: assign({ output: ({ event }) => event.output }),
        },
        PROCESS_FAILURE: {
          target: 'failure',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    failure: {
      on: {
        RETRY: {
          target: 'processing',
          guard: 'canRetry',
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
            error: null,
          }),
        },
      },
    },
    success: {
      type: 'final',
    },
  },
})
```

**6. エントリーポイント**

```typescript
// src/main.ts
import { Effect, pipe } from 'effect'
import { run } from './action/run'
import { GitHubActions, GitHubActionsLive } from './services/github'

const program = pipe(
  run,
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      const github = yield* GitHubActions
      yield* github.setFailed(error.message)
    })
  ),
  Effect.provide(GitHubActionsLive)
)

Effect.runPromise(program)
```

**7. プロパティベーステスト（Effect統合）**

```typescript
// tests/property/run.test.ts
import { test } from '@fast-check/vitest'
import * as fc from 'fast-check'
import { Effect } from 'effect'
import { run } from '../../src/action/run'
import { GitHubActionsTest } from '../../src/services/github'

test.prop([fc.string({ minLength: 1 })])(
  'run should always succeed or fail with typed error',
  async (input) => {
    const program = run.pipe(Effect.provide(GitHubActionsTest))
    const result = await Effect.runPromiseExit(program)

    // Exit型でSuccess or Failureを明示的にチェック
    expect(result._tag === 'Success' || result._tag === 'Failure').toBe(true)
  }
)
```

**7. Pkl設定（型安全なaction.yml生成）**

```pkl
// action.pkl
module ActionDefinition

name = "My GitHub Action"
description = "A robust TypeScript GitHub Action"
author = "Your Name"

branding {
  icon = "check-circle"
  color = "green"
}

inputs {
  ["example-input"] {
    description = "An example input parameter"
    required = false
    default = "default value"
  }
}

outputs {
  ["example-output"] {
    description = "An example output value"
  }
}

runs {
  using = "node20"
  main = "dist/index.js"
}
```

**8. CLAUDE.md**

```markdown
# CLAUDE.md

## Overview
TypeScript GitHub Action with maximum type safety and robustness.

## Architecture
- Pure functional core, imperative shell
- All errors are Result types (neverthrow)
- Side effects isolated in Effects module
- Schemas define all data shapes (Zod)

## Commands
npm run build     # Build with esbuild
npm run test      # Run all tests
npm run typecheck # Type check only
npm run lint      # Biome lint
npm run format    # Biome format

## Rules
- NO `any` type
- NO throwing exceptions (use Result)
- NO implicit returns
- NO files > 50 lines
- NO side effects in pure functions
- ALL inputs validated with Zod
- ALL errors typed

## File Responsibilities
- src/main.ts: Entry point only (orchestration)
- src/schemas/*: Data shapes and validation
- src/action/run.ts: Pure business logic
- src/action/effects.ts: All side effects
- src/lib/*: Shared utilities

## When Modifying
1. Update schema first if data shape changes
2. Update tests before implementation
3. Run `npm run all` before committing
```

### projen設定

```typescript
// .projenrc.ts
import { typescript } from 'projen'

const project = new typescript.TypeScriptProject({
  name: 'github-action-ts-template',
  defaultReleaseBranch: 'main',

  // 厳格なTypeScript
  tsconfig: {
    compilerOptions: {
      strict: true,
      noUncheckedIndexedAccess: true,
      noImplicitReturns: true,
      exactOptionalPropertyTypes: true,
    },
  },

  // 依存関係
  deps: [
    '@actions/core',
    '@actions/github',
    'zod',
    'neverthrow',
  ],

  devDeps: [
    'esbuild',
    '@biomejs/biome',
    'vitest',
    '@fast-check/vitest',
  ],

  // npm scripts
  scripts: {
    'build': 'esbuild src/main.ts --bundle --platform=node --target=node20 --outfile=dist/index.js',
    'lint': 'biome check .',
    'format': 'biome format --write .',
  },

  // ESLint/Prettierを無効化（Biomeを使用）
  eslint: false,
  prettier: false,
})

project.synth()
```

## 結果

### 堅牢さの保証

| 層 | 保証 | ツール |
|----|------|--------|
| 型 | 最厳格な静的型付け | TypeScript strictest |
| 副作用 | 型レベルで追跡 | Effect TS |
| 状態 | 明示的状態遷移 | XState |
| 実行時 | スキーマ検証 | @effect/schema |
| テスト | 性質ベース検証 | fast-check |
| 設定 | 型安全設定言語 | Pkl |
| 一貫性 | 自動強制 | projen |
| スタイル | 厳格ルール | Biome |

### 関数型堅牢性

| 原則 | 実現方法 |
|------|----------|
| 参照透過性 | 純粋関数 + Effect TS |
| 不変性 | Data.Class, readonly |
| 合成可能性 | pipe, Effect.flatMap |
| ADT | Tagged Union, Match |
| 型駆動 | "Make illegal states unrepresentable" |

### AI制御の容易さ

| 観点 | 実現 |
|------|------|
| コンテキスト明示 | CLAUDE.md |
| 型による推論 | Effect TS + @effect/schema |
| エラーフロー追跡 | Effect<A, E, R>の型シグネチャ |
| 副作用の予測 | Layer/Service パターン |
| 状態遷移の理解 | XState状態マシン図 |
| 変更の検証 | プロパティテスト |
| 一貫性 | projen |

### この構成が最適である理由

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   堅牢さ = f(制約の明示性, 型安全性, 不変性, 合成可能性)         │
│                                                                 │
│   AI制御性 = g(コンテキスト明確さ, 予測可能性, 検証可能性)       │
│                                                                 │
│   制約の明示性 ↔ コンテキスト明確さ                             │
│   型安全性 ↔ 予測可能性                                         │
│   不変性 + 合成可能性 ↔ 検証可能性                              │
│                                                                 │
│   ∴ 堅牢さ ≈ AI制御性                                          │
│                                                                 │
│   最も堅牢な関数型構成 = 最もAI制御に適した構成                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 技術スタック総括

```
TypeScript (strictest)
    ↓
Effect TS (副作用・エラー・依存の型レベル管理)
    ↓
@effect/schema (実行時検証 + 型生成)
    ↓
XState (状態遷移の明示化)
    ↓
Biome (即座のフィードバック)
    ↓
fast-check (性質ベース検証)
    ↓
projen (一貫性の自動強制)
    ↓
Pkl (型安全な設定)
    ↓
CLAUDE.md (AI向け明示的指示)
```
