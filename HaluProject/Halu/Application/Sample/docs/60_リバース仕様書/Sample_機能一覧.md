# 機能一覧: Sample

| 項目 | 内容 |
|------|------|
| 対象アプリ | Sample |
| 生成ツール | 仕様書リバース出力ツール |
| 作成日 | 2026-09-07 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | - |

> 本一覧は3層モデルで構成する。**業務機能**＝メニューグループ（メニュー画面のタブ構成に由来する近似）、**実装機能**＝画面・帳票・バッチ（下表の行）、**操作**＝モード（ＣＲＵＤ表の行「画面×mode」に対応）。
> 性格の凡例: **業務**＝業務機能を担う画面、**部品**＝他画面から呼び出される選択ダイアログ等、**共通**＝ログイン・メニュー・エラー画面等の基盤画面。

## 1. 画面

| # | 画面ID | 画面タイトル | 種別 | 性格 | モード | メニューグループ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | AdminMenu | メニュー(管理者用) | メニュー | 共通 | init, userinfo, term | 未分類 |
| 2 | BatchDivisionList | バッチ分割一覧 | list | 業務 | select, restart | 未分類 |
| 3 | BatchList | バッチ一覧 | list | 業務 | select, delete | StartMenu/受注管理 |
| 4 | BatchOrderUploadProc | 不明 | 不明 | 不明 | - | 未分類 |
| 5 | BatchOrderUploadStart | - | バッチ起動（画面なし） | 業務 | - | 未分類 |
| 6 | CustomerListMainte | 顧客一覧登録 | list-mainte | 業務 | select, execute | StartMenu/マスタ |
| 7 | CustomerSelectionDialog | 顧客選択ダイアログ | selection | 部品 | select | 未分類 |
| 8 | Error404 | エラー(404) | エラー画面 | 共通 | - | 未分類 |
| 9 | Login | ログイン | ログイン | 共通 | init, check | 未分類 |
| 10 | OrderDetailListMainte | 受注明細一覧 | mainte | 業務 | select, update | 未分類 |
| 11 | OrderList | 受注一覧 | list | 業務 | select, printH, printHM | StartMenu/受注管理 |
| 12 | OrderListPrint | - | 帳票（画面なし） | 業務 | - | 未分類 |
| 13 | OrderUpload | 受注データアップロード | upload | 業務 | execute, check | StartMenu/受注管理 |
| 14 | OrderUploadErrorList | 取込エラー一覧 | list | 業務 | select | StartMenu/受注管理 |
| 15 | ProductListMainte | 商品一覧登録 | list-mainte | 業務 | select, execute | StartMenu/マスタ |
| 16 | ProductSelectionDialog | 商品選択ダイアログ | selection | 部品 | select | 未分類 |
| 17 | StartMenu | メニュー(一般ユーザ用) | メニュー | 共通 | init, userinfo, term | 未分類 |
| 18 | ThemeListMainte | システム用テーマ設定 | list-mainte | 業務 | select, execute | AdminMenu/システム |
| 19 | ThemePersonalListMainte | 個人用テーマ設定 | list-mainte | 業務 | select, execute | StartMenu/システム |
| 20 | UserDetailMainte | ユーザ詳細 | mainte | 業務 | select, update, delete, insert, init | 未分類 |
| 21 | UserList | ユーザ一覧 | list | 業務 | select, init | AdminMenu/マスタ |

## 2. 帳票

| # | 帳票ID | モード | Excelテンプレート |
| --- | --- | --- | --- |
| 1 | OrderList | printH | OrderListPrint_printH.xlsx |
| 2 | OrderList | printHM | OrderListPrint_printHM.xlsx |
| 3 | OrderListPrint | printH | OrderListPrint_printH.xlsx |
| 4 | OrderListPrint | printHM | OrderListPrint_printHM.xlsx |

## 3. バッチ

| # | 起動画面ID | バッチ本体（Server/BatchLoad） |
| --- | --- | --- |
| 1 | BatchOrderUploadStart | BatchOrderUploadStart.py |
