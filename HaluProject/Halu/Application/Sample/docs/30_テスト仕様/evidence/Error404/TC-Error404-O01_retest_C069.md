# TC-Error404-O01 再実施エビデンス（C-069 修正後）

- 実施日時: 2026-09-21 14:2x（Docker・ブラウザ実走、ログイン TEST001）
- 前提: `Error404.model.js` に `initExecute` 空実装を追加、`index.html` の `?var=` を 202609211400 へ更新。ブラウザ側は `fetch(url, {cache:'reload'})` でHTTPキャッシュを更新（旧JSがキャッシュされていると初回はエラーが再現した）
- 到達経路: StartMenu のメニューカード `name` を `Sample/Html/Apps/ZZNotExist` に書き換えてクリック
- 観測結果（JS実行結果）:
  ```json
  {"title":"エラー(404)","protoHasGetData":false,
   "protoSrc":"function () {\n      $H.log(\"Model initExecute : start\");\n      $H.log(\"Model initExecute : end\");\n    }",
   "text":"エラー(404) 戻る：Esc 指定されたプログラムは、未実装です。 戻るボタンを押下してください。","modoru":true,"loginInfo":0}
  ```
- ブラウザコンソール（onlyErrors）: `No console logs`。`Model initExecute : start` → `end` が連続して出力（例外なし）
- 付随確認: `#戻る` クリックで StartMenu（tab_2復元）へ復帰、ログアウトで Login へ遷移。いずれもコンソールエラー0件
- 期待結果との一致: OK（C-069 是正確認）
