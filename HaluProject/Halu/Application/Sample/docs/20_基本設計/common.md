# 基本設計 共通仕様: 受注管理システム（サンプル）

| 項目 | 内容 |
|------|------|
| プロジェクト名 | Sampleアプリ 受注管理システム（サンプル） |
| 作成日 | 2026-10-05 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | 1.0 |

---

## 1. 画面遷移図

```
  ┌─────────┐
  │  Login  │←──────────（ログアウト）
  └────┬────┘
       │ 認証成功（ユーザ.メニュー名で分岐）
       ├──────────────┐
       ▼              ▼
┌───────────┐   ┌───────────┐
│ StartMenu │   │ AdminMenu │
└─────┬─────┘   └─────┬─────┘
      └───────┬───────┘ メニュー選択で各画面へ（下表参照）
              ▼
      ┌─── 各業務画面 ───┐（ESCで元のメニューへ戻る）
```

（画面一覧（画面ID・画面名・種別・設計書）は本書に別表を持たず、仕様書リバース出力ツールが生成する機能一覧（`docs/60_リバース仕様書/Sample_機能一覧.md`）を正とする（二重管理しない）。各画面の入口・出口は画面設計書6章「画面遷移」に書く。本章の1.1・1.2はメニュー・ダイアログからの遷移の全体像を示すもので、画面一覧の代替ではない）

### 1.1 メニューからの遷移一覧

タブ構成は**両メニューとも業務分類の3タブ（受注管理／マスタ／システム）**で統一されている（2026-08-02にパターン分類「基本の画面パターン／応用／システム」から再編。StartMenu=C-042、AdminMenu=C-043）。掲載範囲の違いは「マスタ」「システム」タブに集約され、**ユーザ一覧とシステム用テーマ設定のみ管理者専用**である。

| 遷移先 | StartMenu | AdminMenu | 掲載タブ | 備考 |
|--------|:---------:|:---------:|---------|------|
| UserList | − | ○ | マスタ | **管理者専用**。C-042でStartMenuから除外（ユーザ管理は管理者の業務） |
| UserDetailMainte | − | − | − | UserListからF1/F3/F4/F5で遷移。両メニューのカードを削除（一覧から遷移するため。C-042/C-043） |
| CustomerListMainte | ○ | ○ | マスタ | |
| ProductListMainte | ○ | ○ | マスタ | C-019で新設（商品一覧登録）。**2026-08-04実装完了**（第1段）。両メニューの非活性カード（C-042/C-043）を有効化済み |
| OrderList | ○ | ○ | 受注管理 | |
| OrderDetailListMainte | − | − | − | OrderListからF3/F5で遷移。両メニューのカードを削除（受注番号を引き継ぐため単独起動できない。C-042/C-043） |
| OrderUpload | ○ | ○ | 受注管理 | AdminMenuには2026-07-31時点で項目なし＝意図した設計（A-007）だったが、C-043で掲載を決定し構成差を解消 |
| OrderUploadErrorList | ○ | ○ | 受注管理 | **C-041で新設**（取込エラー一覧）。OrderUploadの取込チェックで検出したエラーの照会専用。OrderUpload画面からの直接遷移は設けず、メニュー経由とする（upload型の標準構成を崩さないため。依頼者決定⑥） |
| ThemeListMainte | − | ○ | システム | **管理者専用**。C-042でStartMenuから除外（システム共通のテーマ設定は管理者の業務） |
| ThemePersonalListMainte | ○ | ○ | システム | |
| BatchList | ○ | ○ | 受注管理 | BatchListからF2でBatchDivisionListへ。AdminMenuへの掲載はC-043（A-007の構成差を解消） |

### 1.2 メニュー以外の遷移・呼び出し

| 起点 | 先 | トリガ | 形態 |
|------|-----|--------|------|
| OrderList | CustomerSelectionDialog | 「顧客検索」ボタン | iframe分離のポップアップ選択ダイアログ（値返却） |
| OrderDetailListMainte | ProductSelectionDialog | 明細行ごとの「選択」ボタン | iframe分離のポップアップ選択ダイアログ（値返却。押した行へ商品ＩＤ・商品名称・受注単価を転記。C-044） |
| OrderList | OrderListPrint | 帳票ボタン（Ｈ/ＨＭ） | 帳票ダウンロード（画面遷移なし） |
| OrderUpload | BatchOrderUpload | 「実行」承認後（取込チェックでエラー0件のとき） | 非同期バッチ起動（進捗はBatchList/BatchDivisionListで確認）。**「実行」はcheck（取込＋チェック）→execute（バッチ起動）の2リクエスト**で構成する（C-041） |
| OrderUpload | （遷移なし。ダイアログ表示） | 「実行」承認後（取込チェックでエラー検出時） | エラー件数の要約を表示し取込エラー一覧へ誘導する（MSG-015。明細は表示しない。C-041） |
| BatchList | BatchDivisionList | F2「分割画面」 | バッチ管理ＩＤ引継ぎ |
| 任意の画面 | Error404 | 未実装プログラム名の指定 | 「戻る」でブラウザ履歴の前画面へ |

---

## 2. データ設計

### 2.1 データモデル参照

ER図・テーブル一覧・テーブル定義は要件定義と並行して以下のデータモデル設計書で管理する（Haluの DOA 方針により、画面設計に先行してデータモデルを固めるため）。

- データモデル設計書: [`docs/11_データモデル/データモデル設計書.md`](../11_データモデル/データモデル設計書.md)

### 2.2 項目語彙一覧（データディクショナリ）

| 項目名（日本語） | テーブル.カラム | 型 | 桁数 | 主な使用画面 | 備考 |
|------------------|------------------|----|------|--------------|------|
| ユーザＩＤ | ユーザ.ユーザＩＤ | number | - | UserList, UserDetailMainte | PK、自動採番 |
| ユーザコード | ユーザ.ユーザコード | text | 20 | Login, UserList, UserDetailMainte | ログインID。Login画面の表示名は「ログインＩＤ」（完全一致で照合）。UserDetailMainteの実装validation（従来max50）はC-027（2026-08-02）で本表どおり20桁に統一済み |
| ユーザ名 | ユーザ.ユーザ名 | text | 50 | Login, UserList, UserDetailMainte | Login応答内の項目名は「ユーザ名称」。バッチ系画面の「ユーザ名称」はログインセッション由来の同値 |
| パスワード | ユーザ.パスワード | text | - | Login, UserDetailMainte | **SHA256ハッシュ化して保存・照合する（2026-07-31決定・A-011・C-022。2026-08-01実装完了（既存データ移行済み））**。UserListの検索・一覧表示は廃止済み（C-018・2026-08-01実装完了） |
| メニュー名 | ユーザ.メニュー名 | text | - | UserDetailMainte, UserList | "StartMenu" / "AdminMenu"。Login認証成功時の遷移先分岐に使用 |
| メールアドレス | ユーザ.メールアドレス | text | - | UserDetailMainte | |
| テーマコード | ユーザ.テーマコード、テーマ.テーマコード | text | - | UserDetailMainte, ThemeListMainte, ThemePersonalListMainte, Login, UserList | ThemePersonalListMainteはユーザ.テーマコードを直接更新（画面内部名「選択テーマコード」）。LoginはCSSファイル名の導出に使用 |
| 備考 | ユーザ.備考 | text | - | UserDetailMainte, UserList | 顧客.備考、受注明細.備考は別カラム（下記）。validation定義なし（上限指定なし。2026-08-02 依頼者決定により実態へ同期。UserDetailMainte_validation.jsonに備考エントリなし、DDL（Sample_DDL_20250122.sql）のユーザ.備考もcharacter varying桁指定なしで裏付け） |
| テーマ名称 | テーマ.テーマ名称 | text | - | ThemeListMainte, ThemePersonalListMainte | |
| 使用中フラグ | テーマ.使用中フラグ | number | - | ThemeListMainte, ThemePersonalListMainte | 画面表示名「使用」。ThemePersonal側はユーザ.テーマコードとの一致判定によるJOIN算出値として表示（テーマ.使用中フラグ実カラムは参照しない） |
| 顧客ＩＤ | 顧客.顧客ＩＤ、受注ヘッダ.顧客ＩＤ | number | - | CustomerListMainte, CustomerSelectionDialog, OrderList, OrderListPrint | PK、SERIAL自動採番。受注ヘッダからの参照はDB制約なし（アプリ側で担保） |
| 顧客氏名 | 顧客.顧客氏名 | text | 100 | CustomerListMainte, CustomerSelectionDialog, OrderList, OrderDetailListMainte, OrderListPrint | 必須（not null） |
| 備考（顧客） | 顧客.備考 | text | - | CustomerListMainte | 桁数上限なし |
| 削除フラグ | 顧客.削除フラグ、商品.削除フラグ | text | 1 | CustomerListMainte, ProductListMainte | 一覧の削除チェック。ON="9" / OFF="0" |
| 行番号 | 受注ＣＳＶエラー.行番号 | number | - | OrderUploadErrorList | **C-041で新設**。ＣＳＶファイル上の物理行番号（1行目＝ヘッダ行）。マスタ照合エラーは受注ＣＳＶからＳＱＬで検出するため保持しない（NULL＝画面では空欄） |
| 項目名 | 受注ＣＳＶエラー.項目名 | text | 40 | OrderUploadErrorList | **C-041で新設**。エラー対象のＣＳＶ項目名。単一項目に帰属しないものは「レイアウト」「受注番号・明細番号」を入れる |
| 項目値 | 受注ＣＳＶエラー.項目値 | text | - | OrderUploadErrorList | **C-041で新設**。ＣＳＶ上の生値（レイアウトエラーの場合は行全体）。表示時はＨＴＭＬエスケープする（アップロードファイル由来のため） |
| エラー内容 | 受注ＣＳＶエラー.エラー内容 | text | 200 | OrderUploadErrorList | **C-041で新設**。エラーの理由（文言はOrderUpload.md 5.3の表が正） |
| 取込日時 | 受注ＣＳＶエラー.取込日時 | timestamp | - | OrderUploadErrorList | **C-041で新設**。表示は`YYYY/MM/DD HH24:MI:SS`（common.mdの日時表示既定） |
| 商品ＩＤ | 商品.商品ＩＤ、受注明細.商品ＩＤ | number | - | ProductListMainte, ProductSelectionDialog, OrderDetailListMainte | PK、SERIAL自動採番（C-019）。受注明細から参照される（NOT NULL・FK）。**OrderDetailListMainteでは画面に表示せずdatasetのみで保持**し、商品選択ダイアログの選択結果として設定する（C-044。未選択の入力行は画面側チェックで弾く） |
| 商品コード | 商品.商品コード、受注ＣＳＶ.商品コード | text | 20 | ProductListMainte, ProductSelectionDialog, OrderUpload, BatchOrderUploadProc | **業務キー**（C-019）。削除フラグ='0'限定の部分一意索引で重複を禁止（論理削除済みコードは再登録可。C-024と同じ判断）。採番規則なし・手入力。ProductSelectionDialogでは一覧表示＋検索条件（部分一致）。**CSV取込では商品マスタとの名寄せキー**（受注ＣＳＶの6列目。完全一致・有効行限定。未登録なら取込を全件中止。C-045） |
| 標準単価 | 商品.標準単価 | number | 11 | ProductListMainte, ProductSelectionDialog | 受注明細入力時の受注単価の初期値（**転記後は受注明細側で編集可**＝値引き・特価に対応。C-044）。**現在値のみ保持し価格改定履歴は持たない**（2026-08-04依頼者確認済み＝A-018）。**必須**（画面validation＋DB NOT NULL。2026-08-04 UATで決定＝C-048） |
| 備考（商品） | 商品.備考 | text | - | ProductListMainte | 桁数上限なし |
| 受注番号 | 受注ヘッダ.受注番号、受注明細.受注番号、受注ＣＳＶ.受注番号、受注ＣＳＶエラー.受注番号 | text | 10 | OrderList, OrderDetailListMainte, OrderUpload, OrderListPrint, OrderUploadErrorList | PK（明細は明細番号との複合）。受注ＣＳＶエラー.受注番号は**C-041で追加**。ＦＫ参照ではなく取込時の生値をそのまま保持する |
| 明細番号 | 受注明細.明細番号、受注ＣＳＶ.明細番号、受注ＣＳＶエラー.明細番号 | number | - | OrderDetailListMainte, OrderListPrint, OrderUploadErrorList | 複合PK。新規行はサーバー側で採番。受注ＣＳＶエラー.明細番号は**C-041で追加**。ＦＫ参照ではなく取込時の生値をそのまま保持し、型も受注明細と異なりcharacter varying（文字列） |
| 受注日 | 受注ヘッダ.受注日 | date | - | OrderList, OrderDetailListMainte, OrderListPrint | 表示形式YYYY/MM/DD |
| 受注金額合計 | 受注ヘッダ.受注金額合計 | number | - | OrderList, OrderDetailListMainte, OrderListPrint | 明細金額の集計値（アプリ側で担保）。画面表示名は「受注金額」（OrderList）「合計金額」（OrderDetailListMainte） |
| 明細数 | （DBカラムなし） | number | - | OrderList | 派生項目。ＳＱＬで受注明細の件数を`COUNT(dtl.明細番号)`により算出する（`OrderList_select_sql.json`） |
| 商品名称 | 受注明細.商品名称、商品.商品名称 | text | 100 | OrderDetailListMainte, OrderListPrint, ProductListMainte, ProductSelectionDialog, BatchOrderUploadProc | 商品.商品名称は必須（not null）。**受注明細側は受注時点のスナップショット**（商品ＩＤで参照しつつ名称も保持。C-019）。**OrderDetailListMainteでは自由入力を廃止し読取専用**（商品選択ダイアログの選択結果を転記。C-044実装完了）。**CSV取込でも商品マスタから転記する**（受注ＣＳＶは商品名称を持たない。画面入力経路と出所を一致させる。C-045） |
| 受注数量 | 受注明細.受注数量 | number | - | OrderDetailListMainte, OrderListPrint | |
| 受注単価 | 受注明細.受注単価、受注ＣＳＶ.受注単価 | number | - | OrderDetailListMainte, OrderListPrint, OrderUpload, BatchOrderUploadProc | 商品選択時に商品.標準単価が初期値として転記される（**転記後も編集可**。C-044）。**CSV取込ではCSVの値をそのまま使う**（外部システムが決めた単価。商品マスタの標準単価では上書きしない。C-045） |
| 受注金額 | 受注明細.受注金額 | number | - | OrderDetailListMainte, OrderListPrint | 受注数量×受注単価の自動計算値 |
| 納期日 | 受注明細.納期日 | date | - | OrderDetailListMainte, OrderListPrint | |
| 備考（受注明細） | 受注明細.備考 | text | - | OrderDetailListMainte, OrderListPrint | 桁数上限なし |
| ファイル名 | （DBカラムなし） | text | - | OrderUpload | アップロードするCSVファイル名。受注ＣＳＶテーブルの各カラムはデータモデル設計書参照 |
| バッチ管理ＩＤ | バッチ管理.バッチ管理ＩＤ、バッチ分割管理.バッチ管理ＩＤ | number | - | BatchList, BatchDivisionList | PK、自動採番。フレームワーク管理テーブル |
| バッチ分割管理ＩＤ | バッチ分割管理.バッチ分割管理ＩＤ | number | - | BatchDivisionList | 分割実行の連番。画面表示名「明細バッチ分割管理ＩＤ」 |

上表のほか、以下はフレームワーク・技術系の項目群のため個別語彙としては掲載せず、データモデル設計書のテーブル定義を正とする。

- **ログ情報**の各カラム（アクセス日時・画面名・host・useragent等の端末情報）: StartMenu/AdminMenu（表示・メニュー項目クリック）と、全画面のヘッダー右上「ログアウト」（ログオフ。`Header.svelte`がStartMenuの`term`定義で記録。Issue #27）がアクセスログとして記録
- **バッチ管理系**の運用カラム（処理名・ロードパス名・分割数・開始/終了日時等）: BatchList/BatchDivisionListに表示。仕様は Halu開発ガイド『バッチ処理』 参照

### 2.3 入力方式・選択肢供給の既定

実装一貫性監査（`docs/50_品質管理/実装一貫性監査_20260802.md` ブレ1・4）の裁定により規定化（2026-08-02依頼者決定。C-032/C-035）。

| 対象 | 既定 | 備考 |
|------|------|------|
| 日付入力 | `<input type="date">`（ISO/YYYY-MM-DD連携）。validation=`yyyyhmmhdd`・min/max=10。SQL側の画面返却は `TO_CHAR(..., 'YYYY-MM-DD')` | 正典: OrderListの検索受注日カラ/マデ。OrderDetailListMainteの納期日はC-032で本既定へ統一 |
| 数値入力 | `type="text"`＋右寄せ（`text-end`）＋integerP系validation。`type="number"`は使わない | Halu標準の書式整形と併用するため（全画面で一貫済み） |
| 固定選択肢（DBマスタを持たないenum） | init系tran.jsonのresponse静的値で供給する。HTMLへの`<option>`直書きは禁止。表示名がコードと異なる場合はコード/名称の対（`list_◯◯コード`/`list_◯◯名称`）で持つ | 現状のメニュー名（コード=表示名の同一値 `["StartMenu","AdminMenu"]`）は許容 |
| DBマスタ由来の選択肢 | init系sql.jsonでコード＋名称を取得する | 例: テーマ（`list_テーマコード`/`list_テーマ名称`） |

### 2.3.1 検索条件の一致方式の既定

自由入力の検索条件は**部分一致（`LIKE '%%値%%'`）**、選択肢（セレクトボックス）由来の条件は**完全一致**を既定とする（2026-08-04・C-044でProductSelectionDialogを実装する際に既存実装の実態を正として明文化。それまで既定表が無く画面ごとの判断に委ねられていた）。値が空の条件は句を生成しない（絞り込みなし）。

| 対象 | 既定 | 実装例 |
|------|------|--------|
| コード・名称等の自由入力 | 部分一致 | UserList（ユーザコード・ユーザ名）、OrderList（顧客氏名）、ProductSelectionDialog（商品コード・商品名称） |
| セレクトボックス由来 | 完全一致 | UserList（メニュー名・テーマコード） |
| 数値ＩＤ | 完全一致（リテラルとして埋め込む。2.4参照） | OrderList（顧客ＩＤ） |
| 日付範囲 | FROM/TOによる範囲比較（`>=` / `<=`） | OrderList（受注日カラ/マデ） |
| 認証キー | **完全一致**（部分一致にしてはならない） | Login（ユーザコード）。C-018で確認済み |
| 業務キーによる名寄せ（検索条件ではなく突合） | **完全一致**（部分一致にしてはならない） | OrderUpload／BatchOrderUploadProc（受注ＣＳＶ.商品コード → 商品.商品コード。C-045）。有効行（削除フラグ='0'）に限定する |

本既定から外れる場合は各画面仕様書の備考に理由を明記する。

### 2.4 検索条件フック（setSql系）でのSQLリテラル埋め込みの既定

実装一貫性監査（`docs/50_品質管理/実装一貫性監査_20260802.md` A-1観点の別建て）で検出したSQLインジェクション（C-030）の是正にあわせて規定化（2026-08-02依頼者決定）。

| 対象 | 既定 | 備考 |
|------|------|------|
| 文字列リテラルへの埋め込み | フレームワーク共通の `escapeSqlLiteral()`（`from commons.sqlescape import escapeSqlLiteral`。実体は `HaluServer/.../Libraries/commons/sqlescape.py`。C-036で梱包）を必ず通す | フックに届く時点でリクエスト値の `'` はController層により全角2文字「’’」へ置換済みで、SQL組み立て後に `'` へ復元される。素通しするとリテラルが閉じて注入が成立する（実測: 検索値 `x' OR 'a' LIKE 'a` で全件返却） |
| 数値項目の条件 | 引用符なしで埋め込まない。`= '{値}'` のリテラルとして埋め込む | 引用符なしだとクォートを含まない注入（`1 OR 1=1`）が成立する。integer列でもPostgreSQLが文字列リテラルを暗黙キャストするため比較は成立する（既存の `LIMIT '10'` と同じ流儀） |
| バインド変数（sql.jsonのinput）経由 | 本既定の対象外 | フレームワーク側（`fieldtype`）が処理するため、フックでのエスケープは不要 |

### 2.5 SQL実装方式の既定

- SQL定義は `genesql`（構造化SQL定義）を既定とする。`freesql`／`doRun` は `genesql` で表現できない場合に限り例外として採用し、当該設計書の特記事項に採用理由と対象テーブル・操作を明記して、実装の CRUD 宣言キー（`sqls[].sql.crud`。記法は Halu開発ガイド『JSON定義』「crud」）と一致させる（宣言の構文・併記漏れは 静的整合チェック C11/C12 が検証。仕様書リバース出力ツール のＣＲＵＤ表は宣言を正として読む）。
- 本アプリの現状（2026-09-07 `Json/Apps` 配下を grep で確認）: 非空の `freesql` は `ThemeListMainte_execute_sql.json`（テーマの全件洗い替え DELETE→INSERT。宣言 `{"テーマ": "D"}`）のみ。CRUD 宣言キーは C-003（2026-07-18・他アプリで確立した規約の横展開）で付与済み＝`OrderList_printH_sql.json`（受注ヘッダ R）・`OrderUpload_check_sql.json`（2件）・`ThemeListMainte_execute_sql.json`・`UserDetailMainte_insert_sql.json`（ユーザ R）。`doRun` は未使用。

### 2.6 表示書式の既定

画面表示・帳票出力の書式は以下を既定とし、各画面・帳票の設計書には**逸脱する場合のみ**備考に書く（見た目の意匠はフェーズ2の対象だが、書式は機能仕様のためフェーズ1で確定する）。本表は実装（`Html/Apps/*/index.html` のclass指定・各`*_sql.json`のTO_CHAR・帳票の`OrderListPrint_*_sql.json`）から採取した現状の書式である。

| 項目の種類 | 画面表示 | 帳票出力 | 備考（ＳＱＬ側の変換等） |
|-----------|---------|---------|----------------------|
| 日付（表示専用） | YYYY/MM/DD | YYYY/MM/DD | `TO_CHAR(..., 'YYYY/MM/DD')`。画面=OrderListの受注日、帳票=受注一覧表（Ｈ／ＨＭ）の受注日・納期日 |
| 日付（入力欄） | YYYY-MM-DD | － | ネイティブ`<input type="date">`の値形式（2.3の入力方式既定）。ＳＱＬ返却も `TO_CHAR(..., 'YYYY-MM-DD')`（OrderDetailListMainteの納期日） |
| 日時 | YYYY/MM/DD HH24:MI:SS | （帳票での日時出力はなし） | `TO_CHAR(..., 'YYYY/MM/DD HH24:MI:SS')`。BatchList・BatchDivisionListの開始／終了日時、OrderUploadErrorListの取込日時 |
| 金額・数量（表示専用） | 3桁カンマ区切り・右寄せ（`text-end`） | 同左 | `TO_CHAR(..., 'FM999,999,999')`。画面=OrderListの受注金額、帳票=受注一覧表の受注金額・合計金額・受注数量・受注単価。**カンマ整形はＳＱＬ側で行い、クライアント側に整形処理は持たない**（横断Grepで整形コードなしを確認） |
| 金額・数量（入力欄） | カンマなし・右寄せ（`text-end`） | － | 入力値をそのまま数値validation（integerP系。2.3）へ通すため。`TO_CHAR(..., 'FM999999999')`。OrderDetailListMainteの受注数量・受注単価・受注金額、ProductListMainte／ProductSelectionDialogの標準単価 |
| 区分・フラグ | チェックボックス（削除）またはラジオボタン（使用）で表示し、格納値そのものは表示しない | － | 値と意味はデータモデル設計書5章「区分値一覧」を参照 |
| 文字列・コード | 左寄せ（`text-start`）。明細番号等の短い数値キーは中央寄せ（`text-center`） | 同左 | ゼロ埋め・単位付与は行わない |

---

## 3. 認証・認可

- ユーザコード + パスワードによるログイン認証（完全一致照合。パスワードの保存形態は2.2「パスワード」の備考参照）
- メニュー名でアクセスできる画面を制御（StartMenu / AdminMenu）
- メニュー画面の表示・メニュー項目クリック時と、ヘッダー右上「ログアウト」時（ログオフ。画面名「ログオフ（メニュー終了）」。Issue #27）に「ログ情報」テーブルへアクセスログを記録する（記録項目はデータモデル設計書参照）
- **loginレコード送信の既定**（2026-08-02 実装一貫性監査ブレ2の裁定=C-033）: 登録ユーザ/更新ユーザ列を持つテーブルを更新するtranは`"id": "login"`レコードを送信し、sql.jsonで当該列に記録する（例: CustomerListMainte(execute)・UserDetailMainte(insert/update/delete)・ThemeListMainte(execute)・ThemePersonalListMainte(execute)。後2者はC-052・Issue #34で是正）。**記録する値は`login.ユーザＩＤ`**（3.1の表のとおり。C-052で明文化）。なお CustomerListMainte(execute)・ProductListMainte(execute) は`login.ユーザ名称`を記録しており本既定と食い違う（C-052の付随発見。既存データの扱いを含め別C番号で是正する）。それ以外のtranでは送信しない（サーバーで使わないloginレコードを残さない。OrderDetailListMainte(update)の未使用送信はC-033で除去）。例外: データ範囲をログインユーザで絞る画面（ThemePersonalListMainte）は参照系tranでも送信してよい

### 3.1 セッション保持項目と権限強制の実装方式

ログイン時に `Login_check_sql.json` の認証SQL出力（`ユーザ` テーブル。`削除フラグ='0'` の有効ユーザのみ。パスワードはSHA256ハッシュ照合＝C-022）から、以下を `login.model.mixin` が sessionStorage へ保持する。Sample には部門の概念が無いため「主所属部門」は持たない。

| セッション項目 | 取得元（認証SQL出力） | 用途 |
|---------------|----------------------|------|
| ユーザＩＤ | `ユーザ.ユーザＩＤ` | dataset/tran の `login` レコード経由でサーバーへ渡す共通キー（登録ユーザ／更新ユーザ列の既定値。3章冒頭の C-033 既定） |
| ユーザ名称 | `ユーザ.ユーザ名` | 画面ヘッダーの「ログインユーザ」表示・監査カラム |
| メニュー名 | `ユーザ.メニュー名` | ログイン後の着地メニュー（StartMenu／AdminMenu）の分岐＝ロール（3.2） |

- データ範囲の権限強制は `login` レコードのユーザＩＤをサーバー側SQLの条件に使う方式（実例: ThemePersonalListMainte はログインユーザ自身のテーマ設定のみを select/execute する）。それ以外の画面はデータ範囲の制限を持たない（3.2 参照）。

### 3.2 権限マトリクス（機能×ロール）

ロールは**ユーザ.メニュー名**（`StartMenu`＝一般ユーザ／`AdminMenu`＝管理者。値の定義はデータモデル設計書5章）。○×は1.1「メニューからの遷移一覧」の掲載有無から起こした（メニュー経由でのみ到達する画面は、遷移元画面の可否に従う）。

| 画面ID | 機能（mode） | StartMenu（一般） | AdminMenu（管理者） | 越境時の挙動（照会系／更新系） | 備考 |
|--------|-------------|:---------:|:---------:|------------------------------|------|
| Login | init / check | ○ | ○ | － | 認証前の共通画面 |
| StartMenu | init / term / userinfo | ○ | ○ | 未定義（要決定） | AdminMenuユーザも到達可（ログイン後の着地はメニュー名で分岐） |
| AdminMenu | init / term / userinfo | × | ○ | 未定義（要決定） | |
| UserList | init / select | × | ○ | 未定義（要決定） | **管理者専用**（C-042でStartMenuから除外） |
| UserDetailMainte | init / select / insert / update / delete | × | ○ | 未定義（要決定） | UserList経由でのみ到達（両メニューにカードなし） |
| CustomerListMainte | select / execute | ○ | ○ | 未定義（要決定） | |
| ProductListMainte | select / execute | ○ | ○ | 未定義（要決定） | |
| CustomerSelectionDialog | select | ○ | ○ | 未定義（要決定） | OrderList／OrderDetailListMainteからの呼び出し |
| ProductSelectionDialog | select | ○ | ○ | 未定義（要決定） | OrderDetailListMainteからの呼び出し（C-044） |
| OrderList | select / printH / printHM | ○ | ○ | 未定義（要決定） | 帳票OrderListPrint（printH／printHM）の起点 |
| OrderDetailListMainte | select / update | ○ | ○ | 未定義（要決定） | OrderList経由でのみ到達 |
| OrderUpload | check / execute | ○ | ○ | 未定義（要決定） | executeでバッチ起動（C-041で2リクエスト方式） |
| OrderUploadErrorList | select | ○ | ○ | 未定義（要決定） | 照会専用（C-041） |
| ThemeListMainte | select / execute | × | ○ | 未定義（要決定） | **管理者専用**（C-042でStartMenuから除外） |
| ThemePersonalListMainte | select / execute | ○ | ○ | 未定義（要決定） | データ範囲はログインユーザ自身のみ（`login`レコードのユーザＩＤでＳＱＬを絞る） |
| BatchList | select / delete | ○ | ○ | 未定義（要決定） | |
| BatchDivisionList | select / restart | ○ | ○ | 未定義（要決定） | BatchList経由でのみ到達 |
| Error404 | （なし） | ○ | ○ | － | 未実装プログラム名指定時の共通エラー画面 |

**越境時の挙動**: 要件定義書5.2 NFR-006 のとおり**容認**（対象外として現状を追認。2026-10-05 依頼者決定・A-037・Issue #84）。実装は**メニューカードの掲載有無のみ**で制御し、サーバー側にロール判定を持たない（`Login_check_sql.json`がユーザ.メニュー名を返し、`login.model.mixin`がsessionStorageへ保持して着地メニューを分岐するだけ。アプリのＳＱＬ・フックでメニュー名を権限判定に使っている箇所は無い）。したがってURL直打ち・API直呼び出しによる越境は照会系・更新系とも容認する。サーバー側の認可はフレームワーク側の課題（Issue #75）として扱う。

---

## 4. ログ

- フレームワーク標準のログ出力（DEBUGレベル）
- ログ出力先: HaluServer/Halu/System/Server/Logs/

---

## 5. エラーハンドリング

- バリデーションエラー: フレームワーク標準メッセージを画面上部に表示
- サーバーエラー: 「システムエラーが発生しました」を表示し、詳細はサーバーログに記録

### 5.1 排他・同時更新の方針

| 項目 | 方針 |
|------|------|
| 更新競合の扱い | **後勝ち（最終更新が有効）**。更新系ＳＱＬのWHERE句は主キーのみで、更新日時の一致確認（楽観ロック）は行わない（`UserDetailMainte_update/delete`・`CustomerListMainte_execute`・`ProductListMainte_execute`・`OrderDetailListMainte_update`・`ThemePersonalListMainte_execute` を横断確認） |
| 競合検知時のメッセージ | なし（競合を検知しないため。7章に該当メッセージを持たない） |
| 全件洗い替え方式の画面 | ThemeListMainte（execute: テーマを全件DELETE→INSERT）／OrderUpload（check: 受注ＣＳＶ・受注ＣＳＶエラーを全件DELETE→INSERT）。同時実行時に他ユーザの更新・取込を失い得るが、排他制御・実行中判定は実装していない |
| 対象画面 | 全メンテ画面（方式は共通） |


---

## 6. コード体系

| コード名 | 形式 | 例 | 採番ルール |
|----------|------|----|-----------|
| ユーザＩＤ | 整数 | 1, 2, 3... | SERIAL自動採番 |
| ユーザコード | 任意文字列 | EMP001 | 運用で決定 |
| テーマコード | 任意文字列 | halu-custom_default, halu-custom_dark, halu-custom_navy | 運用で決定。ファイル名（拡張子除く）と一致させる |
| 商品ＩＤ | 整数 | 1, 2, 3... | SERIAL自動採番 |

---

## 7. 共通メッセージ一覧

本一覧は実装文言への同期（2026-08-02 依頼者決定）。以下は横断Grepで実際に検出した文言のみを掲載する（推測・理想形は記載しない）。文言の統一・共通化は将来の改善候補。

| メッセージID | 区分 | メッセージ | 発生画面・出所ファイル |
|-------------|------|----------|--------------|
| MSG-001 | エラー | ログインＩＤもしくはパスワードが間違っています。 | Login。`Login_check_sql.json`の`errormsg` |
| MSG-002 | エラー | ユーザコードは既に登録されています。 | UserDetailMainte（新規登録時のユーザコード重複チェック）。`UserDetailMainte_insert_sql.json`の`errormsg` |
| MSG-003 | エラー | ファイル名が間違っています。ファイルをキャンセル後、正しいファイル名：.csvを選択して下さい。（title: ファイル選択エラー） | OrderUpload（拡張子不正時）。`OrderUpload.model.js` |
| MSG-004 | エラー | 複数のファイルは選択できません。（title: ファイル選択エラー） | OrderUpload（複数ファイル選択時）。`OrderUpload.model.js` |
| MSG-005 | 警告 | 削除する行にチェックを付けて下さい。（title: 削除確認） | CustomerListMainte・ProductListMainte（いずれも削除実行時にチェック0件。ProductListMainteはC-019でCustomerListMainte C-012の既定を踏襲）。`CustomerListMainte.controller.js`、`ProductListMainte.controller.js` |
| MSG-006 | エラー（共通パターン） | 行が選択されていません。選択して下さい。（title: 選択エラー） | 一覧・選択ダイアログ系の共通ミックスイン（multiTableListForm・dataSelectionDialog）を使う複数画面で共通表示。`Html/js/multiTableListForm.model.mixin-1.0.0.js`、`Html/js/dataSelectionDialog.model.mixin-1.0.0.js` |
| MSG-007 | 確認 | 受注CSVデータ 更新処理を実行します。よろしいですか？（title: 受注CSVデータ 更新処理　確認） | OrderUpload（実行ボタン押下時）。`OrderUpload.controller.js` |
| MSG-008 | 確認 | 削除を実行します。よろしいですか。（title: 削除　実行確認） | BatchList（処理削除ボタン押下時）。`BatchList.controller.js` |
| MSG-009 | 確認 | 再処理を実行します。よろしいですか。（title: 再処理　実行確認） | BatchDivisionList（再処理ボタン押下時）。`BatchDivisionList.controller.js` |
| MSG-010 | 完了（共通パターン） | 〇〇処理は正常に終了しました。（title: サーバ処理確認。〇〇部分はAPI処理名に置換） | ほぼ全画面のCRUD・照会・帳票API応答で共通。各画面`*_sql.json`/`*_tran.json`の`msg`フィールド（例:「照会処理は正常に終了しました。」＝UserList_select_sql.json、「登録処理は正常に終了しました。」＝UserDetailMainte_insert_sql.json、「削除処理は正常に終了しました。」＝UserDetailMainte_delete_sql.json、「訂正処理は正常に終了しました。」＝UserDetailMainte_update_sql.json、「プリント処理は正常に終了しました。」＝OrderListPrint系、「ログインチェック処理は正常に終了しました。」＝Login_check_sql.json ほか）。以下は同パターンから文言が外れる例外: 「受注データ アップロード 実行処理は正常に起動されました。」（OrderUpload_execute_sql.json/_tran.json。非同期バッチ起動画面のため「終了」ではなく「起動」を用いる。sql.json側の旧文言「〜終了されました。」はC-034で是正済み）／「受注ヘッダ・受注明細 更新 バッチ起動を実行しました。」（BatchOrderUploadStart_start_tran.json）／「受注ヘッダ・受注明細 更新 バッチ処理を正常に終了しました。」（BatchOrderUploadProc_proc_tran.json）／「個人用テーマ設定を正常に更新しました。」（ThemePersonalListMainte_execute_tran.json）／「テーマ データを正常に更新しました。」（ThemeListMainte_execute_tran.json） |
| MSG-011 | （廃止）パターン確認用（テストメッセージ。業務メッセージではない） | （廃止） | 旧CustomerSelectionDialog画面の「警告・確認・実行・サーバ」ボタンで使用していたが、C-076 で同ボタンを削除したため使用箇所なし（番号は欠番として維持） |
| MSG-012 | 警告 | 商品コードが重複しています。（{商品コード}）（title: 入力エラー） | ProductListMainte（登録時の一覧内重複チェック。C-019）。`ProductListMainte.controller.js` |
| MSG-013 | 警告 | {行番号}行目の商品が選択されていません。（title: 入力エラー） | OrderDetailListMainte（実行時の商品未選択チェック。C-044）。`OrderDetailListMainte.controller.js`。**サーバー側にも商品ＩＤのrequiredチェックがあるが、そちらは内部項目名がそのまま出るため画面側で先に業務語で伝える**（C-023と同じ方針） |
| MSG-014 | エラー | （**C-041で廃止**）商品マスタに登録されていない商品コードがあるため、取込を中止しました。／…（最大10件の明細列挙） | OrderUpload（C-045で追加した取込中止メッセージ）。**2026-08-05のC-041でMSG-015へ統合し廃止**（明細はダイアログに出さず取込エラー一覧で確認する方式へ変更。依頼者決定⑦）。文言・実装（`checkProductCode`／`makeProductCodeErrorMsg`／`escapeHtml`）とも削除済み。**同じ情報を2か所に出さない**という決定の記録として本行を残す |
| MSG-015 | エラー | ＣＳＶの内容にエラーが{件数}件あるため、取込を中止しました。／メニューの「取込エラー一覧」で内容を確認し、ＣＳＶまたは商品・顧客マスタを修正してから再実行してください。（title: 取込エラー） | OrderUpload（取込チェックでエラーを検出したとき。C-041）。`OrderUpload.model.js on取込チェック結果判定`。**件数のみを表示し明細は含めない**（明細は受注ＣＳＶエラーへ記録し取込エラー一覧で確認する）。`<br />`で改行する（`alertDialog`はメッセージをＨＴＭＬとして描画する） |
| MSG-016 | エラー | 取込対象のデータがありません。ＣＳＶファイルをアップロードしてから実行してください。（title: サーバエラー） | OrderUpload（executeモードで受注ＣＳＶが0件のとき。C-041）。`OrderUpload_model.py checkCsvNotEmpty`。checkモードを経ずにexecuteが要求された場合の防御 |
| MSG-017 | エラー | ＣＳＶファイルを読み込めませんでした。文字コードがＵＴＦ－８か確認してください。（title: サーバエラー） | OrderUpload（ＣＳＶの読み込みに失敗したとき。C-041）。`OrderUpload_model.py readOrderUpload`。Excel等でShift_JISとして保存されたファイルの取込を想定 |
| MSG-018 | エラー | 帳票の作成に失敗しました。サーバーログを確認してください。（title: サーバエラー） | OrderList（受注一覧表Ｈ／ＨＭの生成が帳票サーバー側で失敗したとき。C-064・Issue #14）。発生元はフレームワーク `HaluServer/Halu/System/Server/Libraries/excelprint/printmaincontroller.py`（`PRINT_ERROR_MSG`）で、画面側の実装は持たない（`Transaction.ajax` が `status != OK` をサーバエラーダイアログへ振り分ける）。従来は例外時に応答が `null` となりダイアログが出ずローディングが残っていた。PDF変換タイムアウト時の「PDF作成に失敗しました。」（`excelcreate.py`）と、帳票サーバー未起動時の「サーバー処理に失敗しました。サーバーログを確認してください。」（`halu.py`）も同じダイアログで表示される |

**注記:**
- 削除実行前の確認ダイアログ（旧MSG-006「削除してもよろしいですか？」相当）は実装に存在しない。CustomerListMainteはチェック0件時の警告（MSG-005）のみで、削除確定前の再確認は行っていない。
- フレームワーク標準のバリデーションメッセージ（例:「（必須入力です）」＝`haluvalidation.mixin-1.0.0.js`）が別途使用されているが、フレームワーク側ファイルの網羅は本表の対象外とする。

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
