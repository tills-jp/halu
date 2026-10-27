# TC-UserDetailMainte-S03 実施エビデンス（NG → C-070）

- 実施日時: 2026-09-21 18:28（訂正モード・ZZTEST99）
- 訂正処理自体: ユーザ名「ゼットテスト99改」・備考「訂正後備考」・パスワード空欄で #実行 → 「訂正処理は正常に終了しました。」
  DB: `29|ZZTEST99|ゼットテスト99改|訂正後備考|hash_unchanged=t|更新日時 18:28:27 > 登録日時|更新ユーザ=1`
- NG要因（訂正モードの項目状態）:
  ```
  ユーザＩＤ="29"(dis) / テーマコード / ユーザ名 / 備考 / メールアドレス / ユーザコード="ZZTEST99"  ← readonly/disabled なし（編集可能） / パスワード / メニュー名
  ```
  `UserDetailMainte.view.js` on初期処理: `if (mode == "select" || mode == "delete") { $("input").prop('disabled', true); … }`（update は対象外）
  `UserDetailMainte_update_sql.json`: update／update_nopw の更新列に `ユーザコード`（fromname=ユーザコード）を含む
- 設計書 `UserDetailMainte.md` 3章 No.1: 「登録時のみ入力可。訂正・削除・照会時は読取専用」
- 判定: NG（設計書と実装の不一致）。変更管理台帳 C-070 起票（承認待ち）
