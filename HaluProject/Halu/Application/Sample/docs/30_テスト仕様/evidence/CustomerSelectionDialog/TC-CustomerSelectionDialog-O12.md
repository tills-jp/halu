# TC-CustomerSelectionDialog-O12 実施エビデンス（再実施・Enter/Tabのフォーカス移動）

- 実施日時: 2026-10-05 04:05（OrderListから起動。C-076 で警告／確認／実行／サーバボタンを削除した後の再実施）
- 事前確認: ダイアログ幅700px、ボタン行は #閉じるDialog（白抜き）・#選択Dialog の2つのみ（appspec の `?var=202610051000` が読まれていることを確認）
- #閉じるDialog にフォーカス → Tab押下で activeElement=#選択Dialog
- #選択Dialog 上で Enter押下 → activeElement=#閉じるDialog へ巡回移動（クリックにならず、iframe内に open なダイアログなし、親ラッパーは開いたまま、OrderList の検索顧客氏名は空のまま＝送信なし）
- ブラウザコンソール（onlyErrors）: なし
- 期待結果との一致: OK
