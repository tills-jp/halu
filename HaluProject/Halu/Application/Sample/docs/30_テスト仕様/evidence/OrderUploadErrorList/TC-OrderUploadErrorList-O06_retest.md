# TC-OrderUploadErrorList-O06（再） 実施エビデンス

- 対象ケース: TC-OrderUploadErrorList-O06（再）
- 実施日: 2026-09-25
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## 環境・方法

C-075 の修正版 `multiTableListForm.model.mixin-1.0.0.js`（`onテーブル行クリック` の先頭で `sessionStorageDetailKey` が未定義／空配列の場合はキー保存処理をスキップして早期に`"OK"`を返すガードを追加）を配置し、本ミックスインを読み込む5画面（BatchDivisionList・BatchList・OrderList・OrderUploadErrorList・UserList）の `index.html` が `?var=202609251000` を読み込んでいることを確認したうえで実施した。

## O06 明細行クリック（再実施）

- 受注ＣＳＶエラーへ検証用2行（TS26092501／TS26092502）を投入し、一覧に「1/1ページ(2件)」で表示させた
- 2行目の `td` をクリック
  - 観測結果: 2行目の全セルに `table-success` が付与され、sessionStorageの「クリック行」に `1` が設定された（0始まり）
  - ブラウザコンソールに新規のエラー・例外は出力されなかった
  - 画面遷移は発生しなかった
- 続けて1行目の `td` をクリック
  - 観測結果: ハイライトが1行目へ移動し、2行目のハイライトは解除された
- 検証用2行は実施後に削除済み

## 退行確認（キー定義がある画面）

- 受注一覧（OrderList。`sessionStorageDetailKey` に受注番号のキー定義あり）で3行目をクリック
  - 観測結果: 当該行がハイライトされ、sessionStorageの受注番号=`OR26060901`、クリック行=`2` が設定された（従来どおり）。コンソールエラーなし
- 本修正（キー未定義時の早期リターン追加）がキー定義済み画面の既存挙動に影響しないことを確認した

## 結論

C-075 の修正（`onテーブル行クリック` のキー未定義時ガード追加）により、`sessionStorageDetailKey` が空定義の画面（OrderUploadErrorList）でTypeErrorが発生せずハイライトに到達する不具合は解消したことを確認した。あわせて、キー定義がある画面（OrderList）の行クリック→ハイライト→sessionStorage保存の挙動に退行がないことを確認した。
