# TC-AdminMenu-O04／O05 実施エビデンス（代表: O分類）

- 実施日時: 2026-09-21 13:51（Docker・ブラウザ実走、ログイン ADMIN001）
- O04 観測結果（JS実行結果）:
  ```json
  {"active":["tab_2"],"pane":["タブ_2"],"target":"tab_2","visibleCards":["顧客一覧登録","商品一覧登録","ユーザ一覧"]}
  {"active":["tab_3"],"target":"tab_3","visibleCards":["個人用テーマ設定","システム用テーマ設定"]}
  ```
  （target = sessionStorage["Sample.AdminMenu.ターゲットタブ"]。タブ名は「受注管理／マスタ／システム」）
- O05 観測結果: 空き枠（`name=""`）クリック後も title=「メニュー(管理者用)」、HaluASGI リクエスト増なし。
  「ユーザ一覧」クリックで Halumain(userinfo) → Haluhtml → title=「ユーザ一覧」、sessionStorage["Sample.AdminMenu.次画面名"]="Sample/Html/Apps/UserList"
- 期待結果との一致: OK
