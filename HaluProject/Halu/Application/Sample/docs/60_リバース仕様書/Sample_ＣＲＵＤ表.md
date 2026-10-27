# ＣＲＵＤ表: Sample

| 項目 | 内容 |
|------|------|
| 対象アプリ | Sample |
| 生成ツール | 仕様書リバース出力ツール |
| 作成日 | 2026-09-07 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | - |

## 1. CRUDマトリクス

| 画面ID | mode | テーマ | バッチキー管理 | バッチパラメータ管理 | バッチ分割管理 | バッチ管理 | ユーザ | ログ情報 | 受注ヘッダ | 受注明細 | 受注ＣＳＶ | 受注ＣＳＶエラー | 商品 | 顧客 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AdminMenu | init |  |  |  |  |  |  | C |  |  |  |  |  |  |
| AdminMenu | term |  |  |  |  |  |  | C |  |  |  |  |  |  |
| AdminMenu | userinfo |  |  |  |  |  |  | C |  |  |  |  |  |  |
| BatchDivisionList | restart |  |  |  |  | R |  |  |  |  |  |  |  |  |
| BatchDivisionList | select |  |  |  | R | R |  |  |  |  |  |  |  |  |
| BatchList | delete |  | D | D | D | D |  |  |  |  |  |  |  |  |
| BatchList | select |  |  |  |  | R |  |  |  |  |  |  |  |  |
| BatchOrderUploadProc | proc |  |  |  |  |  |  |  | CR | CR | R |  | R |  |
| BatchOrderUploadStart | start |  |  |  |  |  |  |  |  |  | R |  |  |  |
| CustomerListMainte | execute |  |  |  |  |  |  |  |  |  |  |  |  | CRU |
| CustomerListMainte | select |  |  |  |  |  |  |  |  |  |  |  |  | R |
| CustomerSelectionDialog | select |  |  |  |  |  |  |  |  |  |  |  |  | R |
| Login | check |  |  |  |  |  | R |  |  |  |  |  |  |  |
| Login | init | R |  |  |  |  |  |  |  |  |  |  |  |  |
| OrderDetailListMainte | select |  |  |  |  |  |  |  | R | R |  |  |  | R |
| OrderDetailListMainte | update |  |  |  |  |  |  |  | RU | CRUD |  |  |  | R |
| OrderList | printH |  |  |  |  |  |  |  | R |  |  |  |  |  |
| OrderList | printHM |  |  |  |  |  |  |  | R | R |  |  |  | R |
| OrderList | select |  |  |  |  |  |  |  | R | R |  |  |  | R |
| OrderListPrint | printH |  |  |  |  |  |  |  | R | R |  |  |  | R |
| OrderListPrint | printHM |  |  |  |  |  |  |  | R | R |  |  |  | R |
| OrderUpload | check |  |  |  |  |  |  |  |  |  | CRD | CRD | R | R |
| OrderUpload | execute |  |  |  |  |  |  |  |  |  | R |  |  |  |
| OrderUploadErrorList | select |  |  |  |  |  |  |  |  |  |  | R |  |  |
| ProductListMainte | execute |  |  |  |  |  |  |  |  |  |  |  | CRU |  |
| ProductListMainte | select |  |  |  |  |  |  |  |  |  |  |  | R |  |
| ProductSelectionDialog | select |  |  |  |  |  |  |  |  |  |  |  | R |  |
| StartMenu | init |  |  |  |  |  |  | C |  |  |  |  |  |  |
| StartMenu | term |  |  |  |  |  |  | C |  |  |  |  |  |  |
| StartMenu | userinfo |  |  |  |  |  |  | C |  |  |  |  |  |  |
| ThemeListMainte | execute | CRD |  |  |  |  |  |  |  |  |  |  |  |  |
| ThemeListMainte | select | R |  |  |  |  |  |  |  |  |  |  |  |  |
| ThemePersonalListMainte | execute | R |  |  |  |  | RU |  |  |  |  |  |  |  |
| ThemePersonalListMainte | select | R |  |  |  |  | R |  |  |  |  |  |  |  |
| UserDetailMainte | delete |  |  |  |  |  | U |  |  |  |  |  |  |  |
| UserDetailMainte | init | R |  |  |  |  |  |  |  |  |  |  |  |  |
| UserDetailMainte | insert |  |  |  |  |  | CR |  |  |  |  |  |  |  |
| UserDetailMainte | select |  |  |  |  |  | R |  |  |  |  |  |  |  |
| UserDetailMainte | update |  |  |  |  |  | RU |  |  |  |  |  |  |  |
| UserList | init | R |  |  |  |  |  |  |  |  |  |  |  |  |
| UserList | select |  |  |  |  |  | R |  |  |  |  |  |  |  |

†: freesql（生SQL文字列）からの正規表現抽出による計上。

> 注: 更新系（INSERT/UPDATE/DELETE）はフレームワークの仕様上、常にFROM句先頭の1テーブルのみが対象となる。

## 2. 要目視確認（機械抽出の対象外・精度限界）

### 2.1 freesql

該当なし。

### 2.2 サーバーPython直書きSQL

該当なし。
