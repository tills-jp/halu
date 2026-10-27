# TC-BatchOrderUpload-P05（再） 実施エビデンス（NG 1件の是正後再実施）

- 対象ケース: TC-BatchOrderUpload-P05（再）（batchKey 対象0件時の起動・境界）
- 実施日: 2026-09-28 10:21
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001
- 前提: 本ケースはA-035（テスト仕様書P05の期待結果をC-041の仕様＝0件時はバッチを起動せずMSG-016でブロックする挙動へ是正）を受けての再実施。実装側の変更はなし（当初の観測どおりの挙動を、是正後の期待結果と突き合わせて再判定した）

## 手順・観測

- ヘッダ行のみ（データ0件）のCSV `order_upload_u9_p05_empty.csv` をOrderUpload画面へアップロード（File List完了表示）
- `#実行`クリック→`#executeDialog`（title「受注CSVデータ 更新処理　確認」）表示を確認→`#executeDialogYES`
- checkモード応答: `header.エラー件数 = 0`（0件はエラー扱いにならない）
- 自動でexecuteモードが送信され、応答は `message.status:"ERROR"`・`message.msg:"取込対象のデータがありません。ＣＳＶファイルをアップロードしてから実行してください。"`（MSG-016）。表示要素は `#alertDialog`（title「サーバエラー」）

## DB突合

```sql
SELECT バッチ管理ＩＤ FROM バッチ管理 ORDER BY バッチ管理ＩＤ;
```

- 結果: `5, 17, 18, 19, 20, 21`（本操作の前後で変化なし。新規バッチ管理レコードは作成されない＝バッチ未起動）
- `SELECT COUNT(*) FROM 受注ＣＳＶ;` は0件のまま

## ログ

- `model.log` に `checkCsvNotEmpty 受注ＣＳＶが0件のためバッチを起動しません` を記録（`OrderUpload_execute_sql.json` の `count受注ＣＳＶ` ステップの `after` フック。C-041）
- `Logs/batch/batchstartup.log` に本操作に対応する起動記録なし（`BatchOrderUploadStart` が一切起動されないことを確認）

## アップロードファイルの後始末

- `order_upload_u9_p05_empty.csv` は `execute` の `after` フックまで到達しないため、他ケースと異なり自動削除されず残存する（P01・N01等のRun後は自動削除されるのと対照的）。実施後に手動で削除した

## 判定

OK。是正後の期待結果（execute応答がstatus ERROR・MSG-016となり、`batchStartup`に到達しないためバッチ管理レコードは作成されず`BatchOrderUploadStart`も起動されない）と実測が一致することを確認した。是正前NG（`TC-BatchOrderUpload-P01_P05_startup.md` のP05節）で観測した挙動そのものであり、実装は変更していない（判断(a): 実装＝C-041の仕様を正として仕様書側を是正）。
