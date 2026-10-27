# TC-StartMenu-O04／O05 実施エビデンス（代表: O分類）

- 実施日時: 2026-09-21 13:54（Docker・ブラウザ実走、ログイン TEST001）
- O04 観測結果:
  ```json
  {"active":["tab_3"],"target":"tab_3","visibleCards":["個人用テーマ設定"]}
  {"active":["tab_2"],"target":"tab_2","visibleCards":["顧客一覧登録","商品一覧登録"]}
  ```
  タブ1のカード: OrderList / OrderUpload / OrderUploadErrorList / BatchList。管理者専用（ユーザ一覧・システム用テーマ設定）は存在しない（C-042）
- O05 観測結果: 空き枠クリック→通信・遷移なし。「受注一覧」クリック→title=「受注一覧」、次画面名="Sample/Html/Apps/OrderList"、遷移スタック="Login:StartMenu"
- 期待結果との一致: OK
