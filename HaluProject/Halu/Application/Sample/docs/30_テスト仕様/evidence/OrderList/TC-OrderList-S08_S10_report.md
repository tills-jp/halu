# TC-OrderList-O12・O13／S08〜S10 実施エビデンス（代表: 帳票ボタンの起動確認・帳票生成失敗時のエラー表示）

- 実施日時: 2026-09-23 17:46〜17:51（Docker。印刷サーバーはDocker起動のため自動起動。ブラウザ（Chromium）、ADMIN001）
- 観測方法: `$H.MainASGIURL`宛POST（`mode: "printH"`／`"printHM"`）のレスポンスJSONと、続く`/HaluASGI/HaluDownload`宛POSTの応答（200・PDF）をネットワークログで確認。成功時の「プリント処理は正常に終了しました。」はダイアログ表示されない仕様（`message.status:"OK"`時は`Transaction.ajax`が無言でレスポンス編集関数を呼ぶのみ）ため、ダイアログではなくAPIレスポンス本文で確認した。

## O12／S08（受注一覧H＝printH）

- APIレスポンス（要点）:
  ```json
  {"excelinfo":{"template":"OrderListPrint_printH.xlsx","savefile":".../DownLoad/Apps/OrderListPrint/OrderListPrint_printH.xlsx","pdfname":"受注一覧表（Ｈ）"},"message":{"status":"OK","msg":"プリント処理は正常に終了しました。"}}
  ```
- `/HaluASGI/HaluDownload`宛POST: 200応答（ブラウザがダウンロードとして引き取るためネットワークログ上はERR_ABORTED表示になるが、サーバー側のファイル生成で起動を確認）
- サーバー側生成ファイル: `DownLoad/Apps/OrderListPrint/OrderListPrint_printH.pdf`（82,892 bytes・17:48生成）
- 結果: OK（帳票内容の記載検証はスコープ外＝`OrderListPrint_テスト仕様書`側で実施）

## O13／S09（受注一覧HM＝printHM）

- APIレスポンス（要点）: `mode:"printHM"`、`message.status:"OK"`、`pdfname:"受注一覧表（ＨＭ）"`
- `/HaluASGI/HaluDownload`宛POST: 200応答
- サーバー側生成ファイル: `OrderListPrint_printHM.pdf`（584,447 bytes）
- 結果: OK

## S10（C-064・帳票生成失敗時のエラー表示）

- 手順: `HaluProject/Halu/Application/Sample/ExcelTemplate/Apps/OrderListPrint/OrderListPrint_printH.xlsx` を同ディレクトリに`.bak`へ一時退避 → `#受注一覧H`をクリック
- 観測: `#alertDialog` title「サーバエラー」、本文「帳票の作成に失敗しました。サーバーログを確認してください。」（MSG-018）を表示。`/HaluASGI/HaluDownload`宛POSTは発生せず、`#loading`は空に戻り画面ロック解除
- 後始末: 確認後にテンプレートファイルを元の名前へ復元し、`git status`に差分が無いことを確認。復元後にS08を再実施し、`OrderListPrint_printH.pdf`が再度正常生成されることを確認（正常化の確認）
- 結果: OK（C-064／Issue #14 の想定挙動と一致）

- ブラウザコンソール（onlyErrors）: なし
- 期待結果との一致: OK（O12・O13・S08・S09・S10 いずれもOK）
