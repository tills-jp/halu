# TC-OrderUploadErrorList-O06(NG)・O07・S05・S06 実施エビデンス

- 対象ケース: TC-OrderUploadErrorList-O06（NG）, O07, S05, S06
- 実施日: 2026-09-25
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## O06 明細行クリック（NG）

- エラー明細が8件表示されている状態で、明細行の `td` をクリック（実クリック・JavaScriptによる `click()` 呼び出しの両方で確認）
- 観測結果: クリックした行にハイライト（`table-success`等）が付与されない。sessionStorageの「クリック行」に相当するキーも設定されない
- ブラウザコンソールに `Uncaught TypeError: Cannot read properties of undefined (reading 'datasetid')` が出力される（発生箇所: `multiTableListForm.model.mixin-1.0.0.js` 140行付近 `this.appspec.sessionStorageDetailKey[0]["datasetid"]`）
- 原因切り分け:
  - 本画面（OrderUploadErrorList）の appspec は `sessionStorageDetailKey: []`（遷移先を持たないため空定義）
  - 一覧パターンの共通モデルミックスイン `onテーブル行クリック` は `sessionStorageDetailKey` に要素が存在する前提で `[0]["datasetid"]` を参照する実装になっており、空配列の場合に `undefined` の添字アクセスで例外が発生する
  - 例外が発生した時点で処理が中断するため、本来ハイライトのみを行うはずの後続処理（ビュー側の `table-success` 付与）に到達しない
  - 画面遷移・値の引き継ぎは発生しない（本画面の仕様どおり。これ自体は期待に反しない）
- 期待結果（本書2.2 O06「クリックした行が選択状態（ハイライト）になる」）とは不一致のため **NG** と判定
- 是正案: 共通ミックスイン `multiTableListForm.model.mixin` の `onテーブル行クリック` 先頭で `sessionStorageDetailKey` が空の場合は早期に "OK"（ハイライトのみ）を返す分岐を追加する、または本画面の `model.js` 側で `onテーブル行クリック` をハイライトのみの処理へ上書きする、のいずれかで解消できる見込み（実装修正は本エビデンス作成時点では未実施。依頼者判断待ち）
- 影響範囲: 同じ共通ミックスインを使用する他画面（OrderList・UserList・BatchList等）は `sessionStorageDetailKey` に遷移先キーが定義されているため、本不具合の影響を受けない

### 対応

依頼者承認（2026-09-25 チャット「2件とも C番号を起票して修正してください」）を受け、C-075 で是正した（`multiTableListForm.model.mixin-1.0.0.js` の `onテーブル行クリック` へキー未定義時のガードを追加）。再実施は別ファイルに記録予定（`TC-OrderUploadErrorList-O06_C-075_retest.md` 等・テスト仕様書v1.5の再実施行を参照）。

再実施OK（2026-09-25）。エビデンス=`evidence/OrderUploadErrorList/TC-OrderUploadErrorList-O06_retest.md`

## O07 再表示クリック（F1同等）

- タブAで8件表示のまま保持し、タブB（別セッション）で `order_upload_error.csv` を取込中止（3件のエラー発生）
- タブAで `#再表示` をクリック → 一覧が3件に更新され、ページ情報「1/1ページ(3件)」（1ページ目）になることを確認

## S05 取込のたびの洗い替え

- 上記O07の操作により、前回の8件は残らず、今回の3件だけが表示されることを確認（8+3=11件にはならない）

## S06 ＣＳＶ由来値のＨＴＭＬエスケープ

- 明細番号に `<img src=x onerror=alert(1)>` を持つCSV（`order_upload_s06_xss.csv`）を取込中止（1件のエラーが発生）
- メニューから本画面を表示し、当該行の「項目値」セルを確認:
  - `read_page`／`get_page_text` によるセルのテキストが `<img src=x onerror=alert(1)>` という文字列そのままであることを確認
  - `document.querySelector('#mainTable img')` の実行結果が `0`（`<img>` 要素が生成されていない）であることを確認
  - `read_console_messages` で新規のJSエラー・`alert` 実行の痕跡が無いことを確認（`onerror` が発火していればコンソールまたは実際のalertダイアログに痕跡が出るはずだが、いずれも観測されなかった）
- 値がHTMLとして解釈されず、文字列としてそのままエスケープ表示されることを確認
