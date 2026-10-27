# TC-Error404-T01 実施エビデンス（代表: T分類。O02／O03を含む）

- 実施日時: 2026-09-21 13:55〜14:00
- Error404 到達時の sessionStorage: 画面遷移="Sample/Html/Apps/Login:Sample/Html/Apps/StartMenu"、StartMenu.ターゲットタブ="tab_2"
- Esc押下（O03）／`#戻る`クリック（O02）いずれも `POST Haluhtml` → title=「メニュー(一般ユーザ用)」
  ```json
  {"title":"メニュー(一般ユーザ用)","active":["tab_2"],"trans":"Sample/Html/Apps/Login"}
  ```
  （遷移スタックから StartMenu が pop され、StartMenu は保存済み tab_2 を復元。init は再送信されない）
- 期待結果との一致: OK
