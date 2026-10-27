# テスト仕様書: 顧客選択ダイアログ（CustomerSelectionDialog）

| 項目 | 内容 |
|------|------|
| 対象画面 | 顧客選択ダイアログ（CustomerSelectionDialog） |
| 対象アプリ | Sample |
| 参照設計書 | `docs/20_基本設計/CustomerSelectionDialog.md`（v1.0）、`common.md`（v1.0） |
| 生成元定義 | `CustomerSelectionDialog_validation.json` / `CustomerSelectionDialog_*_tran.json` / `CustomerSelectionDialog_*_sql.json` / `CustomerSelectionDialog.appspec.js` |
| 関連C番号 | C-006（halu-ds化。本画面は例外(4)で旧方式を一時温存）、C-007（旧CustomerSelection画面の削除）、C-008（iframe分離方式導入・halu-ds化） |
| 作成日 | 2026-10-05 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | 1.0 |

> **本書は人間レビュー承認済み（2026-07-31・承認記録簿A-012）。実施記録の記入はUAT工程（ブラウザ実走検証連動）で行う。**

## 1. テストID体系と網羅基準

テスト仕様書標準（画面用）に従う（V=入力チェック / O=画面操作 / S=検索・CRUD / T=画面遷移。業務シナリオはアプリ単位の別冊）。

**V分類の対象外**: カレントページ・ページライン数（フレームワーク管理項目）。顧客ＩＤ一覧（validation.jsonにnonrequired/integerP定義があるが、実装上は`<td halu-ds-field="顧客ＩＤ一覧">`の表示専用列であり、入力欄が存在しないため書式チェックが成立しない。ドラフト生成時のV01/V02は本画面に検索用の入力欄が無いことを見落とした生成ツールの誤検知であり削除した）。

**S分類からの除外（対象外）**: ドラフトのS01（顧客ＩＤ一覧の完全一致検索）・S02（複合条件のAND結合）は削除した。本画面には検索条件入力欄（`検索`／`クリア`ボタン）が無く、`CustomerSelectionDialog_select_sql.json`のWHEREは`cst.削除フラグ = '0'`固定でページング（`LIMIT ? OFFSET ?`）のみを持つ（顧客ＩＤ一覧・顧客氏名一覧はSELECTの出力列であり検索条件ではない）。設計書5章に「検索条件入力欄は本画面には無く、常に全件（削除フラグ='0'）をページング表示する」と明記されており、検索ケースとして成立しないため対象外とした。

**前提条件の注記**: 本画面はOrderListからのiframeポップアップのため単体で起動できない。各ケースの前提には「OrderListから起動」を明記する。

## 2. テストケース

### 2.1 V: 入力チェック（生成元: validation.json）

本画面はページング項目（カレントページ・ページライン数、フレームワーク管理項目）と表示専用列（顧客ＩＤ一覧）以外に入力対象項目を持たないため、V分類の該当ケースは無い（対象外の理由は1章参照）。

### 2.2 O: 画面操作（生成元: appspec.js）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-CustomerSelectionDialog-O01 | #閉じるDialog クリック（ESC同等） | OrderListから起動 | #閉じるDialog をクリックする（ESC同等） | 選択結果を返さずダイアログを閉じ、呼び出し元（OrderList）へ戻る。呼び出し元の`検索顧客ＩＤ`・`検索顧客氏名`は変更されない | appspec navButtonEvent(#閉じるDialog=on閉じるDialog)、設計書1章REQ-004・4章 | 自動 | OK（#閉じるDialog→ラッパー・iframe除去、OrderListの検索顧客氏名は起動前の値（「青空印刷株式会社」）のまま不変） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-O02 | #選択Dialog クリック（F1同等・行選択済み） | OrderListから起動、一覧行を1件選択済み | #選択Dialog をクリックする（F1同等） | 選択中行の顧客ＩＤ・顧客氏名を呼び出し元画面（OrderList）の`検索顧客ＩＤ`・`検索顧客氏名`へ返し、ダイアログを閉じる（iframe分離方式のためOrderListはフルページ再ロードされず`on選択画面戻り`で反映） | appspec navButtonEvent(#選択Dialog=on選択Dialog)、設計書1章REQ-002・6章（選択確定時の動作） | 自動 | OK（ID2行を選択→#選択Dialog→ラッパーとiframeがDOMから除去、OrderListの検索顧客氏名=「青空印刷株式会社」に反映（フルページ再ロードなし、title「受注一覧」のまま）） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-O02b | #選択Dialog クリック（未選択状態） | OrderListから起動、一覧行を選択していない状態 | 行を選択せずに #選択Dialog をクリックする | フレームワーク共通`check行選択`によりガードされ、警告ダイアログ（MSG-006「行が選択されていません。選択して下さい。」title: 選択エラー）が表示される。呼び出し元への値返却もダイアログのクローズも発生しない | 設計書1章REQ-003（A-032）、common.md 7章 MSG-006、`Html/js/dataSelectionDialog.model.mixin-1.0.0.js` check行選択 | 自動 | OK（未選択で#選択Dialog→iframe内`#alertDialog` title「選択エラー」「行が選択されていません。選択して下さい。」。親のラッパーは開いたまま、OrderListの検索顧客氏名は不変） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-O03 | #最初のページDialog クリック（F9同等） | OrderListから起動、2ページ目以降を表示中 | #最初のページDialog をクリックする（F9同等） | 1ページ目（顧客ＩＤ昇順の先頭25件）が表示される | appspec navButtonEvent(#最初のページDialog=on最初のページDialog)、設計書4章 | 自動 | OK（2ページ目から#最初のページDialog→「1/2ページ(33件)」） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-O04 | #前のページDialog クリック（F10同等） | OrderListから起動、2ページ目以降を表示中 | #前のページDialog をクリックする（F10同等） | 前のページが表示される | appspec navButtonEvent(#前のページDialog=on前のページDialog)、設計書4章 | 自動 | OK（#前のページDialogで「2/2ページ(33件)」→「1/2ページ(33件)」） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-O05 | #次のページDialog クリック（F11同等） | OrderListから起動、次ページが存在する状態 | #次のページDialog をクリックする（F11同等） | 次のページが表示される | appspec navButtonEvent(#次のページDialog=on次のページDialog)、設計書4章 | 自動 | OK（#次のページDialogで「1/2ページ(33件)」→「2/2ページ(33件)」） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-O06 | #最後のページDialog クリック（F12同等） | OrderListから起動、2ページ以上存在する状態 | #最後のページDialog をクリックする（F12同等） | 最終ページが表示される | appspec navButtonEvent(#最後のページDialog=on最後のページDialog)、設計書4章 | 自動 | OK（#最後のページDialogで「2/2ページ(33件)」へ。最終ページで次へ／先頭で前へはクランプのみでダイアログなし） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-O07 | #dialogTable td クリック | OrderListから起動、画面表示（1件以上） | #dialogTable td をクリックする | クリックした行が選択状態になる（選択候補として`検索顧客ＩＤ`・`検索顧客氏名`にセットされる） | appspec navButtonEvent(#dialogTable td=onテーブル行クリックDialog)、設計書4章 | 自動 | OK（2行目（ID2）のtdをクリック→当該行tdに`table-success`クラス（背景rgb(242,241,255)）、他行なし。sessionStorage 検索顧客ＩＤ=2・検索顧客氏名=青空印刷株式会社・クリック行=1） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-O12 | Enter/Tabのフォーカス移動 | OrderListから起動 | 画面表示中にEnter/Tabを押下する | 次項目へフォーカス移動する（送信されない） | appspec enterTabPFKey(Enter:true, Tab:true) | 自動 | OK（C-076 のボタン削除後に再実施。#閉じるDialogにフォーカス→Tabで#選択Dialog、Enterで#閉じるDialogへ巡回移動（ボタン上のEnterはクリックにならない）。送信なし・ダイアログなし。evidence/CustomerSelectionDialog/TC-CustomerSelectionDialog-O12.md） | 2026-10-05 | AI（ブラウザ実走） |

### 2.3 S: 検索・CRUD（生成元: sql/tran.json＋設計書）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-CustomerSelectionDialog-S01 | ページング境界（1ページ25件超で2ページ目が生成される） | OrderListから起動、削除フラグ='0'の顧客が26件以上存在 | ダイアログを表示し、最大ページ数・2ページ目の内容を確認する | ページライン数25（`defaultline: "25"`）を基準に最大ページが算出され、26件目以降が2ページ目に表示される | CustomerSelectionDialog_dataset.json（header.ページライン数 defaultline="25"）、設計書3.3・sql.json（getMaxPageCountOfCustomerSelection） | 自動 | OK（前提データ`ZZTESTダイアログ01〜25`（削除フラグ'0'）をSQL投入し有効顧客33件で実施。`#ページ情報Dialog`「1/2ページ(33件)」、1ページ目25件（trは常に25行）、2ページ目は8件（ID30〜37）が埋まり残りは空行、「2/2ページ(33件)」） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-S02 | 一覧0件表示（該当データなし） | 削除フラグ='0'の顧客が0件の状態 | ダイアログを表示する | 一覧が0件として正常表示される（エラーにならない） | CustomerSelectionDialog_select_sql.json where（cst.削除フラグ='0'）、一覧画面の標準動作 | 自動 | OK（有効顧客33件を一時的に全件削除フラグ'9'に更新してから#顧客検索→ダイアログは正常に開き明細0件（25行すべて空）、iframe内・親ともエラーダイアログなし、windowエラーなし。閉じる後、記録した33IDのみ'0'へ復元（件数一致）） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-S03 | 一覧のソート順（select） | OrderListから起動、2件以上 | ダイアログを表示し並び順を確認する | cst.顧客ＩＤ の順で表示される | CustomerSelectionDialog_select_sql.json order（id=detail） | 自動 | OK（顧客ＩＤ順（1,2,3,4,5,6,11,12,13,…）で表示） | 2026-09-23 | AI（ブラウザ実走） |
| TC-CustomerSelectionDialog-S04 | 呼び出し元からの受信データ（検索顧客ＩＤ）が一覧フィルタに使用されないこと | OrderListで検索顧客ＩＤを指定した状態から起動 | OrderListで検索顧客ＩＤを指定してから「顧客検索」ボタンでダイアログを開く | ダイアログの一覧は受信した検索顧客ＩＤに関わらず、削除フラグ='0'の全顧客が絞り込まれずに表示される | 設計書5章「呼び出し元から受け取る検索顧客ＩＤは…select_sql.jsonのWHERE句には使用されていない」、CustomerSelectionDialog_select_sql.json | 自動 | OK（ID2選択済みの状態から再度#顧客検索→iframeのsessionStorage リクエストデータのvalue=["2"]（header.検索顧客ＩＤ=2を受領）。一覧は絞り込まれず1ページ目25件が表示（全33件）） | 2026-09-23 | AI（ブラウザ実走） |

### 2.4 T: 画面遷移（生成元: appspec.js＋設計書4章・6章）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-CustomerSelectionDialog-T01 | 前画面からの引き継ぎ受領 | OrderListから起動（前画面から正規遷移） | OrderListで検索顧客ＩＤを指定した状態から「顧客検索」ボタンで本画面へ遷移する | 引き継ぎデータ（検索顧客ＩＤ）が本画面のheaderへ反映される（ただし一覧のWHERE句には使用されない。TC-S04参照） | appspec beforeStorageData（header.検索顧客ＩＤ） | 自動 | OK（ID2選択済みの状態から再度#顧客検索でダイアログを開くと、引き継ぎデータ（検索顧客ＩＤ=2）がheaderへ反映（iframeのsessionStorage リクエストデータで確認）。一覧はS04の通り絞り込まれない） | 2026-09-23 | AI（ブラウザ実走） |

**要件カバレッジ表**

| REQ-ID | 要件（要約） | 検証ケース |
|--------|-------------|-----------|
| REQ-001 | 削除フラグ='0'の顧客を顧客ＩＤ順に一覧表示する（1ページ25件・ページング付き） | TC-S01, TC-S02, TC-S03 |
| REQ-002 | 一覧の行をクリックして1件選択し、「選択」ボタン（F1）押下で呼び出し元へ顧客ＩＤ・顧客氏名を返す | TC-O07, TC-O02 |
| REQ-003 | 行が選択されていない状態で「選択」ボタンを押した場合は何も実行しない（フレームワーク共通`check行選択`によるガード） | TC-O02b |
| REQ-004 | 「閉じる」ボタン（ESC）で、選択結果を返さずに呼び出し元へ戻る | TC-O01 |
| REQ-005 | （欠番。動作確認用ボタンは C-076 で削除） | -（TC-O08〜O11 を削除） |

未対応REQ: なし（全REQをO/S/Tでカバー）

**別冊（シナリオテスト仕様書）への申し送り**

- OrderList「顧客検索」→本ダイアログでの選択→OrderListの受注登録という一連の業務フロー（顧客検索から受注登録完了までの往復確認）は、複数画面に跨るためシナリオテスト仕様書（別冊）で扱う。本仕様書ではダイアログ単体の操作・表示・値返却までをカバーする。

## 3. 前提ゲート記録（画面単位・機械検証層）

| 層 | 検証内容 | 結果 | 実行日時 |
|----|---------|------|---------|
| 第1層 | 定義ファイルの整合を機械検証 | ERROR 0件 / WARNING 3件（select_sql.jsonのオフセットライン数inputのフック注入型1件・select_tran.jsonの最大ページafterフック注入1件・dataset.jsonの検索顧客氏名未参照1件。いずれも実害なしの既知パターン） | 2026-09-23 14:45 |
| 第2層 | init／select の API 疎通確認（非破壊の直リクエスト） | init: OK / select: OK（NG 0件） | 2026-09-23 14:47 |
| 環境 | 実施環境: Docker（`docker compose up -d`。app/db Up）、ブラウザ（Chromium）、ログイン ADMIN001（AdminMenu経由）、OrderListから起動。前提データ`ZZTESTダイアログ01〜25`（削除フラグ'0'）をSQLで投入（実施後に削除・シーケンス復元） | Sampleテスト実施計画 U3 | 2026-09-23 |

## 4. 実施サマリと品質判定

| 項目 | 値 |
|------|----|
| ケース総数 / 実施済 / OK / NG / 未実施 | 14 / 14 / 14 / 0 / 0 |
| NG→修正→再テストの履歴 | - |
| 品質判定 | 合格（全14ケースOK・NG 0・REQ全カバー（REQ-005は欠番）。C-076 で O08〜O11 を削除・O12 を再実施。判定者: AI（ブラウザ実走）。人間の受入確認は別途） |

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
