---
name: add-feature
description: 新機能を追加。Effect TS、XState、スキーマ検証を使用したアーキテクチャに従う。「機能追加」「新機能」「feature」などのキーワードで起動。
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# 新機能追加スキル

アーキテクチャに従って新機能を追加します。

## アーキテクチャ概要

```
src/
├── schemas/     # 入出力スキーマ（Effect Schema）
├── services/    # 副作用サービス（Effect TS Layer）
├── machines/    # 状態マシン（XState）
├── action/      # ビジネスロジック
├── errors.ts    # エラー型定義
└── main.ts      # エントリーポイント
```

## 実装手順

### 1. スキーマ定義

`src/schemas/{feature}.ts`:

```typescript
import { Schema } from 'effect'

export const {Feature}Schema = Schema.Struct({
  field: Schema.String,
})

export type {Feature} = typeof {Feature}Schema.Type
export const decode{Feature} = Schema.decodeUnknown({Feature}Schema)
```

### 2. エラー型追加（必要な場合）

`src/errors.ts` に追加:

```typescript
export class {Feature}Error extends Data.TaggedError('{Feature}Error')<{
  readonly message: string
}> {}
```

### 3. サービス追加（外部連携がある場合）

`/add-service` スキルを使用

### 4. ビジネスロジック

`src/action/{feature}.ts`:

```typescript
import { Effect } from 'effect'
import { {Feature}Error } from '../errors'
import { decode{Feature} } from '../schemas/{feature}'

export const {feature}Action: Effect.Effect<Result, {Feature}Error, Dependencies> =
  Effect.gen(function* () {
    // 実装
  })
```

### 5. テスト作成

`__tests__/{feature}.test.ts`:

```typescript
import { Effect, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { test } from '@fast-check/vitest'
import * as fc from 'fast-check'

describe('{feature}', () => {
  it('should work with valid input', async () => {
    // ユニットテスト
  })

  test.prop([fc.string()])('property test', async (input) => {
    // プロパティテスト
  })
})
```

### 6. 検証

```bash
npm run all
```

## チェックリスト

- [ ] スキーマで入力検証
- [ ] エラーは TaggedError で型付け
- [ ] 副作用は Effect で包む
- [ ] 1ファイル50行以下
- [ ] テスト作成（ユニット + プロパティ）
- [ ] `npm run all` 通過

## 設計原則

1. **参照透過性**: 同じ入力 → 同じ出力
2. **不変性**: readonly を使用
3. **合成可能性**: pipe, Effect.flatMap で組み立て
4. **型駆動**: 不正な状態を型で表現不可能に
