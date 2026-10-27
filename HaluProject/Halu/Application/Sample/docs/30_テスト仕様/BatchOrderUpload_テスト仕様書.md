# テスト仕様書: 受注ヘッダ・受注明細データ更新バッチ（BatchOrderUploadStart / BatchOrderUploadProc）

| 項目 | 内容 |
|------|------|
| 対象バッチ | 受注ヘッダ・受注明細データ更新バッチ（起動: BatchOrderUploadStart／処理: BatchOrderUploadProc） |
| 対象アプリ | Sample |
| 参照設計書 | `docs/20_基本設計/BatchOrderUpload.md` v1.0、Halu開発ガイド『バッチ処理』 |
| 生成元定義 | `BatchOrderUploadStart_start_tran.json` / `BatchOrderUploadStart_start_sql.json` / `BatchOrderUploadStart_validation.json` / `BatchOrderUploadProc_proc_tran.json` / `BatchOrderUploadProc_proc_sql.json` / `Server/BatchLoad/BatchOrderUploadStart.py`／起動元 `OrderUpload_execute_sql.json`（生成日時点のコミット: feb3f4b） |
| 関連C番号 | C-005（BatchOrderUploadStartの`batchStartup`エントリ欠落によるサイレント失敗。2026-07-24完了済み。本書P01で回帰確認）。BatchDivisionList F2再処理の不具合はC-029として採番・是正済み（2026-08-02完了。`batchStartup`経由で`Server/BatchRerun/BatchRerun.py`を起動する方式に結線） |
| 作成日 | 2026-10-05 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | 1.0 |

> **本書は人間レビュー承認済み（2026-07-31・承認記録簿A-012）。実施記録の記入はUAT工程（ブラウザ実走検証連動）で行う。**

## 1. テストID体系と網羅基準

テスト仕様書標準（バッチ用）（P=起動・パラメータ／N=正常処理／E=異常・リカバリ／L=管理記録・ログ）に従う。テストケースIDは `TC-BatchOrderUpload-{分類}{連番2桁}`。

**前提サーバー**: バッチサーバー（ポート18820。Docker環境では`app`サービスに同梱）の起動が必須。

**テストデータ**: `テストデータ/order_upload_ok.csv`（正常取込）・`テストデータ/order_upload_error.csv`（取込前チェックで全件中止＝バッチは起動しない）。詳細は `テストデータ/README.md` を参照。

**CSVレイアウト（C-045・2026-08-04）**: 受注ＣＳＶおよびアップロードCSVの6列目は`商品名称`から`商品コード`へ**置き換わっている**（11列。受注番号,明細番号,顧客ＩＤ,受注日,受注金額合計,**商品コード**,納期日,受注数量,受注単価,受注金額,備考）。テストデータのCSVは商品マスタに登録済みの商品コード（例: ST001・FD001）を使うこと。

**C-045のケース追加（2026-08-05）**: 商品コードの名寄せに関する2ケース（N06・E06）を正式に追加した。いずれも2026-08-04に実装・実測済み（実測結果は変更管理台帳C-045の個票を参照）。**追加ケースは2026-08-05に人間レビュー承認済み（承認記録簿A-022）**。

**データ安全規則**: 本バッチは受注ＣＳＶ→受注ヘッダ・受注明細への更新系処理のため、専用テストデータ（テスト専用の受注番号帯、例: `TEST-` プレフィックス等）で自己完結させる。実施前に対象テーブル（受注ＣＳＶ・受注ヘッダ・受注明細・バッチ管理系4テーブル）の件数・キー一覧のスナップショットを取得し、実施後の差分照合をエビデンスとする。既存の受注データ（Sample初期データ）を対象にしない。

**呼び出し元画面の一般的な画面テスト対象外**: OrderUpload画面自体のボタン押下・ファイルアップロードUI（ドラッグ&ドロップ・拡張子チェック等）は`OrderUpload_テスト仕様書.md`で扱う。BatchList/BatchDivisionList画面自体のボタン押下・ページング等は各画面のテスト仕様書（`BatchList_テスト仕様書.md`・`BatchDivisionList_テスト仕様書.md`）で扱う。本書はバッチ本体（起動パラメータ〜DB反映〜管理記録）に限定する。

**BatchOrderUploadStartにHTML画面が存在しない点について**: 起動画面はHTML無しのJSON定義のみ（設計書0章・6章）。本書のP分類ケースはOrderUpload画面の「実行」操作またはstartモード直リクエストのいずれかを起点として記載する。

## 2. テストケース

### 2.1 P: 起動・パラメータ（生成元: BatchOrderUploadStart_start_sql.json＋OrderUpload_execute_sql.json＋設計書3章）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-BatchOrderUpload-P01 | batchStartupエントリによる起動トリガー（回帰確認） | OrderUpload画面でCSVアップロード済み | 「実行」ボタン押下 | AppServerが`OrderUpload_execute_sql.json`の`id=batchStartup`を検知し、`Server/BatchLoad/BatchOrderUploadStart.py`が`subprocess.Popen`で起動される（画面は「正常終了」を返すのみでバッチ完了を待たない） | py_batch.md 1章・3-1／OrderUpload_execute_sql.json id=batchStartup／C-005（2026-07-24修正済み。同種のサイレント失敗が再発していないことの確認） | 自動 | OK（09:42:43 #executeDialogYES→checkモード応答エラー件数0→自動でexecuteモード送信→応答 status OK・msg「バッチ処理を起動しました。」を#serverDialogで確認。batchstartup.logにBatchOrderUploadStart.py起動記録＝C-005回帰確認OK。バッチ管理ID21） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-P02 | batchParam（ユーザＩＤ・ユーザ名称）の引き継ぎ（正常） | ログイン済みユーザーでOrderUpload実行 | 実行後、バッチパラメータ管理テーブルの内容を確認 | ログインセッション情報（`login`レコード）のユーザＩＤ・ユーザ名称がそのままバッチパラメータとして登録される | OrderUpload_execute_sql.json id=batchParam（fromid=login）／py_batch.md 5章 | 自動 | OK（バッチパラメータ管理ID21のＪＳＯＮデータ: ユーザＩＤ=["1"]・ユーザ名称=["admin"]。fromid batchParamのとおりログインセッションから引き継がれる） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-P03 | batchKey（受注ＣＳＶ全件・受注番号,明細番号昇順）の取得（正常） | 受注ＣＳＶに複数受注・複数明細のテストデータが投入済み | バッチ起動後、バッチキー管理テーブルの内容を確認 | 受注ＣＳＶの全行が`受注番号, 明細番号`の昇順でキーとして登録される（欠落・重複なし） | BatchOrderUploadStart_start_sql.json id=batchKey（order: 受注番号, 明細番号）／設計書2章 | 自動 | OK（バッチキー管理ID21のＪＳＯＮデータ: 受注番号=[TS26092801,TS26092801,TS26092801,TS26092802,TS26092803,TS26092803]・明細番号=[1,2,3,1,1,2]。受注番号・明細番号昇順の6キーで欠落・重複なし） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-P04 | batchControll 分割数固定値（境界・仕様上の制約） | - | バッチ管理テーブルの分割数を確認 | 分割数は常に`"3"`（リテラル固定）で登録される。**【注記（2026-07-31承認済み）】** 設計書には分割数を1に設定した場合の動作記載がなく、`BatchOrderUploadStart_start_sql.json`の`分割数`はハードコードのため、本バッチでは「1分割」構成のテストは実施不可（仕様上の制約として記録するのみとし、NG扱いにはしない） | BatchOrderUploadStart_start_sql.json id=batchControll（分割数="3"）／設計書6章「分割数は3固定」 | AI補完済 | OK（バッチ管理ID21: 処理名「受注ヘッダ・受注明細 更新 バッチ処理」・ロードパス名 Sample/Json/Apps/BatchOrderUploadProc・処理モード BatchOrderUploadProc_proc・分割数3・分割終了数3・ＮＥＸＴ処理名 空・ＤＢ名 sample。分割数=3固定を実測で確認） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-P05 | batchKey 対象0件時の起動（境界） | 受注ＣＳＶを空にした状態（アップロードファイルが0件データ、または事前に全件削除済み） | OrderUpload実行、またはstartモード直リクエスト | execute 応答が status ERROR・MSG-016「取込対象のデータがありません。ＣＳＶファイルをアップロードしてから実行してください。」（サーバエラーダイアログ）となり、`batchStartup` に到達しないためバッチ管理レコードは作成されず `BatchOrderUploadStart` も起動されない（C-041・2026-08-04 `OrderUpload_execute_sql.json` count受注ＣＳＶ の after フック `checkCsvNotEmpty`。0件のステージングでバッチが起動して NOT NULL 制約違反で落ちることを防ぐ）。アップロードファイルは削除されず残る。2026-09-28 実測により確定（承認記録簿 A-035） | OrderUpload_execute_sql.json id=count受注ＣＳＶ after=checkCsvNotEmpty（C-041）／設計書5章#1「受注ＣＳＶは直前のcheckモードで登録済みの全件（0件ならMSG-016でエラー）」／common.md MSG-016 | AI補完済 | NG（是正前期待）→期待結果を是正（A-035）。再実施は下表 | 2026-09-28 | AI（ブラウザ実走） |

**再実施**（NG 1件の是正・期待結果是正後の再実施行）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-BatchOrderUpload-P05（再） | batchKey 対象0件時の起動（境界・A-035 期待結果是正後の再実施） | ヘッダ行のみ（データ0件）の受注ＣＳＶ（`order_upload_u9_p05_empty.csv`） | OrderUpload実行 | execute 応答が status ERROR・MSG-016「取込対象のデータがありません。ＣＳＶファイルをアップロードしてから実行してください。」（サーバエラーダイアログ）となり、`batchStartup` に到達しないためバッチ管理レコードは作成されず `BatchOrderUploadStart` も起動されない | OrderUpload_execute_sql.json id=count受注ＣＳＶ after=checkCsvNotEmpty（C-041） | 自動 | OK（#実行→「は い」→ check 応答 エラー件数 0 → 自動 execute → 応答 status ERROR・MSG-016 が `#alertDialog`（サーバエラー）に表示。バッチ管理は ID 5,17,18,19,20,21 のまま増えず（バッチ未起動）、受注ＣＳＶ 0件。model.log に「checkCsvNotEmpty 受注ＣＳＶが0件のためバッチを起動しません」。アップロードファイルは削除されず残存（手動削除）。是正後期待どおり。エビデンス`TC-BatchOrderUpload-P05_retest.md`参照） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-E05（再） | バッチサーバー未起動時の起動操作（境界・A-036 期待結果是正後の再実施） | バッチサーバーを停止した状態でOrderUpload実行 | 「実行」ボタン押下 | 応答は status OK・「バッチ処理を起動しました。」となり成功表示されるが、バッチ管理レコードは作成されず受注ＣＳＶは未処理のまま残る。Halu のサーバーログに ERROR は記録されず、コンテナ（プロセス）の標準出力に tornado の `Connect error … ECONNREFUSED` が出るのみ | batchstartup/batchexecute.py・`BatchClient`（halurpc）・設計書5章「バッチサーバー停止時」 | 自動 | OK（方式A の一時コンテナ（バッチサーバー抜き）で再ログイン→#実行→「は い」→ execute 応答 status OK・「バッチ処理を起動しました。」を確認。約50秒後、バッチ管理 9件・最大ID25 のまま未作成、受注ＣＳＶに TS26092831/1 が残存、受注ヘッダ未登録、Halu の全ログに ERROR 増分なし、コンテナ標準出力に ECONNREFUSED ×5 のみ。是正後の期待結果どおり。エビデンス`TC-BatchOrderUpload-E05_retest.md`参照） | 2026-09-28 | AI（ブラウザ実走） |

### 2.2 N: 正常処理（生成元: BatchOrderUploadProc_proc_sql.json＋設計書3章）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-BatchOrderUpload-N01 | 新規受注の一括登録（正常・DB前後差分） | テスト専用の未登録受注番号（複数件、各1明細以上）を含む受注ＣＳＶを投入 | 実施前スナップショット取得 → OrderUpload実行 → バッチ完了後にスナップショット再取得 | 受注ＣＳＶの全行に対応する受注ヘッダ（受注番号・顧客ＩＤ・受注日・受注金額合計）・受注明細（**商品ＩＤ・商品名称は商品コードで特定した商品マスタから転記**、納期日・受注数量・受注単価・受注金額・備考は受注ＣＳＶの値）が過不足なくINSERTされる（件数・値ともDB実データと一致） | BatchOrderUploadProc_proc_sql.json id=Hinsert/Minsert／設計書2章・3章 | 自動 | OK（Run1完了後、受注ヘッダ3件（TS26092801 顧客1 2026-09-28 10240／TS26092802 顧客2 800／TS26092803 顧客3 5600）・明細6件が投入値どおりに登録。前後差分は+3ヘッダ／+6明細） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-N02 | 既存受注番号のヘッダスキップ（重複防止） | 受注ヘッダに既に存在する受注番号と同じ受注番号を含む受注ＣＳＶを投入 | OrderUpload実行 | 当該受注番号の受注ヘッダは追加INSERTされない（`notEmptyPassForSqlsDataOfBatchProc('Hselect', '受注番号')`がALLPASSを返しHinsertをスキップ）。他の未登録受注番号は通常通り登録される | BatchOrderUploadProc_proc_sql.json id=Hinsert before／設計書5章「重複登録の防止」 | 自動 | OK（Run2投入。既存TS26092801のヘッダは1件のまま重複登録なし。完全新規のTS26092804はヘッダ（顧客4・2,000）・明細とも通常どおり新規登録） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-N03 | ヘッダ既存・明細未登録の混在（独立判定の確認） | 受注ヘッダは既に存在するが、その受注番号に対して受注ＣＳＶ側には未登録の明細番号を含むテストデータ | OrderUpload実行 | ヘッダはスキップされるが、当該受注番号の新規明細番号は`Mselect`（受注番号＋明細番号の一致）で未検出のためMinsertが実行され、明細のみ追加される（ヘッダ・明細の重複判定は独立している） | BatchOrderUploadProc_proc_sql.json id=Hselect（受注番号のみで判定）／id=Mselect（受注番号＋明細番号で判定） | AI補完済 | OK（TS26092801はヘッダをスキップしつつ、未登録の明細番号4（商品ＩＤ11 ドリップコーヒー(100袋入)・1×1,200）はMinsertで新規追加。ヘッダ・明細の重複判定が独立していることを確認。バッチキー管理ID22=[TS26092801/4, TS26092804/1]） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-N04 | 1受注複数明細行の全行登録（正常） | 1受注番号に対して明細番号違いの行を3行以上含む受注ＣＳＶ | OrderUpload実行 | 当該受注番号の受注明細が明細番号ごとに全行INSERTされる（1受注1ヘッダー・N明細の対応が崩れない） | BatchOrderUploadProc_proc_sql.json id=TranSelect/Minsert（受注番号・明細番号単位でキー処理） | 自動 | OK（TS26092801の明細番号1・2・3（Run1投入分）がすべて登録され欠落なし。1受注が分割1件目・2件目にまたがる境界でも1受注3明細の対応が崩れない） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-N05 | 分割処理（分割数3）による全件処理の整合性 | 受注ＣＳＶが3分割される件数（最低4件以上、各分割に複数キーが配分される件数）を投入 | OrderUpload実行 → 全分割完了を待つ | バッチキーが3分割に等分され、各分割が独立して`BatchOrderUploadProc_proc`を実行する。3分割の処理結果を合算するとN01と同じ全件一致の結果になる（分割境界での欠落・重複がない） | py_batch.md 5章「バッチキー管理」（分割数に応じた等分）／設計書3章「分割数=3」 | 自動 | OK（分割数3・6キーがバッチ分割管理ID21の分割1〜3（開始09:42:46／09:42:49／09:42:53）に等分され、3分割の処理結果を合算するとN01と同じ全6明細一致。境界での欠落・重複なし） | 2026-09-28 | AI（ブラウザ実走） |

### 2.3 E: 異常・リカバリ（生成元: 設計書5章＋py_batch.md）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-BatchOrderUpload-N06 | 商品コードから商品ＩＤ・商品名称を解決して登録すること（C-045） | 商品マスタに登録済みの商品コード（例: ST001・ST004・FD001）を含む受注ＣＳＶを投入（テストデータ: `テストデータ/order_upload_ok.csv`） | 実施前スナップショット取得 → OrderUpload実行 → バッチ完了後に受注明細を確認 | 受注明細の**商品ＩＤ**が商品コードに対応する値で登録される（実測例: ST001→1・ST004→4・FD001→9）。**商品名称はCSVに存在せず商品マスタから転記された値**が入る。受注単価・受注数量・受注金額・納期日・備考は受注ＣＳＶの値がそのまま入る | BatchOrderUploadProc_proc_sql.json id=Pselect（商品コード完全一致・削除フラグ='0'）／id=Minsert（商品ＩＤ・商品名称はPselectのoutput由来）／設計書1章REQ-013・3章 | 自動 | OK（商品コード→商品ＩＤ・商品名称の名寄せ: ST001→1 油性ボールペン 黒(10本入)／ST004→4 コピー用紙Ａ４(500枚×5冊)／FD001→9 ミネラルウォーター500ml(24本入)／ST002→2 油性ボールペン 赤(10本入)／FD002→10 緑茶500ml(24本入)／ST005→5 コピー用紙Ａ３(500枚×5冊)。Run2でFD003→11・ST006→6も同様に確認） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-E01 | エラーデータ混在時の挙動（スキップ/全体停止の確認） | 正常行と、DB制約違反となる行（例: 顧客ＩＤに存在しない値、必須カラムに極端な桁数）が混在する受注ＣＳＶ | OrderUpload実行 | **【要実機確認（2026-07-31承認済み）】** `BatchOrderUploadProc_model`には明示的なtry/exceptが実装されておらず、フレームワーク標準の挙動（該当sqlsでエラー・ロールバック）に委ねられる。エラー行を含む分割が「その分割のみ失敗（他分割は正常続行）」なのか「バッチ全体が停止」なのかは設計書に明記がなく実機確認が必要。1回目は「1回目の結果」として記録し、正常行が誤って巻き込まれてロールバックされていないかをDB差分で確認する | 設計書5章「個別行のSQL実行時エラー」／py_batch.md 7章 | AI補完済 | OK（要実機確認の解消: 画面経路ではC-041のcheckによりDB制約違反行はバッチへ到達しない（OrderUpload S06で確認済み）ため、受注ＣＳＶへ制約違反行（顧客ＩＤ999＝FK違反）をSQLで直接投入しexecute直リクエストで実施。結果は「バッチ全体停止」: エラー行を含む分割2は同分割の正常行TS26092822も巻き込まれてロールバック＝未登録、後続分割3は未実行、先行分割1（TS26092821/1・2）はコミット済みで残存。バッチ管理ID25は分割数3・分割終了数1・終了日時空、分割2・3の開始/終了日時とも空。ログはbatchclientmodel.logに`sqlalchemy.exc.IntegrityError`／`ForeignKeyViolation on table "受注ヘッダ"`／`BatchClientModel call exception message : SQL実行 エラー`、batchserver.logに`BatchServer abnormal message : 'sample'`。設計書BatchOrderUpload.md 5章への挙動（分割単位ロールバック・後続分割未実行・失敗分割の開始日時空）の追記を申し送り） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-E02 | 一部分割のみ失敗時の再処理（BatchDivisionList F2） | E01等で一部分割のみ失敗した状態（バッチ分割管理に未完了の分割が存在） | BatchList→BatchDivisionListへ遷移し、失敗分割に対してF2「再処理」を実行 | 失敗した分割のみが再実行され、既に成功済みの分割・行は二重更新されない。**【備考】BatchDivisionListの再処理（F2）はC-029（2026-08-02完了）により是正済みで、`batchStartup`経由で`Server/BatchRerun/BatchRerun.py`を起動し「再処理を起動しました。」のメッセージが表示される。1回目（失敗発生時）と再処理後の結果を分けて記録すること** | py_batch.md 4章「BatchDivisionList」／設計書5章「一部分割のみ失敗した場合の再処理」（C-029是正済み） | AI補完済 | NG（フレームワークバグ・Issue #91: 再処理リクエストがHTTP 500（batchexecute.pyがbatchParamの数値を文字列連結してTypeError）→通信エラーダイアログ。再処理は起動されず。修正後に再実施） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-E03 | BatchRerun.py（CLI）による代替再処理 | E02と同様に失敗分割が存在する状態 | `python Server/BatchRerun/BatchRerun.py sample {バッチ管理ＩＤ} {分割番号} 3` をCLIから直接実行（バッチサーバー停止中でも可） | 失敗した分割単位のみが再実行され、正しくDBへ反映される（BatchDivisionList F2（C-029是正済み）とは別経路の代替手段として有効なことを確認） | 設計書5章「Server/BatchRerun/BatchRerun.py {DBName} {バッチ管理ＩＤ} {分割番号} {分割数}」／py_batch.md 6章 | 自動 | OK（CLIで失敗分割2のみ再実行→続けて未実行の分割3を実行し完了。二重登録なし。`BatchRerun.py sample 25 2 3`でヘッダ22・23／明細22/1・23/1を追加、分割終了数1→2。続けて`BatchRerun.py sample 25 3 3`で分割3（ヘッダ24・25／明細24/1・25/1）を追加し分割終了数3・終了日時ありで完了。全6キー各1件） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-E04 | 同一バッチの二重起動（重複防止の確認） | 同一内容の受注ＣＳＶで「実行」を連続2回行う（1回目の完了を待って2回目を実行） | OrderUpload実行 → 完了確認 → 同一CSVを再アップロードして再度実行 | 2回目の実行でも受注ヘッダ・受注明細に重複INSERTは発生しない（`notEmptyPassForSqlsDataOfBatchProc`によりHinsert/Minsertとも全行スキップされる） | 設計書5章「重複登録の防止」／BatchOrderUploadProc_proc_sql.json before句 | 自動 | OK（同一CSV`order_upload_u10_e04.csv`を2回実行（Run1=バッチ管理ID23、Run2=ID24）。2回目もヘッダ3／明細6のまま重複0。`notEmptyPassForSqlsDataOfBatchProc`のPASSフックでHinsert/Minsertとも全行スキップ（Run2のPASS回数48）。ERROR増分0） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-E05 | バッチサーバー未起動時の起動操作 | バッチサーバーを停止した状態でOrderUpload実行 | 「実行」ボタン押下 | 画面の起動処理（`BatchExecute` の `subprocess.Popen`）は子プロセス起動時点で成功を返すため、応答は status OK・「バッチ処理を起動しました。」となり成功表示される。子プロセス側の `BatchClient` は msgpack-RPC の notify で送信し接続失敗（再接続5回）を検知しないため、バッチ管理レコードは作成されず受注ＣＳＶは未処理のまま残る。Halu のサーバーログに ERROR は記録されず、コンテナ（プロセス）の標準出力に tornado の `Connect error … ECONNREFUSED` が出るのみ。運用上はバッチ一覧に行が増えないこと・受注ＣＳＶの滞留で検知する（現行仕様。改善はフレームワーク Issue #92。2026-09-28 実測により確定・承認記録簿 A-036） | batchstartup/batchexecute.py・`BatchClient`（halurpc）・設計書5章「バッチサーバー停止時」 | AI補完済 | NG（是正前期待）→期待結果を是正（A-036）。再実施は下表 | 2026-09-28 | AI（ブラウザ実走） |

| TC-BatchOrderUpload-E06 | 商品ＩＤを解決できない行のエラー終了と再処理による復旧（C-045） | N06を実行して取込を完了させたあと、①当該受注明細を削除し ②対象商品を論理削除（削除フラグ='9'）した状態 | ①`python Server/BatchRerun/BatchRerun.py sample {バッチ管理ＩＤ} {分割番号} 3` で当該分割を再処理 ②`batch/batchclientmodel.log`を確認 ③商品の削除フラグを'0'へ戻して再度①を実行 | ①受注明細は登録されず当該分割がエラー終了する ②ログに`checkProductResolvedOfBatchProc 商品未解決 : 受注番号 = …, 明細番号 = …, 商品コード = …`が**ERRORレベルで出力される**（NOT NULL制約違反ではなく明示的なエラー） ③マスタを戻して再処理すると受注明細が正しく登録される（**マスタを直せば復旧できる**）。**なお最終的なスタックトレースは`KeyError: 'sample'`（クローズ済みコネクション参照）になるが、真の原因は直前のERRORログである**（設計書6章。全バッチ共通のフレームワーク挙動） | BatchOrderUploadProc_proc_sql.json id=Minsert の before（`checkProductResolvedOfBatchProc('Pselect')`）／`BatchOrderUploadProc_model.py`／設計書1章REQ-014・5章「商品コードから商品を特定できない」・6章 | 自動 | OK（商品未解決のERRORログでエラー終了・NOT NULL違反なし・マスタ復元後の再処理で登録。①明細TS26092812/1を削除しST007を論理削除→CLI再処理でKeyError: 'sample'（EXIT=1）・batchclientmodel.logに`checkProductResolvedOfBatchProc 商品未解決 : 受注番号 = TS26092812, 明細番号 = 1, 商品コード = ST007`をERRORで確認・NOT NULL違反のログなし・受注明細0件のまま。②商品の削除フラグを'0'へ戻し全列が元の値と一致することを確認。③再処理（EXIT=0）でTS26092812/1が商品ＩＤ7「付箋 75×25mm (20冊入)」1×1,000で復活、他5明細は重複なし。観測事項: 再処理成功のたびに分割終了数が加算される実装のため3→4になった（既存ID5の6と同じ機構。仕様外の副作用として記録のみ・NGにはしない）） | 2026-09-28 | AI（ブラウザ実走） |

### 2.4 L: 管理記録・ログ（生成元: batchtables＋py_batch.md 5章・7章）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-BatchOrderUpload-L01 | バッチ管理テーブルへの開始/終了日時記録 | N01実行 | バッチ管理テーブル（BatchControll）を確認 | 処理名「受注ヘッダ・受注明細 更新 バッチ処理」・ロードパス名・分割数=3で登録され、開始日時は起動時、終了日時は全分割完了時（分割終了数=3）に更新される | py_batch.md 5章「バッチ管理」／BatchOrderUploadStart_start_sql.json id=batchControll | 自動 | OK（バッチ管理ID21 開始日時09:42:46.515・終了日時09:42:53.087。ID22は09:44:15〜09:44:22） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-L02 | バッチ分割管理テーブルへの分割ごとの記録 | N05実行（3分割） | バッチ分割管理テーブル（BatchDivisionControll）を確認 | バッチ管理ＩＤ×分割番号（1〜3）の組み合わせで、各分割の開始・終了日時が記録される | py_batch.md 5章「バッチ分割管理」 | 自動 | OK（バッチ分割管理ID21の3行すべてに開始・終了日時が記録。各分割の所要は1〜3秒） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-L03 | BatchListでの進捗確認 | N01実行中または実行後 | BatchList画面を表示し、対象の処理名で一覧を確認 | 処理名・分割数・分割終了数・開始/終了日時が一覧に表示され、処理の進行に応じて分割終了数が更新される（要再表示F1） | py_batch.md 4章「BatchList」 | 自動 | OK（execute成功確認直後にBatchListへ遷移し#再表示を2〜3秒間隔で繰り返し、分割終了数が0（09:42:46）→1（09:42:49）→2（09:42:55）→3・終了日時09:42:53（09:43:22の再表示で確認）と推移する様子をリアルタイムで捕捉） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-L04 | BatchDivisionListでの分割進捗確認 | L03の対象バッチ管理ＩＤを選択 | BatchList→F2でBatchDivisionListへ遷移し一覧を確認 | 選択したバッチ管理ＩＤに紐づく3分割それぞれの開始・終了日時が表示される | py_batch.md 4章「BatchDivisionList」 | 自動 | OK（BatchListでID21を選択→#分割画面→バッチ分割一覧に分割No1〜3の開始／終了日時が表示） | 2026-09-28 | AI（ブラウザ実走） |
| TC-BatchOrderUpload-L05 | Logs/batch配下のログ出力 | N01実行（正常系）・E01実行（異常系） | `HaluServer/Halu/System/Server/Logs/batch/`配下の各ログ（batchserver.log／batchservermodel.log／batchclientserver.log／batchclientmodel.log）を確認 | 正常系では`<ERROR>`が出力されない。異常系（E01）ではエラー発生箇所に応じたログファイルに`<ERROR>`が記録される | py_batch.md 7章「ログの確認」「バッチエラーの調査手順」 | 自動 | OK（Logs/batch/のbatchstartup.log（init／start／filepath／args／requestdict）・batchserver.log（call start 09:42:43→end 09:42:56）・batchclientserver.log等に処理ログが記録され、ERROR 0件） | 2026-09-28 | AI（ブラウザ実走） |

**要件カバレッジ表**

| REQ-ID | 要件（要約） | 検証ケース |
|--------|-------------|-----------|
| REQ-011 | 受注データはCSVファイルによる一括アップロードでも登録できる | TC-BatchOrderUpload-N01〜N05 |
| REQ-012 | CSVアップロードの取込みはバッチ処理として実行し、実行状況を一覧・分割区分単位で確認・再処理できる | TC-BatchOrderUpload-P01〜P05, E02, E03, L01〜L05 |
| REQ-013 | 受注ＣＳＶの商品コードから商品マスタの商品ＩＤ・商品名称を解決して受注明細へ登録する（有効な商品のみ） | TC-BatchOrderUpload-N01, N06 |
| REQ-014 | 商品ＩＤを解決できない行はDB制約違反に頼らず明示的なエラーとし、当該分割をエラー終了させる | TC-BatchOrderUpload-E06 |

未対応REQ: なし（設計書1章の全REQ-IDを上表でカバー）。

**別冊（シナリオテスト仕様書）への申し送り**

- OrderUpload画面でのアップロード操作からBatchList/BatchDivisionListでの進捗確認・再処理までを一連の業務フローとして通しで確認するシナリオ（正常系1本＋エラー混在からの再処理1本）は、複数画面に跨るため別冊（アプリ単位のシナリオテスト仕様書）で扱うことを推奨する。本書はバッチ単体のテストに閉じているため、上記シナリオ自体は本書ではカバーしていない。

## 3. 前提ゲート記録

| 層 | 検証内容 | 結果 | 実行日時 |
|----|---------|------|---------|
| 第1層（代替） | 定義ファイルの整合を機械検証（バッチ自体はlint対象外のため、起動画面・処理画面に相当するOrderUpload・BatchList・BatchDivisionListのlint結果を参照する） | BatchOrderUpload は画面定義を持たないため対象外。呼び出し元 OrderUpload の記録を参照。関連画面の実測: BatchList ERROR 0件／WARNING 2件、BatchDivisionList ERROR 0件／WARNING 2件（いずれもオフセットライン数・最大ページのフック注入） | 2026-09-28 09:28 |
| 第2層（スモーク） | init／select の API 疎通確認（非破壊の直リクエスト） | バッチは全ケースが更新系であり対象外（template_test_spec_batch.md 3章）。関連画面の実測: BatchDivisionList init／select OK（NG 0件）。BatchList は init/select 用の tran が対象外形式のため第3層のブラウザ実走で代替（画面表示時の select 応答 OK を確認） | 2026-09-28 09:28 |
| サーバー | バッチサーバー（ポート18820）の起動確認 | 起動確認済み（app コンテナ同梱・18820 LISTEN） | 2026-09-28 09:27 |
| データ | テストデータ投入と事前スナップショット取得（（実施時に使用したSQL・件数をここへ記載）） | 実施済み（1.1節のSQLでベースライン: 受注ヘッダ13・明細26・受注ＣＳＶ0・受注ＣＳＶエラー3(残置)・バッチ管理5(ID5,17,18,19,20)・分割15・キー5・パラメータ5を確認。Run1〜Run3投入後、TS260928%の明細・ヘッダを削除、受注ＣＳＶ／エラーを全削除しベースラインとdiff一致を確認。バッチ管理はID21を履歴として残置（ID22はBatchList S02で削除済み）→5,17,18,19,20,21） | 2026-09-28 09:40〜09:48 |
| 環境 | 実施環境: （Docker／ホスト起動、ブラウザ、使用データセット。未記入＝実施記録の記入時に転記） | Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001。データ: ベースライン 受注ヘッダ13／明細26 に検証用受注 TS260928xx を取込で作成し実施後に削除・バッチ管理は ID21 を履歴として残置。U10（異常系）: 同じくDocker（app／db）・Chromium・ADMIN001。E05のみバッチサーバー抜きの一時コンテナ（方式A）で実施し、実施後に通常コンテナへ復旧。検証用受注 TS2609281x（E04/E06）・TS2609282x（E01〜E03）・TS26092831（E05）を作成し実施後に削除、バッチ管理ID23・24・25は失敗→再処理の証跡として残置 | 2026-09-28 |

## 4. 実施サマリと品質判定

| 項目 | 値 |
|------|----|
| ケース総数 / 実施済 / OK / NG / 未実施 | 24 / 24 / 21 / 3 / 0（NG 3 は初回 P05・E02・E05。P05・E05 は是正済み再実施 OK、E02 は Issue #91 修正待ち） |
| NG→修正→再テストの履歴 | P05→期待結果是正（A-035・C-041の仕様へ同期）→再実施 OK（2026-09-28）／E02→フレームワークバグと判定（Issue #91起票・2026-09-28）→修正後に再実施予定／E05→期待結果是正（A-036）→再実施 OK（2026-09-28） |
| 品質判定 | 未達（NG 残 1件: E02＝Issue #91 修正後に再実施）（合格基準: 全ケース実施済・NG残ゼロ・全REQカバー。AI補完6件は人間レビュー承認が前提条件に追加される。テストデータの後始末（削除/ロールバック）完了も合格条件に含める） |

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
