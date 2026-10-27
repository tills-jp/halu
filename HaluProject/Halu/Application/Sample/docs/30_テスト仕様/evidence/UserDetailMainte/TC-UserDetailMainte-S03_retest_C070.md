# TC-UserDetailMainte-S03 再実施エビデンス（C-070 修正後）

- 実施日時: 2026-09-21 19:0x（Docker・ブラウザ（Chromium）、ADMIN001）。テスト専用ユーザ ZZTEST70（SQLで投入、実施後に削除・シーケンス復元）
- 前提: `UserDetailMainte.view.js` set項目制御に update モード時の `readOnly` 化を追加、`UserDetailMainte_update_sql.json` の update／update_nopw から `ユーザコード` を除外、index.html の `?var=` を更新（HTTPキャッシュも `fetch(url,{cache:'reload'})` で更新）
- 訂正モードの項目状態（JS実行結果）:
  ```json
  {"mode":"update","codeReadOnly":true,"codeDisabled":false,"codeValue":"ZZTEST70",
   "others":["ユーザＩＤ:dis","テーマコード:","ユーザ名:","備考:","メールアドレス:","ユーザコード:ro","パスワード:","メニュー名:"]}
  ```
- 強制変更テスト: readonly を外して ユーザコード='ZZHACK70'・ユーザ名='ゼットテスト70改'（パスワード空）→ #実行 → 「訂正処理は正常に終了しました。」。再度 ユーザコード='ZZHACK71'・パスワード='Zz70new' → #実行 → 同メッセージ
- DB（実施後）:
  ```
  7|ZZTEST70|ゼットテスト70改|pw_updated=t|更新日時>登録日時=t|更新ユーザ=1     ← ユーザコード不変・名称／パスワードは更新
  ```
- 機械検証: 画面lint ERROR 0件 / pytest 161 passed / スモーク init・select OK
- ブラウザコンソール（onlyErrors）: なし
- 期待結果との一致: OK（C-070 是正確認）
