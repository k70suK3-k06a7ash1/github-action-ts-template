---
name: maintain
description: プロジェクトのメンテナンス作業を実行。依存関係の更新、projen同期、全チェック実行。「メンテナンス」「依存更新」「projen sync」などのキーワードで起動。
allowed-tools:
  - Bash
  - Read
  - Edit
  - Glob
---

# メンテナンススキル

このスキルはプロジェクトのメンテナンス作業を支援します。

## 実行手順

1. **projen同期**
   ```bash
   npx projen
   ```

2. **依存関係の更新確認**
   ```bash
   npm outdated
   ```

3. **全チェック実行**
   ```bash
   npm run all
   ```

4. **問題があれば修正**
   - Biomeエラー: `npm run format && npm run check -- --fix`
   - 型エラー: 該当ファイルを修正
   - テスト失敗: テストまたは実装を修正

## 注意事項

- projen生成ファイル（package.json, tsconfig.json等）は直接編集しない
- 設定変更は `.projenrc.ts` を編集して `npx projen` を実行
- Biome除外対象: `tsconfig.json`, `tsconfig.dev.json`, `.projen/`
