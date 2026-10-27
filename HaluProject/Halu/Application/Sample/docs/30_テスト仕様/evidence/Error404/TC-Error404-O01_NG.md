# TC-Error404-O01 実施エビデンス（NG → C-069）

- 実施日時: 2026-09-21 13:54〜14:00（3回再現）
- 到達経路: StartMenu（TEST001）でメニューカードの `name` を `Sample/Html/Apps/ZZNotExist` に書き換えてクリック → `halu.py` のフォールバックで Error404/index.html が返る
- 表示の観測（期待どおり）:
  ```json
  {"title":"エラー(404)","text":"エラー(404) 戻る：Esc 指定されたプログラムは、未実装です。 戻るボタンを押下してください。","modoru":true,"modoruText":"戻る：Esc","loginInfo":0}
  ```
- ブラウザコンソール（NG要因）:
  ```
  [log] Model initExecute : start
  [warn] jQuery.Deferred exception: Cannot read properties of undefined (reading 'getData') TypeError
      at Model.initExecute (Application/Sample/Html/js/singleTableListForm.model.mixin-1.0.0.js:27:34)
      at Controller.synchroCheckValidation (System/Html/js/halucontroller.mixin-1.0.0.js:402:18)
      at Controller.synchroCheckDataset (System/Html/js/halucontroller.mixin-1.0.0.js:380:14)
      at Controller.initialSetting (System/Html/js/halumvc-1.0.0.js:1670:12)
      at AppSpec.initialSetting (System/Html/js/halumvc-1.0.0.js:1350:18)
      at HTMLDocument.<anonymous> (Application/Sample/Html/Apps/Error404/Error404.main.js:12:11)
  [error] Uncaught TypeError: Cannot read properties of undefined (reading 'getData')
  ```
- 原因: Error404.appspec.js は `dataset:"no"`（JSON定義なし）だが、Error404.model.js が `SingleTableListFormModelMixin` の `initExecute`（`this.dataset.getData()`）を上書きしていない（Controller側は空実装で上書き済み）
- 判定: NG（表示は期待どおりだがJSエラーが残る）。変更管理台帳 C-069 起票（承認待ち）
