---
name: test-debug
description: テスト実行とデバッグ。テスト失敗の調査、プロパティテストの反例分析。「テスト」「デバッグ」「失敗」などのキーワードで起動。
allowed-tools:
  - Bash
  - Read
  - Edit
  - Grep
---

# テスト・デバッグスキル

テストの実行と失敗時のデバッグを支援します。

## テスト実行コマンド

```bash
# 全テスト実行
npm run test:unit

# ウォッチモード
npm run test:watch

# 特定ファイル
npx vitest run __tests__/action.test.ts

# 特定テスト名
npx vitest run -t "should run successfully"
```

## プロパティテスト失敗時

fast-check が反例を見つけた場合:

```
Error: Property failed after 42 tests
Counterexample: [" "]
```

### 調査手順

1. 反例の値を確認
2. その値で実際に何が起こるか確認
3. 境界条件やエッジケースを特定
4. 実装またはテストを修正

### よくある反例パターン

| 反例 | 原因 |
|------|------|
| `""` (空文字) | 空文字チェック漏れ |
| `" "` (空白のみ) | trim後の空チェック漏れ |
| `null`, `undefined` | nullish チェック漏れ |
| 非常に長い文字列 | 長さ制限漏れ |
| 特殊文字 | エスケープ漏れ |

## Effect TS デバッグ

### Exit型の確認

```typescript
const exit = await Effect.runPromiseExit(program)
if (exit._tag === 'Failure') {
  console.log(exit.cause)
}
```

### トレース有効化

```typescript
import { Effect } from 'effect'

const program = myEffect.pipe(
  Effect.tap((value) => Effect.log(`Value: ${value}`)),
  Effect.tapError((error) => Effect.log(`Error: ${error}`))
)
```

## XState デバッグ

### 状態遷移の確認

```typescript
const actor = createActor(machine)
actor.subscribe((snapshot) => {
  console.log('State:', snapshot.value)
  console.log('Context:', snapshot.context)
})
actor.start()
```

## Biome エラー修正

```bash
# 自動修正
npm run format
npm run check -- --fix

# エラー詳細確認
npx biome check . --verbose
```

## 型エラー調査

```bash
# 詳細な型エラー
npx tsc --noEmit --pretty

# 特定ファイルのみ
npx tsc --noEmit src/action/run.ts
```
