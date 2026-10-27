# TC-Login-O02 実施エビデンス（代表: O分類）

- 実施日時: 2026-08-07 16:2x
- 前提: ログインＩＤ="ADMIN001"、パスワード="admin" を入力済み
- 手順: Escキー押下
- 観測結果（JS実行結果）:
  ```json
  { "activeElement": true, "idAfter": "", "pwAfter": "" }
  ```
  （activeElement=true はログインＩＤ欄がactiveElementであることを示す）
- ネットワークリクエスト確認: Esc押下前後で新規POSTなし（最後のPOSTは初期表示時のinitのまま）
- 期待結果との一致: OK（両欄クリア、フォーカスがログインＩＤへ復帰、通信なし）

# 付随確認: TC-Login-O03（クリアボタン非表示）

- 観測結果:
  ```json
  { "found": true, "id": "クリア", "display": "none", "visibility": "visible", "offsetParent": false }
  ```
- 期待結果との一致: OK（display:noneで非表示、DOM・id・ハンドラは削除されていない）
