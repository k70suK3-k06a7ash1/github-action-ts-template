---
name: add-service
description: Effect TSサービスを追加。依存性注入パターンでサービスを定義。「サービス追加」「Effect service」「DI」などのキーワードで起動。
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
---

# Effect TSサービス追加スキル

新しいEffect TSサービスを追加します。

## テンプレート

`src/services/{name}.ts` を作成:

```typescript
import { Context, Effect, Layer } from 'effect'

// サービスインターフェース定義
export class {ServiceName} extends Context.Tag('{ServiceName}')<
  {ServiceName},
  {
    readonly methodName: (arg: ArgType) => Effect.Effect<ReturnType, ErrorType>
  }
>() {}

// 本番実装
export const {ServiceName}Live = Layer.succeed({ServiceName}, {
  methodName: (arg) => Effect.sync(() => {
    // 実装
  }),
})

// テスト用モック
export const {ServiceName}Test = Layer.succeed({ServiceName}, {
  methodName: (_arg) => Effect.succeed(/* モック値 */),
})
```

## 手順

1. ユーザーにサービス名と機能を確認
2. `src/services/{name}.ts` を作成
3. 必要に応じて `src/errors.ts` にエラー型を追加
4. テストファイル `__tests__/services/{name}.test.ts` を作成
5. `npm run all` で検証

## 設計ルール

- 1ファイル50行以下
- 副作用は `Effect.sync` または `Effect.tryPromise` で包む
- エラーは `Data.TaggedError` で定義
- テスト用モックは必ず提供
