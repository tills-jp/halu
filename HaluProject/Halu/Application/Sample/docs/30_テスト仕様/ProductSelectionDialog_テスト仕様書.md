# テスト仕様書: 商品選択ダイアログ（ProductSelectionDialog）

| 項目 | 内容 |
|------|------|
| 対象画面 | 商品選択ダイアログ（ProductSelectionDialog） |
| 対象アプリ | Sample |
| 参照設計書 | `docs/20_基本設計/ProductSelectionDialog.md`（v1.0）、`common.md`（v1.0。1.2遷移一覧・2.3.1一致方式・2.4リテラル埋め込み） |
| 生成元定義 | `ProductSelectionDialog_validation.json` / `ProductSelectionDialog_*_tran.json` / `ProductSelectionDialog_*_sql.json` / `ProductSelectionDialog.appspec.js` |
| 関連C番号 | C-044（本画面の新設。受注明細の商品指定を商品マスタからの選択へ変更）、C-019（商品マスタ・商品コードの新設）、C-049（検索条件の一致方式の既定＝common.md 2.3.1新設の契機） |
| 作成日 | 2026-10-05 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | 1.0 |

> **本書は人間レビュー承認済み（2026-08-05・承認記録簿A-022）。実施記録の記入はUAT工程（ブラウザ実走検証連動）で行う。**

## 1. テストID体系と網羅基準

テスト仕様書標準（画面用）に従う（V=入力チェック / O=画面操作 / S=検索・CRUD / T=画面遷移。業務シナリオはアプリ単位の別冊）。

**V分類の対象外（フレームワーク管理項目）**: カレントページ・ページライン数（`required/integerP`定義があるが、画面上の入力欄ではなくページング制御用の内部項目。ただし**required宣言は必須**——スモークテストが値を合成できずNGになるため。設計書3.1備考参照）。

**V分類から削除（生成ツールの誤検知）**: ドラフトのV05／V06（標準単価の書式チェック）は削除した。本画面の`標準単価`は一覧の**表示専用列**（`<td halu-ds-field="標準単価">`）であり入力欄が存在せず、validation.jsonの定義は金額書式（`format: money`）の表示整形のために置いているものであるため、書式チェックのケースが成立しない（顧客選択ダイアログで同種の誤検知（顧客ＩＤ一覧）を削除したのと同じ判断）。

**S分類から削除（同）**: ドラフトのS03（標準単価の検索）は削除した。標準単価は検索条件ではなく一覧の表示列であり、`ProductSelectionDialog_select_sql.json`の検索条件は`検索商品コード`・`検索商品名称`の2つのみ（`setSql_ProductSelectionDialog`が`&&`を置換）。

**前提条件の注記**: 本画面は受注明細一覧（OrderDetailListMainte）の明細行「選択」ボタンからiframeで開くポップアップのため単体で起動できない。各ケースの前提には「OrderDetailListMainteから起動」を明記する。

## 2. テストケース

### 2.1 V: 入力チェック（生成元: validation.json）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-ProductSelectionDialog-V01 | 検索商品コード 上限20桁（境界内） | OrderDetailListMainteから起動 | 検索商品コード に20桁の値を入力しフォーカスアウト | エラーにならない | validation.json header.検索商品コード（nonrequired/free max=20）、DDL `商品.商品コード varchar(20)` | 自動 | OK（検索商品コード20桁→blurでエラーなし） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-V02 | 検索商品コード 上限超過 | OrderDetailListMainteから起動 | 検索商品コード に21桁の値を入力しフォーカスアウト | 桁数エラーが表示される | validation.json header.検索商品コード（max=20） | 自動 | OK（検索商品コード21桁→「桁数の誤り」表示） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-V03 | 検索商品名称 上限100桁（境界内） | OrderDetailListMainteから起動 | 検索商品名称 に100桁の値を入力しフォーカスアウト | エラーにならない | validation.json header.検索商品名称（nonrequired/free max=100）、DDL `商品.商品名称 varchar(100)` | 自動 | OK（検索商品名称100桁→blurでエラーなし） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-V04 | 検索商品名称 上限超過 | OrderDetailListMainteから起動 | 検索商品名称 に101桁の値を入力しフォーカスアウト | 桁数エラーが表示される | validation.json header.検索商品名称（max=100） | 自動 | OK（検索商品名称101桁→「桁数の誤り」表示） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-V05 | 検索条件の任意入力（両方未入力でも検索できる） | OrderDetailListMainteから起動 | 検索商品コード・検索商品名称をいずれも未入力のまま「検索」（F5）を実行する | 必須エラーにならず、全件（削除フラグ='0'）が1ページ目から表示される（空値の条件は句を生成しない） | validation.json header（両項目とも`nonrequired`）、common.md 2.3.1「値が空の条件は句を生成しない」、設計書1章REQ-002「任意入力」 | 自動 | OK（検索商品コード・検索商品名称とも空欄で#検索Dialog→必須エラーにならず全39件が1ページ目から表示） | 2026-09-23 | AI（ブラウザ実走） |

### 2.2 O: 画面操作（生成元: appspec.js＋設計書4章）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-ProductSelectionDialog-O01 | #閉じるDialog クリック（ESC同等） | OrderDetailListMainteから起動 | #閉じるDialog をクリックする（ESC同等） | 選択結果を返さずにダイアログが閉じ、呼び出し元（OrderDetailListMainte）へ戻る。**呼び出し元の入力中データは保持される**（iframe分離方式のため親画面は再ロードされない） | appspec navButtonEvent(#閉じるDialog=on閉じるDialog)、設計書4章「閉じる」・6章、Halu開発ガイド『選択ダイアログ』（iframe分離） | 自動 | OK（#閉じるDialog→ラッパー・iframeがDOMから除去、明細1・2行目の値は起動前のまま） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O02 | #選択Dialog クリック（F1同等・行選択済み） | OrderDetailListMainteから起動、一覧の行を1件クリックして選択済み | #選択Dialog をクリックする（F1同等） | 選択行の**商品ＩＤ・商品名称・受注単価**が呼び出し元の当該明細行へ転記され、ダイアログが閉じる | appspec navButtonEvent(#選択Dialog=on選択Dialog)、設計書1章REQ-004・4章「選択」・5章「返却値の項目名」 | 自動 | OK（ST002行を選択→#選択Dialog→ラッパー・iframe除去、受注明細1行目が「油性ボールペン 赤 (10本入)」・受注単価800・受注金額4,000（数量5）に転記、合計金額18,400へ再計算。親はフルページ再ロードされず（title「受注明細一覧」のまま）） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O03 | #選択Dialog クリック（行未選択・ガード） | OrderDetailListMainteから起動、一覧の行を選択していない状態 | #選択Dialog をクリックする | フレームワーク共通の行選択ガード（`check行選択`）により警告ダイアログ（MSG-006「行が選択されていません。選択して下さい。」title: 選択エラー）が表示され、呼び出し元への値返却もダイアログのクローズも発生しない（設計書REQ-004（A-033）で追記。CustomerSelectionDialog O02bと同じ既定） | 設計書1章REQ-004、`DataSelectionDialog*Mixin`の`check行選択`（顧客選択ダイアログのTC-O02bと同じ既定） | 自動 | OK（行未選択で#選択Dialog→iframe内`#alertDialog` title「選択エラー」「行が選択されていません。選択して下さい。」が表示され、値返却・クローズは発生しない（共通`check行選択`）。仕様書の期待結果「エラーダイアログも出ない」は実装と不一致のため「警告ダイアログを表示する」へ是正し、是正後の期待結果に対して実測はOK（期待結果は依頼者判断で是正。A-033）） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O04 | #検索Dialog クリック（F5同等） | OrderDetailListMainteから起動、2ページ目を表示中 | 検索条件を入力し #検索Dialog をクリックする（F5同等） | 検索条件で絞り込んだ結果が**1ページ目から**表示される（ページが先頭に戻る） | appspec navButtonEvent(#検索Dialog=on検索Dialog)、設計書4章「検索」 | 自動 | OK（検索条件STで2ページ目表示中に#検索Dialog→1ページ目（ST001..）から表示） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O05 | #クリアDialog クリック | OrderDetailListMainteから起動、検索条件を入力し検索済み | #クリアDialog をクリックする | 検索条件欄がクリアされる。**一覧はそのまま（再検索はしない）** | appspec navButtonEvent(#クリアDialog=onクリアDialog)、設計書4章「クリア」 | 自動 | OK（#クリアDialog→検索商品コード・検索商品名称が空欄に。一覧は検索結果（ST 25件）のまま変化なし） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O06 | #最初のページDialog クリック（F9同等） | OrderDetailListMainteから起動、2ページ目以降を表示中 | #最初のページDialog をクリックする（F9同等） | 1ページ目が表示される | appspec navButtonEvent(#最初のページDialog=on最初のページDialog)、設計書1章REQ-003・4章 | 自動 | OK（#最初のページDialog→「1/2ページ(39件)」） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O07 | #前のページDialog クリック（F10同等） | OrderDetailListMainteから起動、2ページ目以降を表示中 | #前のページDialog をクリックする（F10同等） | 1つ前のページが表示される（1ページ目では移動しない） | appspec navButtonEvent(#前のページDialog=on前のページDialog)、設計書1章REQ-003・4章 | 自動 | OK（#前のページDialog→1ページ目。1ページ目で前へは移動せず） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O08 | #次のページDialog クリック（F11同等） | OrderDetailListMainteから起動、最終ページ以外を表示中 | #次のページDialog をクリックする（F11同等） | 1つ次のページが表示される（最終ページでは移動しない） | appspec navButtonEvent(#次のページDialog=on次のページDialog)、設計書1章REQ-003・4章 | 自動 | OK（#次のページDialog→2ページ目。最終ページで次へは移動せず（ダイアログなし）） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O09 | #最後のページDialog クリック（F12同等） | OrderDetailListMainteから起動、1ページ目を表示中 | #最後のページDialog をクリックする（F12同等） | 最終ページが表示される | appspec navButtonEvent(#最後のページDialog=on最後のページDialog)、設計書1章REQ-003・4章 | 自動 | OK（#最後のページDialog→「2/2ページ(39件)」） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O10 | #dialogTable td クリック（行選択） | OrderDetailListMainteから起動、一覧に1件以上 | 一覧の行をクリックする | 選択行の背景色が変わり、行の値（商品コード・商品名称・標準単価・商品ＩＤ・受注単価）がセッションストレージへ退避される | appspec navButtonEvent(#dialogTable td=onテーブル行クリックDialog)、appspec `sessionStorageDetailKey.dataname`、設計書4章「一覧の行クリック」 | 自動 | OK（2行目（ST002）のtdをクリック→当該tdに`table-success`、他行なし。sessionStorage: 商品ＩＤ=2・商品コード=ST002・商品名称=油性ボールペン 赤 (10本入)・受注単価=800・クリック行=1） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-O11 | Enter/Tabのフォーカス移動 | OrderDetailListMainteから起動 | 入力項目でEnter/Tabを押下する | 次項目へフォーカス移動する（送信されない） | appspec enterTabPFKey(Enter:true, Tab:true) | 自動 | OK（#検索Dialogにフォーカス→Tabで#クリアDialog、Enterで#次のページDialogへフォーカス移動（送信なし・ダイアログなし・一覧不変）） | 2026-09-23 | AI（ブラウザ実走） |

### 2.3 S: 検索・CRUD（生成元: sql/tran.json＋設計書）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-ProductSelectionDialog-S01 | 検索商品コード の**部分一致**検索 | OrderDetailListMainteから起動、該当・非該当データが存在（例: ST001〜ST008／FD001〜FD004） | 検索商品コード に `ST` を指定して検索する | 商品コードに`ST`を含む商品のみが表示される（**部分一致**。前方一致ではない） | common.md 2.3.1「コード・名称等の自由入力＝部分一致」、`ProductSelectionDialog_model.py setSql_ProductSelectionDialog`（`LIKE '%%値%%'`）、設計書1章REQ-002 | 自動 | OK（検索商品コード=ST→部分一致でST001〜ST008とZZTESTPG01〜25・ZZTESTRE01・ZZTESTS06の計35件、FD系なし。「1/2ページ(35件)」） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-S02 | 検索商品名称 の部分一致検索 | OrderDetailListMainteから起動、該当・非該当データが存在 | 検索商品名称 に商品名称の一部（例: `コピー`）を指定して検索する | 商品名称に当該文字列を含む商品のみが表示される（部分一致） | common.md 2.3.1、`setSql_ProductSelectionDialog`（`LIKE '%%値%%'`）、設計書1章REQ-002 | 自動 | OK（検索商品名称=コピー→2件（コピー用紙 Ａ４／コピー用紙 Ａ３。ドリップコーヒーは含まれない）） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-S03 | 複合条件のAND結合 | OrderDetailListMainteから起動、複数条件に該当するデータが存在 | 検索商品コード・検索商品名称を同時指定して検索する | 両条件を満たす商品のみが表示される | `ProductSelectionDialog_select_sql.json` where句の`&&`置換（条件をAND連結）、`setSql_ProductSelectionDialog` | 自動 | OK（商品コード=ST AND 商品名称=コピー用紙→2件（ST004・ST005）） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-S04 | 検索結果0件 | OrderDetailListMainteから起動 | 該当しない条件（例: 検索商品コード=`ZZZ`）で検索する | 0件として正常表示される（エラーにならない）。トータル件数0・最大ページの表示も破綻しない | 一覧画面の標準動作、`getMaxPageCountOfProductSelection` | 自動 | OK（商品コード=ZZZ→0件・「1/1ページ(0件)」・エラーダイアログなし） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-S05 | 一覧のソート順（select） | OrderDetailListMainteから起動、2件以上 | ダイアログを表示し並び順を確認する | prd.商品コード の昇順で表示される | ProductSelectionDialog_select_sql.json order（id=detail） | 自動 | OK（商品コード昇順（FD001, FD002, FD003, FD004, ST001…）で表示） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-S06 | ページング境界（1ページ25件超で2ページ目が生成される） | OrderDetailListMainteから起動、削除フラグ='0'の商品が26件以上存在 | ダイアログを表示し、最大ページ数・2ページ目の内容を確認する | ページライン数25（detailの`defaultline: "25"`）を基準に最大ページが算出され、26件目以降が2ページ目に表示される | ProductSelectionDialog_dataset.json（detail.defaultline="25"）、設計書1章REQ-003・3.2、`getOffsetLineOfProductSelection`／`getMaxPageCountOfProductSelection` | 自動 | OK（前提データZZTESTPG01〜25（削除フラグ'0'）投入。有効商品39件（デモ12＋ZZTESTRE01・ZZTESTS06＋ZZTESTPG25件）で`#ページ情報Dialog`「1/2ページ(39件)」、1ページ目25件（FD001..ZZTESTPG13）、2ページ目14件（ZZTESTPG14..ZZTESTS06）「2/2ページ(39件)」） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-S07 | 論理削除済み商品が候補に出ないこと | OrderDetailListMainteから起動、削除フラグ='9'の商品が存在 | ダイアログを表示（および検索）する | 削除フラグ='9'の商品は一覧に表示されない（選択候補にならない） | ProductSelectionDialog_select_sql.json where（`prd.削除フラグ = '0'`）、設計書1章REQ-001 | 自動 | OK（全件表示の1・2ページとも「ZZTESTダイアログ削除済み」（削除フラグ'9'）は現れない） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-S08 | 検索条件へのSQL特殊文字入力（インジェクション耐性） | OrderDetailListMainteから起動 | 検索商品名称 に `'` を含む文字列（例: `a'b`）を入力して検索する | SQLエラーにならず、当該文字列を含む商品を部分一致で検索した結果（通常は0件）が正常表示される | `setSql_ProductSelectionDialog`が`commons.sqlescape.escapeSqlLiteral`を通すこと（common.md 2.4、C-030／C-036の既定） | 自動 | OK（商品名称=a'bで検索→0件・エラーなし（SQLエラーにならない）） | 2026-09-23 | AI（ブラウザ実走） |

### 2.4 T: 画面遷移（生成元: appspec.js＋設計書6章）

| ケースID | 観点 | 前提 | 手順 | 期待結果 | 根拠 | 区分 | 結果 | 実施日 | 実施者 |
|---------|------|------|------|---------|------|------|------|--------|--------|
| TC-ProductSelectionDialog-T01 | 呼び出し元からの起動（iframeポップアップ） | 受注明細一覧（OrderDetailListMainte）を表示中 | 明細行の「選択」ボタンをクリックする | 本ダイアログがiframeポップアップで開く（親画面は再ロードされない）。**呼び出し元からの引き渡しデータは無し**（`selectStorageRequestData.dataname`が空配列でも例外にならない） | appspec `selectStorageRequestData`（dialogtype="iframe"・dataname=[]）、設計書5章「呼び出し元からの引き渡しデータは無し」・6章、common.md 1.2 | 自動 | OK（受注番号OR26060201（株式会社みどり商事・明細2行）を#訂正で開き、明細1行目の`button[name='商品選択']`（「選択」）をクリック→`#ProductSelectionDialog`内`iframe[name=haluSelectDialogFrame]`に開く。エラーなし。引き渡しデータ無し（dataname空配列）でも例外なし） | 2026-09-23 | AI（ブラウザ実走） |
| TC-ProductSelectionDialog-T02 | 呼び出し元への値返却（押した明細行への転記） | 本ダイアログを2行目以降の「選択」ボタンから起動し、一覧の行を選択済み | #選択Dialog（F1）をクリックする | **ボタンを押した明細行**（1行目ではない）へ商品ＩＤ・商品名称・受注単価が転記される。受注数量が入力済みなら受注金額・合計金額が再計算される | 設計書6章、OrderDetailListMainte.md 5章（afterfunction=on商品選択後・`arg["clickRow"]`で行を特定）、common.md 1.2 | 自動 | OK（**2行目**の「選択」から開きST001を選択→#選択Dialog→2行目のみ「油性ボールペン 黒 (10本入)」・800・受注金額8,000（数量10）に転記、1行目は不変、合計金額12,000へ再計算） | 2026-09-23 | AI（ブラウザ実走） |

**要件カバレッジ表**

| REQ-ID | 要件（要約） | 検証ケース |
|--------|-------------|-----------|
| REQ-001 | 有効な商品（削除フラグ='0'）を商品コード順に一覧表示する | TC-S05, TC-S07 |
| REQ-002 | 商品コード・商品名称で絞り込める（いずれも部分一致・任意入力） | TC-V05, TC-S01, TC-S02, TC-S03, TC-S04, TC-S08 |
| REQ-003 | 1ページ25件でページ送りできる（最初・前・次・最後） | TC-O06, TC-O07, TC-O08, TC-O09, TC-S06 |
| REQ-004 | 一覧の行を選択して「選択」を押すと、呼び出し元の明細行へ商品ＩＤ・商品名称・標準単価（受注単価として）を引き渡す | TC-O02, TC-O03, TC-O10, TC-T02 |
| REQ-005 | 選択（F1）・検索（F5）・ページ送り（F9〜F12）・閉じる（ESC）をPFキーで操作できる | TC-O01, TC-O02, TC-O04, TC-O06〜O09 |

未対応REQ: なし（全REQをV/O/S/Tでカバー）

**別冊（シナリオテスト仕様書）への申し送り**

- 受注明細一覧での「選択」→商品選択→数量入力→登録（訂正）という一連の業務フローは複数画面に跨るためシナリオテスト仕様書（別冊）で扱う。本仕様書はダイアログ単体の操作・表示・値返却までをカバーする。
- 同じ商品を複数の明細行に指定できる（画面では制御しない。設計書5章）。数量をまとめるべきかは業務判断のため、運用ルールとして別冊で確認することを推奨する。
- 商品マスタの改名・論理削除が過去伝票に影響しないこと（受注明細側のスナップショット保持）は、本ダイアログ単体では検証できないため別冊で扱う。

## 3. 前提ゲート記録（画面単位・機械検証層）

| 層 | 検証内容 | 結果 | 実行日時 |
|----|---------|------|---------|
| 第1層 | 定義ファイルの整合を機械検証 | ERROR 0件 / WARNING 2件（select_sql.jsonのオフセットライン数inputのフック注入1件・select_tran.jsonの最大ページafterフック注入1件。いずれも実害なしの既知パターン） | 2026-09-23 16:22 |
| 第2層 | init／select の API 疎通確認（非破壊の直リクエスト） | init: OK / select: OK（NG 0件） | 2026-09-23 16:24 |
| 環境 | 実施環境: Docker（`docker compose up -d`。app/db Up）、ブラウザ（Chromium）、ログイン ADMIN001（AdminMenu経由）、OrderDetailListMainteから起動。前提データ`ZZTESTDLG9`（削除フラグ'9'・S07用）・`ZZTESTPG01〜25`（削除フラグ'0'・S06用）をSQLで投入（実施後に削除・ベースラインへ復元・シーケンス復元） | Sampleテスト実施計画 U4 | 2026-09-23 |

## 4. 実施サマリと品質判定

| 項目 | 値 |
|------|----|
| ケース総数 / 実施済 / OK / NG / 未実施 | 26 / 26 / 26 / 0 / 0 |
| NG→修正→再テストの履歴 | - |
| 品質判定 | 合格（全26ケースOK・NG 0・REQ全カバー。判定者: AI（ブラウザ実走）。人間の受入確認は別途） |

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
