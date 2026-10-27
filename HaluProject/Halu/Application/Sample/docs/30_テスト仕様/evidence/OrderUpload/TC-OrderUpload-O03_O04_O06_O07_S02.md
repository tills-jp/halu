# TC-OrderUpload-O01・O03・O04・O06・O07・T01・S02 実施エビデンス

- 対象ケース: TC-OrderUpload-O01, O03, O04, O06, O07, T01, S02
- 実施日: 2026-09-25
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## 環境・方法

ファイル投入は `#drag-and-drop-zone input[type=file]` へ `File`＋`DataTransfer` オブジェクトを注入し `change` イベントを発火させる方式を用いた（dmUploader が `auto:true` のため即座に `/HaluASGI/HaluUpload` へ POST される）。CSV は既存のテストデータをそのまま使用した。

確認ダイアログ（Svelte 実行確認ダイアログ）は閉じるアニメーション完了（`outroend`）イベントで後続処理を呼び出す実装のため、ブラウザペインが非表示のままだとアニメーションが進まず後続処理が起動しない制約があった。このため、実施では「は い」ボタンを実クリックし（`sessionStorage.executeDialog=1` が実際に設定されることを確認済み）、その上で `#executeDialog` 要素へ `outroend` イベントを手動で dispatch して後続処理（check→execute）を進めた。画面コード自体の経路（`onExecuteDialogAfter`→`ajaxExecute("check")`）は変更していない。

## O01・T01 #戻る クリック（ESC同等）

- OrderUpload画面表示中に `#戻る` をクリック → 「メニュー(管理者用)」（AdminMenu）へ遷移することを確認
- 遷移後、OrderUpload画面が使用していた sessionStorage キーは残らない（0件）ことを確認

## O07 Enter/Tabのフォーカス移動

- `#戻る` にフォーカスを移し `Tab` キー押下 → フォーカスが `#実行` へ移動
- 続けて `Tab` キー押下 → フォーカスがファイル選択 `input` へ移動
- `#戻る` にフォーカスを戻し `Enter` キー押下 → フォーカスが `#実行` へ移動
- いずれの操作でも Halumain へのPOSTは発行されず、ダイアログも表示されないことをネットワーク一覧で確認

## O03 拡張子チェック異常（NG）

- `injectCsvText("not a csv file", "order_upload.txt")` を実行（拡張子が `.csv` でないファイルを注入）
- 観測結果: **何も起きない**。`#alertDialog`（期待される「ファイル選択エラー：ファイル名が間違っています。ファイルをキャンセル後、正しいファイル名：.csvを選択して下さい。」）は表示されず、HaluUploadへのPOSTも発行されず、File List・Debug Messagesにも変化がない
- 原因切り分け:
  - `OrderUpload.controller.js` の dmUploader 初期化オプションに `extFilter: ["csv"]` が設定されている
  - dmUploaderプラグイン本体（`jquery.dm-uploader.js` の `validateFile()`、434〜438行）は、拡張子が `extFilter` に一致しない場合、`onFileExtError` コールバックへ振り分けて `onNewFile` を呼ばずに処理を終える
  - `OrderUpload.controller.js` は `onFileExtError` を定義していない（dmUploader既定の空関数のまま）ため、モデル側の `onファイル選択チェック処理`（「ファイル名が間違っています」ダイアログを出す処理）に一切到達しない
  - 結果として、期待されるダイアログ表示が発生せず、ユーザーには「拡張子違いのファイルが選択されたが何も反応がない」ように見える
- 期待結果（本書2.2 O03）とは不一致のため **NG** と判定。是正案: `onFileExtError: function(file){ self.onファイル選択チェック処理(file.name); }` をコントローラへ追加すれば、既存のモデル処理でダイアログが出るようになる見込み（実装修正は本エビデンス作成時点では未実施。依頼者判断待ち）

### 対応

依頼者承認（2026-09-25 チャット「2件とも C番号を起票して修正してください」）を受け、C-074 で是正した（`OrderUpload.controller.js` へ `onFileExtError` を追加）。再実施は別ファイルに記録予定（`TC-OrderUpload-O03_C-074_retest.md` 等・テスト仕様書v2.1の再実施行を参照）。

再実施OK（2026-09-25）。エビデンス=`evidence/OrderUpload/TC-OrderUpload-O03_retest.md`

## O04 複数ファイル選択チェック

- 1件目 `order_upload_ok.csv` をアップロードし、File Listに「Upload Complete / 100%」表示・HaluUploadへのPOST 200を確認
- 続けて2件目 `order_upload_ok_dup.csv`（内容はok.csvと同一で受注番号違い）を選択
- 観測結果: `#alertDialog` タイトル「ファイル選択エラー」本文「複数のファイルは選択できません。」が表示される
- ネットワーク一覧で、2件目のファイルに対するHaluUploadへのPOSTが発行されていないことを確認（`onNewFile` 内でファイルが `cancel` されるため）
- 1件目のFile List表示（アップロード完了状態）は変化しないことを確認

## O06 実行確認ダイアログのキャンセル

- `#実行` をクリック → `#executeDialog` が表示される（タイトル「受注CSVデータ　更新処理　　確認」、本文「受注CSVデータ　更新処理を実行します。よろしいですか？」）
- `#executeDialogNO`（「いいえ」）をクリック
- ネットワーク一覧で、Halumainへのcheckモードのリクエストが発行されていないことを確認
- 画面状態（File List・ヘッダ情報）に変化がないことを確認

## S02 アップロードファイル未存在時の実行エラー

- 前提: `order_upload_ok.csv` をアップロード完了させた後、サーバー側の保存先ファイル（`Sample/UpLoad/Apps/OrderUpload/order_upload_ok.csv`）を削除した状態で確認した（「アップロード後にサーバー側ファイルを削除した状態で確認」）
- 同じ画面インスタンスのまま `#実行` → `#executeDialogYES`（「は い」）
- 観測結果: checkモードの応答が `message.status:"ERROR"`・`message.msg:"OrderUploadファイルが存在しません。"`。`#alertDialog` タイトル「サーバエラー」本文「OrderUploadファイルが存在しません。」が表示される
- executeモードのリクエストは送信されない
- SQLで、受注ＣＳＶ・受注ＣＳＶエラー・受注ヘッダ・受注明細・バッチ管理のいずれも本操作の前後で変化していないことを確認（フックがERRORを返した時点で以降のsqlsが実行されずロールバックされる仕様どおり）
