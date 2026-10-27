# TC-OrderUpload-S04・S05・S07・S08・S09 実施エビデンス（DB件数の前後・ファイル残存／削除・直リクエスト・文字コード）

- 対象ケース: TC-OrderUpload-S04, S05, S07, S08, S09
- 実施日: 2026-09-25
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## 環境・方法

ファイル投入・確認ダイアログの操作方式は `TC-OrderUpload-O03_O04_O06_O07_S02.md` の「環境・方法」節と共通。S08のみ、checkモードを経ない直リクエストのため `fetch` による直接POSTを使用した（`window.Halu.MainASGIURL` へ `mode:"execute"` のペイロードを送信）。S09は、Shift_JISへ実際にエンコードするライブラリがブラウザJSに無いため、「UTF-8として不正な生バイト列（0x82 0xA0＝Shift_JISの「あ」）」を備考欄に埋め込む方式で代替した（`OrderUpload_model.py.readLines` は `open(file, encoding='UTF-8')` の例外捕捉のみを見ており、原因がShift_JISかどうかまでは判定していないため、同じ失敗経路＝`UnicodeDecodeError`を再現できる）。

## S04 取込中止時の受注ＣＳＶの状態とバッチ未起動

- S03（`order_upload_error.csv`。前回取込分が残っている状態）と同じ操作の前後でSQLスナップショットを比較
- 実施前: 受注ＣＳＶ（前回分残存）／実施後: 受注ＣＳＶ0件（前回分も含めて削除）
- 受注ヘッダ・受注明細は本操作の前後で無変化（1件も増えない）
- バッチ管理レコードも作成されない（executeモードが要求されないため）
- 受注ＣＳＶエラーは今回の3件のみが登録されている（前回分は洗い替え済み）

## S05 取込中止時のファイル残存と再実行

- ①サーバー側アップロード先を確認: `docker compose exec -T app ls -l /home/halu_user/.../Sample/UpLoad/Apps/OrderUpload/` に `order_upload_error.csv`（タイムスタンプ 09:39:33）が残存していることを確認
- ②CSVを再アップロードせず、同一画面のまま `#実行` → `#executeDialogYES`
- 観測結果: checkモード応答のエラー件数が3件（S03と同内容）、`受注ＣＳＶエラー`が新しいＩＤ（32〜34）で同内容に再作成される＝サーバー側に残ったファイルが再読込されていることを確認

## S07 正常取込時のエラー明細の洗い替え

- 前提: 受注ＣＳＶエラーに1件（別ケースのHTMLエスケープ検証で発生した行）が残っている状態
- `order_upload_s03_clean.csv`（TS26080698・1明細・エラー0件）をアップロード → `#実行` → `#executeDialogYES`
- 観測結果: checkモードのエラー件数=0 → 自動でexecuteモードが送信され `message.msg:"バッチ処理を起動しました。"`
- 実行後、受注ＣＳＶエラーが0件になっている（洗い替え）ことをSQLで確認
- バッチ管理: 該当ＩＤが開始〜完了（分割3/3）まで正常終了、受注ヘッダ TS26080698・受注明細1行が生成されたことを確認
- ※本書の前提記載（S06実施直後で8件残存）とは異なり、本実施ではHTMLエスケープ検証（S06(ErrorList)）由来の1件が残る状態で実施した。差異はあるが「取込のたびに全件洗い替える」という検証目的自体は1件でも満たされることを確認した上でOKと判定した

## S08 取込対象なしでのバッチ起動防止（checkを経ない直リクエスト）

- 事前SQLで受注ＣＳＶが0件であることを確認
- ブラウザコンソールから以下のペイロードで `window.Halu.MainASGIURL` へ `fetch` 直接POST（`mode:"execute"`、ファイル名 `dummy_not_exist.csv`）

```json
{
  "comment": "S08 direct execute (checkを経ない直リクエスト)",
  "html": "Sample/Json/Apps/OrderUpload",
  "mode": "execute",
  "records": [
    {"id": "header", "record": {"ファイル名": {"value": ["dummy_not_exist.csv"]}}}
  ]
}
```

- 応答: `{"message":{"status":"ERROR","msg":"取込対象のデータがありません。ＣＳＶファイルをアップロードしてから実行してください。"}}`（MSG-016）
- バッチ管理件数が本操作の前後で変化していないことをSQLで確認
- サーバーログ（model.log）に「checkCsvNotEmpty 受注ＣＳＶが0件のためバッチを起動しません」の記録を確認

## S09 文字コード不正ファイルの取込

- UTF-8として不正なバイト列（`0x82 0xA0`＝Shift_JIS（CP932）における「あ」）を備考欄に埋め込んだCSV（`order_upload_s09_sjis.csv`）を注入
- アップロード自体は成功（File Listに完了表示。バイト列のままサーバーへ送信されるため）
- `#実行` → `#executeDialogYES`
- 観測結果: `#alertDialog` タイトル「サーバエラー」、本文「ＣＳＶファイルを読み込めませんでした。文字コードがＵＴＦ－８か確認してください。」（MSG-017）
- 受注ＣＳＶ・受注ＣＳＶエラーとも本操作の前後で無変化であることをSQLで確認（`readOrderUpload`内でERRORが確定し、以降のsqlsが未実行のままロールバックされる）
- サーバーログ（model.log）に `UnicodeDecodeError`（position 196・バイト `0x82` 付近）の記録を確認
