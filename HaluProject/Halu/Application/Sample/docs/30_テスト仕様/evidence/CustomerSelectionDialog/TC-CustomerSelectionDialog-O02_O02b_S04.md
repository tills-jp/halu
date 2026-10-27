# TC-CustomerSelectionDialog-O02／O02b／S04／T01 実施エビデンス（代表: 選択確定・未選択ガード・受信データ不使用）

- 実施日時: 2026-09-23 15:11〜15:16（OrderListから起動）
- O02b: 未選択で#選択Dialog → iframe内`#alertDialog` title「選択エラー」「行が選択されていません。選択して下さい。」。親のラッパーは開いたまま、OrderListの検索顧客氏名は不変
- O07（前提操作）: 2行目（ID2）のtdをクリック → 当該行tdに`table-success`クラス（背景rgb(242,241,255)）、他行なし。sessionStorage `Sample.CustomerSelectionDialog.検索顧客ＩＤ=2`・`検索顧客氏名=青空印刷株式会社`・`クリック行=1`
- O02: ID2行を選択 → #選択Dialog → ラッパーとiframeがDOMから除去、OrderListの検索顧客氏名=「青空印刷株式会社」（フルページ再ロードなし、title「受注一覧」のまま）
- S04／T01: その状態で再度#顧客検索 → iframeのsessionStorage `Sample.CustomerSelectionDialog.リクエストデータ`のvalue=["2"]（header.検索顧客ＩＤ=2を受領）。一覧は絞り込まれず1ページ目25件が表示（全33件）
- O01: #閉じるDialog → ラッパー除去、OrderListの検索顧客氏名は「青空印刷株式会社」のまま不変
- 期待結果との一致: OK
