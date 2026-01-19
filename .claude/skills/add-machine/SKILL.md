---
name: add-machine
description: XState状態マシンを追加。ワークフローや複雑な状態遷移を管理。「状態マシン」「XState」「ステートマシン」などのキーワードで起動。
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
---

# XState状態マシン追加スキル

新しいXState状態マシンを追加します。

## テンプレート

`src/machines/{name}.ts` を作成:

```typescript
import { setup } from 'xstate'

// コンテキスト型
export type {Name}Context = {
  readonly data: string | null
  readonly error: string | null
}

// イベント型
export type {Name}Event =
  | { type: 'START'; data: string }
  | { type: 'SUCCESS'; result: string }
  | { type: 'FAILURE'; error: string }
  | { type: 'RESET' }

// 状態マシン定義
export const {name}Machine = setup({
  types: {
    context: {} as {Name}Context,
    events: {} as {Name}Event,
  },
}).createMachine({
  id: '{name}',
  initial: 'idle',
  context: { data: null, error: null },
  states: {
    idle: {
      on: {
        START: {
          target: 'processing',
          actions: ({ event }) => ({ data: event.data }),
        },
      },
    },
    processing: {
      on: {
        SUCCESS: { target: 'succeeded' },
        FAILURE: { target: 'failed' },
      },
    },
    succeeded: { type: 'final' },
    failed: {
      on: {
        RESET: { target: 'idle' },
      },
    },
  },
})

export type {Name}Machine = typeof {name}Machine
```

## 手順

1. ユーザーに状態マシン名と状態遷移を確認
2. 状態遷移図を確認（Mermaid等で可視化推奨）
3. `src/machines/{name}.ts` を作成
4. `src/machines/index.ts` にエクスポートを追加
5. テストファイル `__tests__/machines/{name}.test.ts` を作成
6. `npm run all` で検証

## テストテンプレート

```typescript
import { createActor } from 'xstate'
import { describe, expect, it } from 'vitest'
import { {name}Machine } from '../../src/machines/{name}'

describe('{name}Machine', () => {
  it('should start in idle state', () => {
    const actor = createActor({name}Machine)
    actor.start()
    expect(actor.getSnapshot().value).toBe('idle')
    actor.stop()
  })

  it('should transition on events', () => {
    const actor = createActor({name}Machine)
    actor.start()
    actor.send({ type: 'START', data: 'test' })
    expect(actor.getSnapshot().value).toBe('processing')
    actor.stop()
  })
})
```

## 設計ルール

- 状態は明示的に定義（暗黙の状態を避ける）
- final状態を必ず定義
- コンテキストは readonly
- イベントはUnion型で網羅
