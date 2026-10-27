# バッチ仕様: 受注ヘッダ・受注明細データ更新バッチ（BatchOrderUploadStart / BatchOrderUploadProc）

| 項目 | 内容 |
|------|------|
| バッチID | BatchOrderUploadStart（起動）／BatchOrderUploadProc（処理） |
| バッチ名 | 受注ヘッダ・受注明細データ更新バッチ |
| 実行契機 | イベント（OrderUpload画面の「実行」操作から起動。定期スケジュールなし） |
| 作成日 | 2026-10-05 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | 1.0 |

---

## 0. 起動画面・処理画面を1本の設計書にまとめた理由

Halu開発ガイド『バッチ処理』のバッチ実装パターンでは、1つのバッチ処理は「起動画面」（`BatchOrderUploadStart`：batchParam/batchKey/batchControllを定義）と「処理画面」（`BatchOrderUploadProc`：分割単位で実際の業務SQLを実行）の2つのJsonフォルダに分かれる。両者は`batchControll`の`処理モード`/`ロードパス名`で機械的に連鎖しており、実運用上も1つのバッチ処理単位として`BatchList`・`BatchDivisionList`画面で管理・再処理される（BatchList/BatchDivisionListからは1件の「バッチ管理」レコードとしてしか見えず、起動と処理を別々に扱う必要がない）。以上より、構造上分割の必要性は薄いと判断し、**Start／Procを1本の設計書にまとめた**。

---

## 1. 要件

| 要件ID | 区分 | 要件 | 背景・理由 |
|--------|------|------|-----------|
| REQ-011 | 一括登録 | 受注データはCSVファイルによる一括アップロードでも登録できる | 件数が多い受注データを都度手入力する負荷を避けるため（10_要件定義/要件定義書.md 4.1） |
| REQ-012 | バッチ管理 | CSVアップロードの取込みはバッチ処理として実行し、実行状況を一覧・分割区分単位で確認・再処理できる | 大量データの取込みを画面応答をブロックせずに処理し、失敗時に部分再処理できるようにするため（10_要件定義/要件定義書.md 4.1） |
| REQ-013 | 名寄せ | 受注ＣＳＶの商品コードから商品マスタの商品ＩＤ・商品名称を解決して受注明細へ登録する（有効な商品＝削除フラグ='0' のみ対象） | 受注明細.商品ＩＤがNOT NULL＋FK制約になったため（C-019・要件定義書REQ-014-4）。商品名称は受注時点のスナップショットとして商品マスタから転記する（画面の商品選択＝C-044と同じ方式に統一） |
| REQ-014 | エラー | 商品ＩＤを解決できない行はDB制約違反に頼らず明示的なエラーとし、当該分割をエラー終了させる（受注番号・明細番号・商品コードをログへ記録） | 通常はOrderUpload画面の取込時チェックで弾かれるため、本エラーに至るのは再処理時や取込後に商品が論理削除された場合。原因の分かりにくいNOT NULL制約違反として落とさないため（C-045） |

---

## 2. 入出力

| 区分 | 対象 | 内容 |
|------|------|------|
| 入力 | 受注ＣＳＶ（テーブル全件） | OrderUpload画面が事前にアップロードCSVの内容を全件insert済みのステージングテーブル。`受注番号, 明細番号`の昇順で全件をバッチキーとして取得する |
| 入力 | バッチパラメータ（ユーザＩＤ・ユーザ名称） | OrderUpload画面のログインセッション情報（`login`レコード）から引き継ぐ |
| 入力 | 商品（テーブル） | 受注ＣＳＶの商品コードから商品ＩＤ・商品名称を解決するために参照する（削除フラグ='0' の行のみ。C-045） |
| 出力 | 受注ヘッダ（テーブル） | 受注番号が未登録の場合のみINSERT（受注番号・顧客ＩＤ・受注日・受注金額合計） |
| 出力 | 受注明細（テーブル） | 受注番号＋明細番号が未登録の場合のみINSERT（商品ＩＤ・商品名称は商品マスタから、納期日・受注数量・受注単価・受注金額・備考は受注ＣＳＶから） |
| 出力 | バッチ管理／バッチ分割管理／バッチパラメータ管理／バッチキー管理（フレームワーク内部テーブル） | バッチサーバーが自動登録・更新する進捗管理データ（`py_batch.md`「5. batchtables」参照） |

### 2.1 起動パラメータ

起動画面 `Json/Apps/BatchOrderUploadStart/BatchOrderUploadStart_start_sql.json` の各エントリで渡す値（すべて実装からの転記）。

| パラメータ | 値・既定 | 用途 |
|-----------|---------|------|
| batchParam.ユーザＩＤ | OrderUpload画面の`login`レコード（ログインセッション）から引き継ぐ | バッチパラメータ管理へＪＳＯＮとして保持。本バッチの業務ＳＱＬでは参照していない |
| batchParam.ユーザ名称 | 同上 | バッチ管理.ユーザ名称（起動ユーザ）へ記録する |
| batchKey | 受注ＣＳＶ全件を `受注番号, 明細番号` の昇順でSELECT（絞り込み条件なし） | 分割単位へ割り当てる処理対象キー |
| batchControll.バッチ管理ＩＤ | 空（バッチサーバーがSEQUENCEで採番） | バッチ管理の主キー |
| batchControll.会社名／部門名 | `TILLS` ／ `システム開発`（固定値） | バッチ管理への記録（表示用） |
| batchControll.処理名 | `受注ヘッダ・受注明細 更新 バッチ処理`（固定値） | BatchList画面での識別名 |
| batchControll.ロードパス名 | `Sample/Json/Apps/BatchOrderUploadProc`（固定値） | 分割処理が読み込むJson定義の場所 |
| batchControll.処理モード | `BatchOrderUploadProc_proc`（固定値） | 分割処理で実行するtran/sqlのファイル名プレフィックス |
| 分割数 | **3固定**（`分割数` の値が `"3"` のリテラル。分割終了数の初期値は `"0"`） | バッチキーを3等分して分割管理する単位 |
| batchControll.ＤＢ名／コミット件数 | `sample` ／ `0`（固定値） | 接続先DB名／コミット件数の指定（0） |
| batchControll.ＮＥＸＴ処理名／ＮＥＸＴロードパス名 | いずれも空文字 | 後続バッチへの連鎖起動は行わない（単発バッチ） |
| batchStartup.バッチ処理名／バッチロードパス名 | `受注ヘッダ・受注明細データ更新` ／ `Sample/Server/BatchLoad/BatchOrderUploadStart.py` | AppServerがバッチ起動トリガーを検知するためのエントリ（`OrderUpload_execute_sql.json`側にも同じ値で定義。起動画面自身の定義は現行フローでは消費されない＝6章参照） |

---

## 3. 処理概要

```
[OrderUpload画面]
  ユーザーがCSVファイルをアップロードし「実行」を押下
    ↓ execute
  OrderUpload_execute_sql.json
    1. 受注ＣＳＶテーブルを全件DELETE
    2. アップロードファイルの内容を受注ＣＳＶへ全件INSERT
    3. id="batchStartup" のエントリ（バッチ処理名・バッチロードパス名）を検知
       ↓
[AppServer: maincontroller.py]
  sqls内にid="batchStartup"を発見 → BatchExecuteを呼び出す
    ↓ subprocess.Popen（非同期）
[Server/BatchLoad/BatchOrderUploadStart.py]
  BatchStartup(BatchOrderUploadStart_start_tran.jsonのパス, 結果出力先).call(args)
    ↓
[BatchStartupMainController]
  BatchOrderUploadStart_start_tran.json（mode=start）を読み込み、Controller→MainModelを実行
  → BatchOrderUploadStart_start_sql.json の以下を処理する
    - batchParam    : ユーザＩＤ・ユーザ名称（起動元から引き継ぎ）
    - batchKey      : 受注ＣＳＶ全件をSELECT（受注番号, 明細番号の昇順）
    - batchControll : バッチ管理情報（処理名・ロードパス名=Sample/Json/Apps/BatchOrderUploadProc・
                       処理モード=BatchOrderUploadProc_proc・分割数=3・NEXT処理名/ロードパス名=空）
    ↓ BatchClient（msgpack-RPC）
[halumain/batchserver.py]
  batchserver_init() : batchControll/batchParam/batchKeyをバッチ管理テーブル群へ登録
  batchserver_main() : バッチキー（受注番号・明細番号）を分割数3で等分し、1行ずつBatchClientMainServerで処理
    ↓ 分割ごとに BatchOrderUploadProc_proc_tran.json / _sql.json を実行
    [BatchClientModel: BatchOrderUploadProc_model]
      1. TranSelect : 受注ＣＳＶをSELECT（受注番号・明細番号で1行取得。商品コードを含む）
      2. Hselect    : 受注ヘッダに同一受注番号が存在するかSELECT
      3. Hinsert    : 存在しない場合のみ受注ヘッダへINSERT
                      （before: notEmptyPassForSqlsDataOfBatchProc('Hselect','受注番号') でPASS判定）
      4. Mselect    : 受注明細に同一受注番号・明細番号が存在するかSELECT
      5. Pselect    : 商品コードから商品ＩＤ・商品名称をSELECT（削除フラグ='0' のみ。C-045）
      6. Minsert    : 存在しない場合のみ受注明細へINSERT
                      （before: ①既存明細ならPASSで登録スキップ ②商品ＩＤが解決できなければ
                        checkProductResolvedOfBatchProc が ERROR を返し当該分割をエラー終了）
  batchserver_term() : 分割終了数をカウントし、全分割完了で終了日時を更新。
                       NEXT処理名/ロードパス名が空のため後続バッチの連鎖起動はなし
```

各ステップの処理対象の抽出条件と更新先テーブル:

| # | ステップ（ＳＱＬ id） | 抽出条件（どの行を処理するか） | 更新先テーブル |
|---|----------------------|-----------------------------|---------------|
| 1 | OrderUpload execute（画面側） | 受注ＣＳＶは直前のcheckモードで登録済みの全件（0件ならMSG-016でエラー） | なし（バッチ起動のみ。受注ＣＳＶの洗い替えはcheckモードで完了している） |
| 2 | batchKey（Start） | 受注ＣＳＶ全件を `受注番号, 明細番号` 昇順で取得（絞り込みなし） | バッチキー管理（ＪＳＯＮとして保存） |
| 3 | TranSelect（Proc） | `受注ＣＳＶ.受注番号 = ? AND 明細番号 = ?`（分割から渡された1行） | なし（照会） |
| 4 | Hselect（Proc） | `受注ヘッダ.受注番号 = ?` | なし（存在確認） |
| 5 | Hinsert（Proc） | Hselectが0件のときのみ実行（before: `notEmptyPassForSqlsDataOfBatchProc('Hselect','受注番号')`） | **受注ヘッダ**（受注番号・顧客ＩＤ・受注日・受注金額合計をINSERT。値は受注ＣＳＶ） |
| 6 | Mselect（Proc） | `受注明細.受注番号 = ? AND 明細番号 = ?` | なし（存在確認） |
| 7 | Pselect（Proc） | `商品.商品コード = ? AND 削除フラグ = '0'`（受注ＣＳＶの商品コードで完全一致・有効行限定。C-045） | なし（商品ＩＤ・商品名称の解決） |
| 8 | Minsert（Proc） | Mselectが0件、かつPselectで商品が解決できたときのみ実行（before: 2フック） | **受注明細**（受注番号・明細番号・商品ＩＤ・商品名称・納期日・受注数量・受注単価・受注金額・備考をINSERT。商品ＩＤ・商品名称は商品マスタ、他は受注ＣＳＶ） |

コミットは`BatchOrderUploadProc_model`側では発行されない。`BatchClientMainServer`が分割ループの外でまとめてコミットする（Halu開発ガイド『バッチ処理』「重要な設計上の特徴」参照）。

---

## 4. 実行スケジュール

| 項目 | 内容 |
|------|------|
| 実行契機 | 手動・イベント駆動（OrderUpload画面の「実行」操作をトリガーとした非同期起動。cron等の定期スケジュールは設定されていない） |
| 実行時間帯 | 制約なし（オンデマンド） |
| 想定処理時間 | 受注ＣＳＶの件数に依存する。現時点で実測データ・性能要件（NFR）は存在しない |

---

## 5. エラー時の対応

| エラー種別 | 対応 |
|-----------|------|
| `batchStartup`エントリの設定漏れ | AppServerがバッチ起動トリガーを検知できず、画面は「正常終了」を返すがバッチは起動されない（サイレント失敗。`py_batch.md`のC-005参照）。本バッチでは`OrderUpload_execute_sql.json`と`BatchOrderUploadStart_start_sql.json`の両方に`batchStartup`エントリが存在することを確認済み |
| 個別行のSQL実行時エラー（DB制約違反等） | `BatchOrderUploadProc_model`には明示的なtry/exceptによるエラーハンドリングは実装されておらず、フレームワーク標準の挙動（該当sqlsでエラー・ロールバック）に委ねられる。実測（テスト実施U10 E01。受注ＣＳＶに顧客ＩＤ不存在＝受注ヘッダの外部キー違反となる行を分割2に混在させて起動）: ①失敗した分割は、同じ分割に含まれる正常行も含めて分割単位でロールバックされる（分割2の正常行1件も未登録）。②失敗した分割より後の分割は実行されず（分割3は未処理のままバッチ全体が停止）、先行して完了した分割（分割1）はコミット済みで残る。③バッチ管理は分割終了数が失敗直前の値（1）で止まり終了日時は空、バッチ分割管理は失敗した分割とそれ以降の分割の開始日時・終了日時が空のままとなる。④画面（OrderUpload）には失敗が返らない（起動時点で「バッチ処理を起動しました。」を返す非同期起動のため）。検知はバッチ一覧（BatchList）の終了日時が空のままであること、および`batch/batchclientmodel.log`のERROR（例: `sqlalchemy.exc.IntegrityError`／`ForeignKeyViolation`。同一行が5回重複出力される）と`batch/batchserver.log`の`BatchServer abnormal message`による。復旧は失敗した分割から順に再処理する（下記「処理途中の失敗と再処理」行の手順。テスト実施U10 E03で`BatchRerun.py {DBName} {ID} 2 3`→`… 3 3`の順に実行して完了することを確認済み）。詳細ログは`HaluServer/Halu/System/Server/Logs/batch/batchclientmodel.log`・`batchclientserver.log`を確認する（`py_batch.md`「7. ログの確認」参照） |
| 一部分割のみ失敗した場合の再処理 | `BatchDivisionList`画面のF2「再処理」、または`Server/BatchRerun/BatchRerun.py {DBName} {バッチ管理ＩＤ} {分割番号} {分割数}`をCLIから直接実行することで、失敗した分割単位のみ再実行できる（バッチサーバー停止中でも実行可能）。なお`BatchDivisionList`画面のF2「再処理」は現行フレームワークの不具合（Issue #91・バッチ起動引数の組み立て時に数値項目を文字列連結してサーバーエラーになる）により実行できない（2026-09-28 テスト実施U10で確認）。修正されるまではCLIの`BatchRerun.py`で代替する。 |
| 重複登録の防止 | 既に受注ヘッダ・受注明細に同一キーが存在する場合は`notEmptyPassForSqlsDataOfBatchProc`が`PASS`を返し、当該INSERTをスキップする。これにより同じCSVを誤って複数回アップロードしても二重登録は起きない |
| 商品コードから商品を特定できない（C-045） | `checkProductResolvedOfBatchProc('Pselect')`が`sqldict['message']['status']='ERROR'`を設定して`ERROR`を返し、フレームワークが当該分割をロールバックしてエラー終了させる（受注番号・明細番号・商品コードを`batch/batchclientmodel.log`へERROR出力）。通常はOrderUpload画面の取込時チェックで弾かれるため、本エラーに至るのは①取込後に当該商品が論理削除された ②`BatchRerun`での再処理時にマスタ状態が変わっていた 場合。**復旧手順**: 商品マスタを登録・復活させてから`BatchDivisionList`のF2「再処理」または`BatchRerun.py`で当該分割のみ再実行する（既に登録済みの明細は`Mselect`判定でスキップされるため二重登録にならない） |
| 既存明細の商品名称は書き換えない | `Mselect`で既存が見つかった行は`Minsert`自体をスキップするため、商品マスタの改名は過去に取り込んだ受注明細のスナップショットに影響しない（同じCSVを再取込しても名称は当時の値のまま） |
| 処理途中の失敗と再処理 | 分割単位の再実行で復旧する（`BatchDivisionList`のF2「再処理」＝restartモード、または`Server/BatchRerun/BatchRerun.py {DBName} {バッチ管理ＩＤ} {分割番号} {分割数}`。範囲指定は`BatchRerunFromTo.py`。`py_batch.md` 6章）。**再実行しても二重更新にならない根拠**: Hinsert・Minsertは直前のHselect・Mselectで同一キーの存在を確認し、既存なら`notEmptyPassForSqlsDataOfBatchProc`が`PASS`を返してINSERTをスキップするため冪等である。ただし次の取込（OrderUploadのcheck）が受注ＣＳＶを全件洗い替えた後は処理対象データが残らないため、当該バッチの再処理はできない（洗い替え後は当該バッチを再処理できないことを運用上の制約として確定。2026-10-05 A-037） |
| 二重起動 | **制御なし**（同一バッチの実行中に再起動を拒否・待機する仕組みは、アプリ・フレームワークとも実装していない）。OrderUploadのcheckが受注ＣＳＶを全件洗い替えるため、先行バッチの実行中に別ユーザーが取込を実行すると先行バッチの処理対象が消える可能性がある（共通仕様5.1「排他・同時更新の方針」も参照）（二重起動の制御を持たないことを現行仕様として確定。2026-10-05 A-037） |
| バッチサーバー停止時の起動 | 画面の起動処理は子プロセス起動時点で「バッチ処理を起動しました。」を返す（非同期）。バッチサーバーが停止していると子プロセスの通知（msgpack-RPC notify）は接続失敗を検知できず、バッチ管理レコードは作成されず受注ＣＳＶは未処理のまま残る。Halu のログに ERROR は残らない（プロセス標準出力に接続エラー警告のみ）。検知はバッチ一覧に行が増えないこと・受注ＣＳＶの滞留による。フレームワーク側の改善は Issue #92（2026-09-28 テスト実施U10 E05 の実測により確定・A-036） |

---

## 6. 特記事項

- `BatchOrderUploadStart`には対応するHtml画面が存在しない（`Json/Apps/BatchOrderUploadStart`と`Server/BatchLoad/BatchOrderUploadStart.py`のみ）。実際のユーザー操作起点は`OrderUpload`画面（Html/Apps/OrderUpload）の「実行」ボタンであり、`OrderUpload_execute_sql.json`の`batchStartup`エントリがトリガーとなる。
- **実装上の観察**: `BatchOrderUploadStart_start_sql.json`自身にも`id="batchStartup"`のエントリが定義されているが、`Server/BatchLoad/BatchOrderUploadStart.py`経由（`BatchStartup`→`BatchStartupMainController`）で実行される経路では、`batchStartup`検知ロジック（`maincontroller.py`の`next_sw`判定）を持たない`BatchStartupMainController`が使われるため、このエントリは消費されない（HaluServer側コードで確認）。実害はないが、起動画面自身の`batchStartup`定義は現状のフロー上は不要（将来この起動画面を直接HTTP経由で叩く別画面を用意する場合に備えた定義と推測）。**ソースコードは変更していない。事実として報告するのみ。**
- **CSVレイアウトの変更（C-045・2026-08-04依頼者決定）**: 受注ＣＳＶ（およびアップロードCSV）の6列目を`商品名称`から`商品コード`へ**置き換えた**（列数は11列のまま）。受注明細の商品名称は商品マスタから転記するため、CSV側で商品名称を受け取らない。CSVレイアウトの詳細はOrderUpload画面設計書の特記事項を参照。
- **分割エラー時のログの読み方（C-045で実測）**: 分割の途中でSQL実行エラーになると、フレームワーク（`batchclientmodel.py`）が当該分割をロールバック・コネクションクローズしたうえで例外を握り直すため、呼び出し元（`batchclientmainserver.py`）の分割終了日時の更新が`KeyError: 'sample'`（クローズ済みコネクション参照）となって最終的なスタックトレースに現れる。**真の原因は`KeyError`ではなく、その直前に`batch/batchclientmodel.log`へ出力されているERRORログ**。これはC-045で追加した商品未解決チェックに限らず、あらゆるバッチSQLエラーで共通に起きるフレームワーク側の挙動であり、本アプリでは変更していない（`HaluServer/`配下・要否は別途判断）。
- 分割数・ＮＥＸＴ処理名等の起動パラメータは「2.1 起動パラメータ」へ集約した（分割数は3固定・ＮＥＸＴは空＝単発バッチ）。
- freesql／doRunは使用していない。`sql.json`はすべて`genesql`によるSELECT/INSERT、および`type: "nosql"`（batchParam/batchControll/batchStartup）のみで構成されている。

---

## 7. 管理記録・ログ

| 記録先 | 内容 |
|--------|------|
| バッチ管理（1レコード） | 起動時に`batchControll`の内容（会社名・部門名・処理名・ロードパス名・処理モード・分割数3・ＤＢ名・起動ユーザ名称）を登録し開始日時をセットする。全分割完了で分割終了数が3となり終了日時が更新される（`batchserver_init()`／`batchserver_term()`）。成功済みの分割を再処理（BatchDivisionListの再処理／`BatchRerun.py`）すると、再処理が成功するたびに分割終了数が+1され分割数（3）を超える（テスト実施U10 E06の実測。例: 分割数3で分割終了数4）。このため「分割終了数＝分割数」を完了判定に用いず、終了日時の有無で判定する。フレームワークの挙動でありアプリでは変更していない |
| バッチ分割管理（分割数=3レコード） | 分割番号ごとの開始日時・終了日時。失敗した分割は終了日時が空のまま残るため、再処理対象の特定に使う |
| バッチパラメータ管理（1レコード） | `batchParam`（ユーザＩＤ・ユーザ名称）をＪＳＯＮで保持。全分割が同じ値を参照する |
| バッチキー管理（1レコード） | `batchKey`（受注ＣＳＶ全件の受注番号・明細番号）をＪＳＯＮで保持。`BatchClientMainServer`が1行ずつ取り出して分割へ割り当てる |
| ログ（`Logs/batch/`） | `batchclientmodel.log`（モデル・フックのDEBUG／ERROR。商品を解決できない行は受注番号・明細番号・商品コードをERROR出力＝C-045）・`batchclientserver.log`（分割実行の制御）。分割途中のＳＱＬエラー時は最終スタックトレースの`KeyError`ではなく直前のERRORログが真の原因（6章参照） |
| 進捗確認画面 | BatchList（バッチ管理の一覧。開始／終了日時・分割数・分割終了数の確認と処理削除）／BatchDivisionList（分割単位の開始／終了日時の確認と再処理） |
| 記録しないもの | 取込件数・エラー件数のアプリ独自の記録は持たない。受注ヘッダ・受注明細は監査カラムを持たないため、取込者・取込日時も残らない（監査カラム欠落は変更管理台帳C-046で別途起票） |

---

## 承認欄

| 役割 | 氏名 | 承認日 | 備考 |
|------|------|--------|------|
| 依頼者（ユーザー側） | | | 承認記録簿 A-xxx |
| 開発責任者 | | | |

---

## 改訂履歴

| 版数 | 日付 | 変更内容 | 作成/改訂者 | 備考 |
|------|------|----------|------------|------|
| 1.0 | 2026-10-05 | 初版（公開初版。開発中の改訂経緯は開発リポジトリで管理） | AI（依頼者確認） |  |
