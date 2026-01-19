# ADR-003: テストフレームワークの選択

## ステータス

Accepted

## コンテキスト

TypeScriptで書かれたアクションロジックをテストするためのフレームワークを選定する必要がある。

## 検討した選択肢

### Vitest

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('action', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })
})
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎ esbuildベースで高速 |
| TypeScript | ◎ ネイティブ対応 |
| 設定 | ◎ 最小限 |
| Jest互換 | ◎ API互換 |
| モック | ◎ vi.mock() |

### Jest

```typescript
import { describe, it, expect, jest } from '@jest/globals'

describe('action', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })
})
```

| 観点 | 評価 |
|------|------|
| 速度 | ○ Vitestより遅い |
| TypeScript | △ ts-jest または babel必要 |
| 設定 | ○ やや複雑 |
| エコシステム | ◎ 最も広く使われている |
| モック | ◎ jest.mock() |

### Node.js Test Runner

```typescript
import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('action', () => {
  it('should work', () => {
    assert.strictEqual(1 + 1, 2)
  })
})
```

| 観点 | 評価 |
|------|------|
| 速度 | ◎ |
| TypeScript | △ 別途コンパイル必要 |
| 設定 | ◎ 組み込み |
| 依存 | ◎ なし |
| モック | △ 機能限定的 |

## 決定

**Vitest** を採用する。

### 理由

1. **高速**: esbuildベースで起動・実行が高速
2. **TypeScriptネイティブ**: 追加設定なしでTypeScriptを実行
3. **Jest互換**: 既存のJest知識がそのまま使える
4. **最小設定**: `vitest.config.ts` のみで動作
5. **モダン**: ESMネイティブ対応

### 設定例

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
  }
})
```

### Jestを選ぶべきケース

- チームがJestに慣れている
- Jest専用のプラグインが必要
- 既存のJestテストを移行したくない

## 結果

- `vitest` を devDependencies に追加
- テストディレクトリ: `__tests__/`
- テストコマンド: `npm test` → `vitest run`
- カバレッジ: `vitest --coverage`
