# TC-AdminMenu-T02 実施エビデンス（代表: T分類）

- 実施日時: 2026-09-21 13:52:47
- 手順: ヘッダー右上「ログアウト」（`.logout-link`）クリック
- 観測結果: ネットワーク `POST /HaluASGI/Halumain`（term）→ `POST /HaluASGI/Haluhtml` → title=「ログイン」
  ```json
  {"title":"ログイン","ss":{"Sample.Login.ＣＳＳファイル名":"Sample/Html/css/halu-custom_default.css","_webstorage_id_name_":"Sample.Login"}}
  ```
  （Login.*・AdminMenu.*・画面遷移 のキーは全て消えている。残る2キーはLogin画面のinitで再設定されたもの）
- 期待結果との一致: OK（S04のログオフ記録も同時刻にINSERT済み）
