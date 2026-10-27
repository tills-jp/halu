# 画面仕様: 顧客選択ダイアログ（CustomerSelectionDialog）

| 項目 | 内容 |
|------|------|
| 画面ID | CustomerSelectionDialog |
| 画面名 | 顧客選択ダイアログ |
| 種別 | 選択ダイアログ（selection） |
| 作成日 | 2026-10-05 |
| 作成者 | TILLS |
| 更新日 | - |
| 版数 | 1.0 |

---

## 0. 種別決定の経緯

他画面（本Sampleでは`OrderList`）からポップアップ形式で呼び出され、顧客を1件検索・選択して呼び出し元へ値を返すのみの画面のため、`screen_types.md`の`selection`（`DataSelectionDialog*.mixin`使用）に該当する。表示方式はiframe分離方式（`dialogtype: "iframe"`）を採用しており、Halu開発ガイド『選択ダイアログ』におけるiframe分離方式の正典実装である。

---

## 1. 要件

| 要件ID | 区分 | 要件 | 背景・理由 |
|--------|------|------|-----------|
| REQ-001 | 表示 | 削除フラグ='0'の顧客を顧客ＩＤ順に一覧表示する（1ページ25件・ページング付き） | 呼び出し元（OrderList）で顧客を選ぶための候補一覧を提示するため |
| REQ-002 | 選択 | 一覧の行をクリックして1件選択し、「選択」ボタン（F1）押下で呼び出し元へ顧客ＩＤ・顧客氏名を返す | 選択ダイアログの標準動作 |
| REQ-003 | 選択制御 | 行が選択されていない状態で「選択」ボタンを押した場合は、警告ダイアログ（MSG-006「行が選択されていません。選択して下さい。」）を表示し、呼び出し元への値返却・ダイアログのクローズを行わない（フレームワーク共通`check行選択`によるガード） | 未選択実行の防止 |
| REQ-004 | 閉じる | 「閉じる」ボタン（ESC）で、選択結果を返さずに呼び出し元へ戻る | キャンセル操作 |
| REQ-005 | （欠番） | 旧「動作確認用ボタン（警告／確認／実行／サーバ）」は C-076 で削除（業務機能ではなく、商品選択ダイアログと構成を揃えるため） | - |

---

## 2. 画面モック

```
┌──────────────────────────────────────────────────────┐
│ [ロゴ]              顧客選択ダイアログ                 │
├──────────────────────────────────────────────────────┤
│ [閉じる：Esc] [選択：F1]                                 │
├──────────────────────────────────────────────────────┤
│ 顧客ＩＤ | 顧客氏名                                    │
│ -------- | ------------------------------             │
│    1     | 山田太郎                                    │
│    2     | 鈴木花子                                    │
│   ...    | ...                                         │
├──────────────────────────────────────────────────────┤
│ [最初：F9] [前へ：F10] [ページ情報] [次へ：F11] [最後：F12] │
└──────────────────────────────────────────────────────┘
```

---

## 3. 画面項目

### 3.1 呼び出し元から受け取る検索条件（beforeStorageData）

| # | records id | multiline | 項目名 | 種別 | 型 | 桁数 | 必須 | 初期値 | 備考 |
|---|-----------|:---------:|--------|------|------|------|:----:|--------|------|
| 1 | header | no | 検索顧客ＩＤ | display | number | - | - | | validation.jsonに定義なし（呼び出し元OrderList側にも定義なし）。呼び出し元（OrderList）の`検索顧客ＩＤ`を`beforeStorageData`で受け取るが、本画面のSQL（`genesql`）では検索条件としては未使用（全件表示）。呼び出し元との連携キー用に定義のみされている可能性がある |

### 3.2 一覧（明細）

| # | records id | multiline | 項目名 | 種別 | 型 | 桁数 | 必須 | 初期値 | 備考 |
|---|-----------|:---------:|--------|------|------|------|:----:|--------|------|
| 1 | detail | yes | 顧客ＩＤ一覧 | display | number | 11 | - | | `顧客.顧客ＩＤ`をエイリアス列名で取得 |
| 2 | detail | yes | 顧客氏名一覧 | display | text | - | - | | `顧客.顧客氏名`をエイリアス列名で取得 |
| 3 | detail | yes | 検索顧客ＩＤ | - | number | - | - | | validation.jsonに定義なし。行クリック時に選択候補としてセットされる列（画面には表示しない・`顧客ＩＤ一覧`と同値） |
| 4 | detail | yes | 検索顧客氏名 | - | text | - | - | | 行クリック時に選択候補としてセットされる列（画面には表示しない・`顧客氏名一覧`と同値） |

### 3.3 ページング（header）

| # | records id | multiline | 項目名 | 種別 | 型 | 桁数 | 必須 | 初期値 | 備考 |
|---|-----------|:---------:|--------|------|------|------|:----:|--------|------|
| 1 | header | no | ページライン数 | display | number | 11 | ○ | 25 | 1ページの表示件数（`defaultline: "25"`） |
| 2 | header | no | カレントページ | display | number | 11 | ○ | 1 | |
| 3 | header | no | 最大ページ | display | number | - | - | | サーバー側`getMaxPageCountOfCustomerSelection`で算出 |
| 4 | header | no | トータル件数| display | number | - | - | | 削除フラグ='0'の全顧客件数 |

---

## 4. 操作

| 操作 | キー | 動作 | 遷移先（呼び出し関係） |
|------|------|------|--------|
| 選択 | F1 | 選択中の行の顧客ＩＤ・顧客氏名を呼び出し元画面の`検索顧客ＩＤ`・`検索顧客氏名`へ返し、ダイアログを閉じる。未選択の場合は警告ダイアログ（MSG-006）を表示し、値返却・クローズを行わない | 呼び出し元（OrderList等）へ戻る |
| 閉じる | ESC | 選択結果を返さずダイアログを閉じる | 呼び出し元へ戻る |
| 行クリック | - | クリックした行を選択状態にする（選択候補として`検索顧客ＩＤ`／`検索顧客氏名`にセット） | - |
| 最初/前/次/最後 | F9/F10/F11/F12 | ページング | - |

---

## 5. 特記事項

- 本画面はiframe分離方式の正典実装であり、`index.html`の`<head>`はダイアログ画面専用のフル構成（Bootstrap/jQuery/フレームワークJS一式＋`AppComponents.js`＋`HaluComponents.js`）を持つ。従来方式（同一document挿入）との違いはHalu開発ガイド『選択ダイアログ』参照。
- テーブルセルは`halu-ds-id="detail" halu-ds-field="顧客ＩＤ一覧"`のようにhalu-ds属性で連携している（iframe分離方式のため、呼び出し元画面とのレコードID空間衝突は発生しない）。
- 検索条件入力欄（`検索`/`クリア`ボタン）は本画面には無く、常に全件（削除フラグ='0'）をページング表示する。呼び出し元から受け取る`検索顧客ＩＤ`は`beforeStorageData`で受信されるのみで、`select_sql.json`のWHERE句には使用されていない。

### 過去の残課題「on選択未定義」の現況確認

- ユーザメモリに記録されていた「Sample/CustomerSelectionのon選択未定義」という残課題は、**単独画面型の旧`CustomerSelection`画面（本`CustomerSelectionDialog`とは別画面）**に関するものであり、変更管理台帳C-007（2026-07-24）で当該画面自体が削除されたことにより解消済みである（台帳に「lintの既存ERROR 2件（on選択未定義）はC-006以前からの既知問題で…→C-007で当該画面ごと削除され解消」と明記）。
- 本`CustomerSelectionDialog`のコントローラには、フレームワーク共通ミックスイン`DataSelectionDialogControllerMixin`が`on選択Dialog`／`on閉じるDialog`を提供しており、`navButtonEvent`（`#選択Dialog`のクリック）から正しく紐づいている。lint・スモークテストでの未定義コールバックは現存しない（本セッションではlint再実行はしていないため、最終的な0件確認は別途静的整合チェックでの機械検証を推奨）。

### 実装上の不具合・疑義（報告のみ・修正不可）

- `CustomerSelectionDialog_select_sql.json`／`CustomerSelectionDialog_view.py`／`CustomerSelectionDialog_model.py`内の関数名が、`getMaxPageCountOfCustomerSelection`／`getOffsetLineOfCustomerSelection`のように「CustomerSelection」（Dialogサフィックスなし）のままになっている。変更管理台帳C-007の記述によれば、これは旧`CustomerSelection`画面作成時にコピーした関数名の残骸であり、現在は本`CustomerSelectionDialog`が同名関数を自前の`CustomerSelectionDialog_view.py`／`_model.py`に保持しているため機能上の問題はない（過去には旧画面のサーバーファイルを間借りして動作しており、旧画面削除時に一度500エラーとなったが、Dialog自身のパスを指すよう修正済み）。関数命名の一貫性の観点では`OfCustomerSelectionDialog`への改称が望ましいが、動作に影響はないため本調査では修正しない。

---

## 6. 画面遷移

| 遷移元 | 遷移先 | トリガ | 受け渡し項目 |
|--------|--------|--------|--------------|
| OrderList | CustomerSelectionDialog | 「顧客検索」ボタン（`on顧客検索`）。iframe分離方式（`selectStorageRequestData`に`dialogtype: "iframe"`。`dialogid`=`"CustomerSelectionDialog"`／`dialogstyle`=`"width:700px; position:fixed; inset:0; margin: auto; max-height: 80vh;"`） | header.検索顧客ＩＤ（呼び出し元の`selectStorageRequestData`＝`datasetid: "header"`, `dataname: ["検索顧客ＩＤ"]`。本画面は`beforeStorageData`で受信するのみでSQLの検索条件には使用しない） |
| CustomerSelectionDialog | OrderList | 「選択」ボタン／F1キー（`check行選択`で選択済みを確認→`set選択レスポンスデータOf選択画面`で選択値をレスポンスデータにセット→ダイアログを閉じる。iframe分離方式のため呼び出し元はフルページ再ロードされず、`on選択画面戻り`が結果をデータセットへ反映する） | header.検索顧客ＩＤ・検索顧客氏名（呼び出し元の`selectStorageResponseData`＝`datasetid: "header"`, `dataname: ["検索顧客ＩＤ", "検索顧客氏名"]`。`afterfunction`/`cancelfunction`とも未設定） |
| CustomerSelectionDialog | OrderList | 「閉じる」ボタン／ESCキー | -（選択結果を返さない） |

本Sampleで本ダイアログを呼び出す画面は`OrderList`（受注一覧）のみで、他に呼び出し元は無い。メニュー画面（StartMenu / AdminMenu）からの直接起動も持たない（common.md 1.1に掲載行を持たず、common.md 1.2の「OrderList → CustomerSelectionDialog」のみが呼び出し経路）。

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
