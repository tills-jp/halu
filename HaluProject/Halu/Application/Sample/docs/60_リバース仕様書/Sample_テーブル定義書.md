# テーブル定義書: Sample

| 項目 | 内容 |
|------|------|
| 対象アプリ | Sample |
| 生成ツール | 仕様書リバース出力ツール |
| 作成日 | 2026-09-07 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | - |

## DB: sample

### 1. テーマ

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | テーマコード | - | character varying | - | 不可 | - | ○ |
| 2 | テーマ名称 | - | character varying | - | 不可 | - | - |
| 3 | 使用中フラグ | - | integer | 32 | 可 | - | - |
| 4 | 登録ユーザ | - | character varying | - | 可 | - | - |
| 5 | 登録日時 | - | timestamp without time zone | - | 可 | - | - |
| 6 | 更新ユーザ | - | character varying | - | 可 | - | - |
| 7 | 更新日時 | - | timestamp without time zone | - | 可 | - | - |
| 8 | 削除フラグ | - | character varying | - | 可 | - | - |

### 2. バッチキー管理（バッチキー管理）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | バッチ管理ＩＤ | バッチ管理ＩＤ | integer | 32 | 不可 | - | ○ |
| 2 | ＪＳＯＮデータ | ＪＳＯＮデータ | json | - | 可 | - | - |

### 3. バッチパラメータ管理（バッチパラメータ管理）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | バッチ管理ＩＤ | バッチ管理ＩＤ | integer | 32 | 不可 | - | ○ |
| 2 | ＪＳＯＮデータ | ＪＳＯＮデータ | json | - | 可 | - | - |

### 4. バッチ分割管理（バッチ分割管理）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | バッチ管理ＩＤ | バッチ管理ＩＤ | integer | 32 | 不可 | - | ○ |
| 2 | バッチ分割管理ＩＤ | バッチ分割管理ＩＤ | integer | 32 | 不可 | - | ○ |
| 3 | 開始日時 | 開始日時 | timestamp without time zone | - | 可 | - | - |
| 4 | 終了日時 | 終了日時 | timestamp without time zone | - | 可 | - | - |

### 5. バッチ帳票管理（バッチ帳票管理）

> ソース未参照（このアプリのSQL定義からは参照されていません）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | バッチ管理ＩＤ | バッチ管理ＩＤ | integer | 32 | 不可 | - | ○ |
| 2 | 帳票名 | 帳票名 | character varying | - | 可 | - | - |
| 3 | 帳票ファイルパス名 | 帳票ファイルパス名 | character varying | - | 可 | - | - |
| 4 | 出力回数 | 出力回数 | integer | 32 | 可 | - | - |
| 5 | 最終出力日時 | 最終出力日時 | timestamp without time zone | - | 可 | - | - |

### 6. バッチ管理（バッチ管理）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | バッチ管理ＩＤ | バッチ管理ＩＤ | integer | 32 | 不可 | nextval('"バッチ管理_バッチ管理ＩＤ_seq"'::regclass) | ○ |
| 2 | 会社名 | 会社名 | character varying | - | 可 | - | - |
| 3 | 部門名 | 部門名 | character varying | - | 可 | - | - |
| 4 | 処理名 | 処理名 | character varying | - | 不可 | - | - |
| 5 | ロードパス名 | ロードパス名 | character varying | - | 不可 | - | - |
| 6 | 処理モード | 処理モード | character varying | - | 不可 | - | - |
| 7 | 分割数 | 分割数 | integer | 32 | 不可 | - | - |
| 8 | 分割終了数 | 分割終了数 | integer | 32 | 不可 | - | - |
| 9 | ＮＥＸＴ処理名 | ＮＥＸＴ処理名 | character varying | - | 可 | - | - |
| 10 | ＮＥＸＴロードパス名 | ＮＥＸＴロードパス名 | character varying | - | 可 | - | - |
| 11 | ユーザ名称 | ユーザ名称 | character varying | - | 可 | - | - |
| 12 | ＤＢ名 | ＤＢ名 | character varying | - | 可 | - | - |
| 13 | コミット件数 | コミット件数 | integer | 32 | 可 | - | - |
| 14 | 開始日時 | 開始日時 | timestamp without time zone | - | 可 | - | - |
| 15 | 終了日時 | 終了日時 | timestamp without time zone | - | 可 | - | - |

### 7. バッチＣＳＶ管理（バッチＣＳＶ管理）

> ソース未参照（このアプリのSQL定義からは参照されていません）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | バッチ管理ＩＤ | バッチ管理ＩＤ | integer | 32 | 不可 | - | ○ |
| 2 | ＣＳＶ名 | ＣＳＶ名 | character varying | - | 可 | - | - |
| 3 | ＣＳＶファイルパス名 | ＣＳＶファイルパス名 | character varying | - | 可 | - | - |
| 4 | 出力回数 | 出力回数 | integer | 32 | 可 | - | - |
| 5 | 最終出力日時 | 最終出力日時 | timestamp without time zone | - | 可 | - | - |

### 8. ユーザ

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ユーザＩＤ | - | integer | 32 | 不可 | nextval('"ユーザ_ユーザＩＤ_seq"'::regclass) | ○ |
| 2 | ユーザコード | - | character varying | - | 不可 | - | - |
| 3 | ユーザ名 | - | character varying | - | 不可 | - | - |
| 4 | メールアドレス | - | character varying | - | 可 | - | - |
| 5 | パスワード | - | character varying | - | 不可 | - | - |
| 6 | メニュー名 | - | character varying | - | 可 | - | - |
| 7 | テーマコード | - | character varying | - | 可 | - | - |
| 8 | 備考 | - | character varying | - | 可 | - | - |
| 9 | 登録日時 | - | timestamp without time zone | - | 可 | - | - |
| 10 | 登録ユーザ | - | character varying | - | 可 | - | - |
| 11 | 登録画面 | - | character varying | - | 可 | - | - |
| 12 | 更新日時 | - | timestamp without time zone | - | 可 | - | - |
| 13 | 更新ユーザ | - | character varying | - | 可 | - | - |
| 14 | 更新画面 | - | character varying | - | 可 | - | - |
| 15 | 削除フラグ | - | "char" | - | 可 | '0'::"char" | - |

### 9. ログ情報

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ユーザＩＤ | - | integer | 32 | 不可 | - | ○ |
| 2 | アクセス日時 | - | timestamp without time zone | - | 不可 | - | ○ |
| 3 | 画面名 | - | character varying | - | 可 | - | - |
| 4 | remoteaddr | - | character varying | - | 可 | - | - |
| 5 | remotehost | - | character varying | - | 可 | - | - |
| 6 | host | - | character varying | - | 可 | - | - |
| 7 | hostname | - | character varying | - | 可 | - | - |
| 8 | port | - | character varying | - | 可 | - | - |
| 9 | request | - | character varying | - | 可 | - | - |
| 10 | code | - | character varying | - | 可 | - | - |
| 11 | browser | - | character varying | - | 可 | - | - |
| 12 | version | - | character varying | - | 可 | - | - |
| 13 | lang | - | character varying | - | 可 | - | - |
| 14 | platform | - | character varying | - | 可 | - | - |
| 15 | useragent | - | character varying | - | 可 | - | - |
| 16 | referer | - | character varying | - | 可 | - | - |
| 17 | domain | - | character varying | - | 可 | - | - |
| 18 | screen_w | - | character varying | - | 可 | - | - |
| 19 | screen_h | - | character varying | - | 可 | - | - |
| 20 | screen_col | - | character varying | - | 可 | - | - |

### 10. 受注ヘッダ（受注ヘッダ）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 受注番号 | 受注番号 | character varying | 10 | 不可 | - | ○ |
| 2 | 顧客ＩＤ | 顧客ＩＤ | integer | 32 | 可 | - | - |
| 3 | 受注日 | 受注日 | date | - | 可 | - | - |
| 4 | 受注金額合計 | 受注金額合計 | integer | 32 | 可 | - | - |

### 11. 受注明細

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 受注番号 | - | character varying | 10 | 不可 | - | ○ |
| 2 | 明細番号 | - | integer | 32 | 不可 | - | ○ |
| 3 | 商品名称 | - | character varying | 100 | 可 | - | - |
| 4 | 納期日 | - | date | - | 可 | - | - |
| 5 | 受注数量 | - | integer | 32 | 可 | - | - |
| 6 | 受注単価 | - | integer | 32 | 可 | - | - |
| 7 | 受注金額 | - | integer | 32 | 可 | - | - |
| 8 | 備考 | - | character varying | - | 可 | - | - |
| 9 | 商品ＩＤ | - | integer | 32 | 不可 | - | - |

### 12. 受注ＣＳＶ（受注ＣＳＶ）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 受注番号 | 受注番号 | character varying | - | 不可 | - | ○ |
| 2 | 明細番号 | 明細番号 | integer | 32 | 不可 | - | ○ |
| 3 | 顧客ＩＤ | 顧客ＩＤ | integer | 32 | 可 | - | - |
| 4 | 受注日 | 受注日 | date | - | 可 | - | - |
| 5 | 受注金額合計 | 受注金額合計 | integer | 32 | 可 | - | - |
| 6 | 納期日 | 納期日 | date | - | 可 | - | - |
| 7 | 受注数量 | 受注数量 | integer | 32 | 可 | - | - |
| 8 | 受注単価 | 受注単価 | integer | 32 | 可 | - | - |
| 9 | 受注金額 | 受注金額 | integer | 32 | 可 | - | - |
| 10 | 備考 | 備考 | character varying | - | 可 | - | - |
| 11 | 商品コード | 商品コード | character varying | 20 | 可 | - | - |

### 13. 受注ＣＳＶエラー（受注ＣＳＶエラー）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 受注ＣＳＶエラーＩＤ | 受注ＣＳＶエラーＩＤ | integer | 32 | 不可 | nextval('"受注ＣＳＶエラー_受注ＣＳＶエラーＩＤ_seq"'::regclass) | ○ |
| 2 | 行番号 | 行番号 | integer | 32 | 可 | - | - |
| 3 | 受注番号 | 受注番号 | character varying | - | 可 | - | - |
| 4 | 明細番号 | 明細番号 | character varying | - | 可 | - | - |
| 5 | 項目名 | 項目名 | character varying | 40 | 不可 | - | - |
| 6 | 項目値 | 項目値 | character varying | - | 可 | - | - |
| 7 | エラー内容 | エラー内容 | character varying | 200 | 不可 | - | - |
| 8 | 取込日時 | 取込日時 | timestamp without time zone | - | 可 | - | - |

### 14. 商品

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 商品ＩＤ | - | integer | 32 | 不可 | nextval('"商品_商品ＩＤ_seq"'::regclass) | ○ |
| 2 | 商品名称 | - | character varying | 100 | 不可 | - | - |
| 3 | 標準単価 | - | integer | 32 | 不可 | - | - |
| 4 | 備考 | - | character varying | - | 可 | - | - |
| 5 | 登録日時 | - | timestamp without time zone | - | 可 | - | - |
| 6 | 登録ユーザ | - | character varying | - | 可 | - | - |
| 7 | 登録画面 | - | character varying | - | 可 | - | - |
| 8 | 更新日時 | - | timestamp without time zone | - | 可 | - | - |
| 9 | 更新ユーザ | - | character varying | - | 可 | - | - |
| 10 | 更新画面 | - | character varying | - | 可 | - | - |
| 11 | 削除フラグ | - | character varying | 1 | 可 | '0'::character varying | - |
| 12 | 商品コード | - | character varying | 20 | 不可 | - | - |

### 15. 顧客（顧客）

| # | カラム物理名 | 論理名 | 型 | 桁 | NULL | 既定値 | PK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 顧客ＩＤ | - | integer | 32 | 不可 | nextval('"顧客_顧客ＩＤ_seq"'::regclass) | ○ |
| 2 | 顧客氏名 | - | character varying | 100 | 不可 | - | - |
| 3 | 備考 | - | character varying | - | 可 | - | - |
| 4 | 登録日時 | - | timestamp without time zone | - | 可 | - | - |
| 5 | 登録ユーザ | - | character varying | - | 可 | - | - |
| 6 | 登録画面 | - | character varying | - | 可 | - | - |
| 7 | 更新日時 | - | timestamp without time zone | - | 可 | - | - |
| 8 | 更新ユーザ | - | character varying | - | 可 | - | - |
| 9 | 更新画面 | - | character varying | - | 可 | - | - |
| 10 | 削除フラグ | - | character varying | 1 | 可 | '0'::character varying | - |
