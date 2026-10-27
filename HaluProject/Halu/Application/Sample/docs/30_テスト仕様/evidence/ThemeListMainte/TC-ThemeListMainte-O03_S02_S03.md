# TC-ThemeListMainte-O03／S02／S03 実施エビデンス（代表: 排他選択・全件洗い替え・削除チェック除外）

- 実施日時: 2026-09-23 14:52〜14:59（Docker・ブラウザ（Chromium）、ADMIN001）。前提データ不要（テーママスタ既定3件: halu-custom_default／halu-custom_dark／halu-custom_navy）
- 実施前の現状: 3行（テーマコード順 dark→default→navy）。初期表示はdefault行の「使用」がチェック済み
- O03: navy行の使用ラジオをクリック → ☐☐☑（排他選択）。`document.head`末尾に`halu-custom_navy.css?var=202608311200`のlinkが追加、sessionStorage `Sample.Login.ＣＳＳファイル名`=`Sample/Html/css/halu-custom_navy.css`に更新。リクエスト0件
- S02: navy選択の状態で#実行 → 確認ダイアログなしで即実行、`#serverDialog`「テーマ 実行処理は正常に終了しました。」→ 再照会で☐☐☑（navyのみ使用中）
  DB（実行後）:
  ```
  halu-custom_dark   |使用中フラグ=NULL|登録ユーザ=1|更新ユーザ=1|登録日時=更新日時=2026-09-23 14:59:29
  halu-custom_default|使用中フラグ=NULL|登録ユーザ=1|更新ユーザ=1|登録日時=更新日時=2026-09-23 14:59:29
  halu-custom_navy   |使用中フラグ=1   |登録ユーザ=1|更新ユーザ=1|登録日時=更新日時=2026-09-23 14:59:29
  ```
- S03: dark行に削除チェック → #実行 → 同メッセージ → 一覧2行（default☐, navy☑）。DBも2行（dark行が消え、default・navyのみ残存）
- 後始末: テーマテーブルをDELETE→INSERTでベースライン3行（実施前の現状）へ復元し、差分なしを確認
- 期待結果との一致: OK
