# TC-BatchOrderUpload-E01・E03・E04・E06 実施エビデンス（異常系・OK 4件）

- 対象ケース: TC-BatchOrderUpload-E01（エラーデータ混在時の挙動）, E03（BatchRerun.py CLIによる代替再処理）, E04（同一バッチの二重起動）, E06（商品未解決行のエラー終了と再処理による復旧）
- 実施日: 2026-09-28 10:48〜11:48
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## 環境・方法

U8/U9と同じ方式（`#drag-and-drop-zone input[type=file]`へのFile注入・確認ダイアログの`outroend`手動発火）。E01はcheckを経ないexecute直リクエスト（fetch。U8 S08と同じ方式）。E03/E06はCLI `python Server/BatchRerun/BatchRerun.py sample {ID} {分割} 3`（コンテナ内`cd /home/halu_user/HaluProject/Halu/Application/Sample`）。実施順は運用手順書のとおり E04→E06→E01→E02＋S02（別ファイル）→E03→E05（別ファイル）。

バッチ管理ＩＤは 23（E04 Run1）・24（E04 Run2）・25（E01 失敗→E03で完了）。

## E04 同一バッチの二重起動（重複防止・OK）

投入CSV `order_upload_u10_e04.csv`（3受注・6明細。分割2・2・2。分割2の2行目TS26092812がE06の対象＝商品コードST007）:

```
受注番号,明細番号,顧客ＩＤ,受注日,受注金額合計,商品コード,納期日,受注数量,受注単価,受注金額,備考
TS26092811,1,1,20260928,10240,ST001,20261005,2,800,1600,U10 E04 行1
TS26092811,2,1,20260928,10240,ST004,20261005,3,2400,7200,U10 E04 行2
TS26092811,3,1,20260928,10240,FD001,20261005,1,1440,1440,U10 E04 行3
TS26092812,1,2,20260928,1000,ST007,20261006,1,1000,1000,U10 E04 行4(E06対象)
TS26092813,1,3,20260928,5600,FD002,20261007,2,900,1800,U10 E04 行5
TS26092813,2,3,20260928,5600,ST005,20261007,1,3800,3800,U10 E04 行6
```

- Run1: 取込→#実行→YES→check（エラー件数0）→execute→「バッチ処理を起動しました。」→バッチ管理ID23（10:49:01〜08・分割数3・分割終了数3・終了日時あり）でヘッダ3件・明細6件を登録
- Run2: 同一CSVを再アップロードして再実行→バッチ管理ID24（10:49:57〜10:50:04・分割数3・分割終了数3・終了日時あり）は正常終了し、ヘッダ3件・明細6件のまま（全体16／32不変）
- `(受注番号,明細番号)`の重複0を確認
- `batchclientmodel.log`の`notEmptyPassForSqlsDataOfBatchProc end status : PASS`はRun1で9回、Run2で48回（Hinsert/Minsert全行スキップ）
- ERROR増分0

判定: OK。2回目の実行でも重複INSERTは発生しない。

## E06 商品未解決の分割エラーと再処理による復旧（OK）

前提: E04完了直後。対象バッチはID23（分割2＝行3=TS26092811/3、行4=TS26092812/1）。

失敗を作る操作:
```sql
DELETE FROM 受注明細 WHERE 受注番号 = 'TS26092812' AND 明細番号 = 1;
UPDATE 商品 SET 削除フラグ = '9' WHERE 商品ＩＤ = 7 AND 商品コード = 'ST007';
```

①再処理（失敗するはず）: `docker compose exec -T app sh -c 'cd /home/halu_user/HaluProject/Halu/Application/Sample && python Server/BatchRerun/BatchRerun.py sample 23 2 3; echo EXIT=$?'`

- CLI出力: トレースバック最終行 `KeyError: 'sample'`、`EXIT=1`
- `batchclientmodel.log`増分に`<ERROR> : BatchOrderUploadProc_model checkProductResolvedOfBatchProc 商品未解決 : 受注番号 = TS26092812, 明細番号 = 1, 商品コード = ST007`（続けて`BatchClientModel call exception message : SQL実行 エラー`）。NOT NULL制約違反（`null value in column`）のERRORは無し
- `SELECT COUNT(*) FROM 受注明細 WHERE 受注番号 = 'TS26092812'` → 0（登録されない）
- バッチ管理ID23の分割終了数3・分割2の開始/終了日時はE04 Run1の値のまま（失敗した再処理の更新はロールバック）

復旧:
```sql
UPDATE 商品 SET 削除フラグ = '0' WHERE 商品ＩＤ = 7 AND 商品コード = 'ST007';
```
`SELECT * FROM 商品 WHERE 商品ＩＤ = 7` が事前スナップショット（削除フラグ'0'・更新日時2026-08-04 17:14:29.887839）と完全一致することを確認。

③再処理（成功するはず）: 同じCLIコマンドを再実行 → `EXIT=0`（出力なし）

- `SELECT 受注番号, 明細番号, 商品ＩＤ, 商品名称, 受注数量, 受注単価, 受注金額, 備考 FROM 受注明細 WHERE 受注番号 LIKE 'TS2609281%' ORDER BY 1, 2` → TS26092812/1が商品ＩＤ7「付箋 75×25mm (20冊入)」・1×1,000=1,000・備考「U10 E04 行4(E06対象)」で復活。他5明細は重複なし
- 観測事項: 分割終了数が3→4（分割数超過。再処理成功のたびに+1する実装。既存ID5の6と同じ機構）。分割2の開始/終了日時が再処理時刻（10:50:47）に更新

判定: OK。①登録されず分割がエラー終了 ②ERRORレベルで`商品未解決 : 受注番号 = …`が出力 ③マスタを戻して再処理すると正しく登録、を確認。分割終了数4は仕様外の副作用として備考に記録（NGにはしない）。

## E01 エラーデータ混在時の挙動（要実機確認の解消・OK）

前提: E06完了（ST007復元確認済み）。

**画面経路が使えない理由**: OrderUploadのcheck（`OrderUpload_check_sql.json`＋`OrderUpload_model.py checkCsvLine`）は受注ヘッダ・受注明細のDB制約（顧客ＩＤ・商品ＩＤのFK等）をすべて事前に塞いでおり、`OrderUpload S06`（U8実施済み・OK）で全件中止となることを確認済み。よって本ケースは、受注ＣＳＶへSQLで制約違反行を直接投入し、checkを経ずにexecute直リクエスト（fetch。U8 S08方式）で再現した。

失敗を作る操作: 受注ＣＳＶを6行（分割1=TS26092821/1・2（正常）、分割2=TS26092822/1（正常＝巻き込み確認）・TS26092823/1（顧客ＩＤ999＝受注ヘッダFK違反）、分割3=TS26092824/1・TS26092825/1（正常＝後続分割の実行有無確認））へ差し替え、`directExecute()`ヘルパでexecute直リクエストを送信。応答は`status:"OK"`・`msg:"バッチ処理を起動しました。"`。

観測（約10〜15秒後）:
- 受注ヘッダ: TS26092821のみ（顧客1・2400）。22（正常行）も23・24・25もなし
- 受注明細: TS26092821/1・21/2の2件のみ
- バッチ管理ID25: 分割数3・**分割終了数1**・開始日時10:51:35・**終了日時空**
- バッチ分割管理: 分割1 開始=終了10:51:35、分割2・3とも空
- バッチキー管理: 6キー（21/1,21/2,22/1,23/1,24/1,25/1）
- `batchclientmodel.log`: `BatchClientModel fromRequestToSql exception message type : <class 'sqlalchemy.exc.IntegrityError'>`／`(psycopg2.errors.ForeignKeyViolation) insert or update on table "受注ヘッダ" violates foreign key constraint "受注ヘッダ_顧客ＩＤ…"`／`BatchClientModel call exception message : SQL実行 エラー`（各行5回重複出力）
- `batchserver.log`: `<ERROR> BatchServer abnormal message : 'sample'`
- `batchclientserver.log`・`batchservermodel.log`・`batchclientdatabase.log`にERRORなし
- 画面には失敗が返らない（起動時点で「バッチ処理を起動しました。」表示済み）

判定（事実記録）: **エラー行を含む分割2は同分割の正常行TS26092822も巻き込まれてロールバック＝未登録**（分割単位の1トランザクションのため）。**後続分割3は実行されず、バッチ全体が停止**（「その分割だけ失敗して他は続行」ではない）。**先行分割1はコミット済みで残存**。仕様書の問い（分割のみ失敗か全体停止か）に対し実測で「全体停止（先行分割はコミット済みで残る）」と答えられたためOK（要実機確認の解消）。

申し送り: 設計書`BatchOrderUpload.md`5章「個別行のSQL実行時エラー」は「フレームワーク標準の挙動に委ねる」とだけ書かれ、①分割単位ロールバック（同分割の正常行も巻き込む）②後続分割は未実行③失敗分割の開始日時も空、が未記載。設計書への追記は仕様変更として別途反映する。

## E03 BatchRerun.py（CLI）による代替再処理（OK）

前提: E01直後（バッチ管理ID25 分割終了数1・分割2/3空）。E02（別ファイル参照）でNGとなったため、E01の失敗バッチの分割3（未実行）をE03として実施。

操作: `docker compose exec -T app sh -c 'cd /home/halu_user/HaluProject/Halu/Application/Sample && python Server/BatchRerun/BatchRerun.py sample 25 2 3; echo EXIT=$?'` → `EXIT=0`・出力なし。失敗分割2のみ再実行（ヘッダ22（顧客2）・23（顧客5。E02で顧客ＩＤを是正済み）、明細22/1・23/1追加。分割1の21は明細2件のまま）。分割終了数1→2、分割2開始=終了10:54:31、終了日時は空のまま。

続けて `… 25 3 3` → 分割3（E01では未実行）が実行され、ヘッダ24・25／明細24/1・25/1追加、分割終了数3・終了日時10:54:38（完了）。

- 全6キー各1件・重複0
- ERROR増分0

判定: OK。失敗した分割単位のみが再実行され、正しくDBへ反映された。BatchDivisionList F2（Issue #91でNG）とは別経路の代替手段として有効であることを確認。分割3は「失敗」ではなく「未実行」（E01でバッチ全体停止のため到達しなかった分割）である旨を明記する。
