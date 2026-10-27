# TC-OrderUpload-O03（再） 実施エビデンス

- 対象ケース: TC-OrderUpload-O03（再）
- 実施日: 2026-09-25
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## 環境・方法

C-074 の修正版 `OrderUpload.controller.js`（dmUploader初期化オプションへ `onFileExtError` を追加し、既存のモデル処理 `onファイル選択チェック処理` を呼び出す）を配置し、`index.html` の当該scriptタグが `?var=202609251000` を読み込んでいることを確認したうえで実施した。ファイル投入は `#drag-and-drop-zone input[type=file]` へ `File`＋`DataTransfer` オブジェクトを注入し `change` イベントを発火させる方式（初回実施と同一）。

## O03 拡張子チェック異常（再実施）

- `injectCsvText("not a csv file", "order_upload.txt")` を実行（拡張子が `.csv` でないファイルを注入）
- 観測結果:
  - `#alertDialog` タイトル「ファイル選択エラー」、本文「ファイル名が間違っています。ファイルをキャンセル後、正しいファイル名：.csvを選択して下さい。」が表示された
  - File List は「No files uploaded.」のままで変化なし
  - ネットワーク一覧で HaluUpload へのPOSTが発行されていないことを確認
  - Debug Messages 欄に「File 'order_upload.txt' 拡張子が .csv ではありません。」が追加された
- 期待結果（`OrderUpload_テスト仕様書.md` 2.4「再実施」TC-OrderUpload-O03（再））と一致するため **OK** と判定

## 結論

C-074 の修正（`onFileExtError` コールバックの追加）により、拡張子不一致時にダイアログが表示されない不具合は解消したことを確認した。初回NG時に確認した「HaluUploadへのPOSTなし・File List/Debug Messages無変化」という副次観測（アップロードそのものが行われないこと）は今回も維持されており、退行はない。
