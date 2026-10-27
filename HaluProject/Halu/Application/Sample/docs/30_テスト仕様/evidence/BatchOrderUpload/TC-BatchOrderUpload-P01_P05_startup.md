# TC-BatchOrderUpload-P01〜P05 実施エビデンス（起動トリガー・パラメータ・キー・分割数・0件時の挙動）

- 対象ケース: TC-BatchOrderUpload-P01, P02, P03, P04, P05
- 実施日: 2026-09-28
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## 環境・方法

CSVのアップロードは `#drag-and-drop-zone input[type=file]` へ `File`／`DataTransfer` を注入して `change` イベントを発火させる方式（ファイル選択ダイアログを経由しない）。「実行」の確認ダイアログは `#executeDialogYES` をクリックした後、ブラウザペインを前面表示した状態のまま `#executeDialog` へ `outroend` イベントを手動で dispatch し、Svelte側の閉じアニメーション完了を待たずに後続の check→execute 呼び出しを確実に発火させた。BatchList／BatchDivisionList側の確認ダイアログ（削除・再処理）も同じコンポーネントのため同方式を用いた（本書エビデンス4・5参照）。

## Run1 投入内容（P01〜P04・N01・N04〜N06・L01〜L05の共通データ）

`order_upload_u9_main.csv`（3受注・6明細）:

| 受注番号 | 明細番号 | 顧客ＩＤ | 受注金額合計 | 商品コード | 受注数量 | 受注単価 | 受注金額 |
|---|---|---|---:|---|---:|---:|---:|
| TS26092801 | 1 | 1 | 10240 | ST001 | 2 | 800 | 1600 |
| TS26092801 | 2 | 1 | 10240 | ST004 | 3 | 2400 | 7200 |
| TS26092801 | 3 | 1 | 10240 | FD001 | 1 | 1440 | 1440 |
| TS26092802 | 1 | 2 | 800 | ST002 | 1 | 800 | 800 |
| TS26092803 | 1 | 3 | 5600 | FD002 | 2 | 900 | 1800 |
| TS26092803 | 2 | 3 | 5600 | ST005 | 1 | 3800 | 3800 |

## P01 batchStartupエントリによる起動トリガー（回帰確認）

- CSVアップロード完了（File List表示・`HaluUpload`へのPOST 200）後、`#実行`クリック→`#executeDialog`（title「受注CSVデータ 更新処理　確認」）表示を確認→`#executeDialogYES`
- checkモード応答: `header.エラー件数 = 0`
- 自動でexecuteモードが送信され、応答 `message.status:"OK"`・`message.msg:"バッチ処理を起動しました。"` を `#serverDialog`（title「サーバ処理確認」）で確認（09:42:43）
- `Logs/batch/batchstartup.log` に `batchstartup start`・引数に `BatchOrderUploadStart.py`・ユーザＩＤ等が記録されており、`subprocess.Popen` によるバッチロードスクリプト起動（C-005是正が回帰していないこと）を確認
- 起動されたバッチ管理ＩＤ = 21

## P02 batchParam（ユーザＩＤ・ユーザ名称の引き継ぎ）

```sql
SELECT ＪＳＯＮデータ FROM バッチパラメータ管理 WHERE バッチ管理ＩＤ = 21;
```

- 結果: `{"ユーザＩＤ": {"value": ["1"]}, "ユーザ名称": {"value": ["admin"]}}`
- ログインセッション（ADMIN001／表示名 admin）の値がそのまま引き継がれていることを確認

## P03 batchKey（受注ＣＳＶ全件・受注番号,明細番号昇順）

```sql
SELECT ＪＳＯＮデータ FROM バッチキー管理 WHERE バッチ管理ＩＤ = 21;
```

- 結果: `受注番号.value = [TS26092801,TS26092801,TS26092801,TS26092802,TS26092803,TS26092803]`、`明細番号.value = [1,2,3,1,1,2]`
- 受注番号・明細番号の昇順で6キーが登録され、欠落・重複がないことを確認

## P04 batchControll 分割数固定値

```sql
SELECT バッチ管理ＩＤ, 処理名, ロードパス名, 処理モード, 分割数, 分割終了数, ＮＥＸＴ処理名, ＤＢ名, 開始日時, 終了日時
FROM バッチ管理 WHERE バッチ管理ＩＤ = 21;
```

- 結果: 処理名「受注ヘッダ・受注明細 更新 バッチ処理」／ロードパス名 `Sample/Json/Apps/BatchOrderUploadProc`／処理モード `BatchOrderUploadProc_proc`／分割数 3／分割終了数 3／ＮＥＸＴ処理名 空／ＤＢ名 sample／開始日時 09:42:46.515／終了日時 09:42:53.087
- 分割数がリテラル固定値「3」で登録されることを実測で確認（1分割構成のテストは仕様上の制約により実施不可のまま）

## P05 batchKey 対象0件時の起動（NG）

- `order_upload_u9_p05_empty.csv`（ヘッダ行のみ・データ行0件）を投入（アップロード自体は成功。File List完了表示）
- `#実行`→`#executeDialog`表示を確認→`#executeDialogYES`
- checkモード応答: `header.エラー件数 = 0`（0件はエラー扱いにならない）
- 自動でexecuteモードが送信され、応答は `message.status:"ERROR"`・`message.msg:"取込対象のデータがありません。ＣＳＶファイルをアップロードしてから実行してください。"`（MSG-016）。表示要素は `#alertDialog`（title「サーバエラー」）
- SQLで確認: `SELECT COUNT(*) FROM バッチ管理;` が本操作の前後で変化なし（Run2終了時点=7件のまま。新規バッチ管理レコードは作成されない）。`SELECT COUNT(*) FROM 受注ＣＳＶ;` は0件のまま
- 原因切り分け: `OrderUpload_execute_sql.json` の `count受注ＣＳＶ` ステップの `after` フック `OrderUpload_model.checkCsvNotEmpty`（C-041で追加）が、受注ＣＳＶ0件のとき `message.status='ERROR'` を設定し、以降のsqls（`batchParam`・`batchStartup`を含む）を実行させない実装になっている。この経路は `BatchOrderUploadStart` 自体が一切起動されないため、テスト仕様書P05の期待結果（「バッチは正常に起動し、分割終了数が即座に3に達する」）とは一致しない
- 判定: 現行実装はC-041による意図的な安全対策（0件データでの誤起動防止）であり、バグではない。テスト仕様書のP05期待結果はC-041導入（2026-08-04）より前に書かれたままで更新漏れになっている。是正（期待結果の書き換え）は依頼者判断待ちとし、変更管理台帳側での申し送り事項とする
- アップロードファイル `order_upload_u9_p05_empty.csv` は `execute` の `after` フックまで到達しないため後始末フックが動かず残存が想定された。後始末時に手動確認し削除した
- 対応: A-035 で仕様書の期待結果を是正・再実施 OK（`TC-BatchOrderUpload-P05_retest.md`）
