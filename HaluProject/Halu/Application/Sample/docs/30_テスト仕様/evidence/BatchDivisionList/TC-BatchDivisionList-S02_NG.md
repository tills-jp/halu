# TC-BatchDivisionList-S02 実施エビデンス（NG・フレームワークバグ Issue #91）

- 対象ケース: TC-BatchDivisionList-S02（restartの正常実行・分割単位の再処理）
- 実施日: 2026-09-28
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## 前提

`BatchOrderUpload_テスト仕様書.md`のE01（要実機確認の解消）で作成した失敗バッチ（バッチ管理ID25・分割終了数1・分割2/3空）を対象に、E02と同一シナリオとして実施した。

## 原因の是正（再処理前）

```sql
UPDATE 受注ＣＳＶ SET 顧客ＩＤ = 5 WHERE 受注番号 = 'TS26092823' AND 明細番号 = 1;
```

## 操作・観測

1. AdminMenu→BatchList→`#再表示`→ID25の行を選択→`#分割画面`（F2）
2. BatchDivisionList: 3行表示、分割No1のみ開始/終了日時あり・分割No2/3は空
3. 分割No2の行を選択（table-successハイライト、sessionStorage 明細バッチ分割管理ＩＤ=2）→`#再処理`→`#executeDialog`「再処理　実行確認」「再処理を実行します。よろしいですか。」→「は い」
4. **応答**: HalumainがHTTP 500、`#alertDialog`「通信エラー」「サーバとの接続に失敗しました。入力データが更新されていません。閉じるボタンを押し、そのままの画面でしばらくお待ちください。そして実行ボタンを押して下さい。」
5. 再処理は起動されず。分割2の日時・受注データは不変

## 原因（E02と同一）

`HaluServer/Halu/System/Server/Libraries/batchstartup/batchexecute.py`の`BatchExecute.call()`がbatchParamの各値を`key + ":" + value["value"][0] + " "`で文字列連結しており、BatchDivisionListのrestartでは`再処理バッチ管理ＩＤ`・`再処理バッチ分割管理ＩＤ`が画面データセットの数値列から`int`で渡るため`TypeError: can only concatenate str (not "int") to str`となる。例外がmsgpack-RPC経由でhalu.pyのhalumainへ伝播し500になる（`controller.log`に`BatchExecute call exception message : can only concatenate str (not "int") to str`、`BatchRerun.py`の起動ログなし）。詳細な切り分けは`BatchOrderUpload_テスト仕様書.md`エビデンス`TC-BatchOrderUpload-E02_E05_NG.md`のE02節を参照（同一操作・同一原因）。

対応: GitHub Issue #91（バグ・halu・v2.1.0）を起票済み（起票のみ・修正は別途）。

## 設計書との文言差（申し送り）

テスト仕様書S02の期待結果は「再処理を起動しました。」だが、`BatchDivisionList_restart_sql.json`の`message.msg`は「再処理を起動しました。」であるものの、`maincontroller`のbatchStartup分岐は`BatchExecute.call`の戻り（msg='バッチ処理を起動しました。'で上書き）をそのまま応答する実装のため、実際に表示されるのは「バッチ処理を起動しました。」になると読める（OrderUploadのP01と同じ仕組み）。設計書`BatchDivisionList.md`特記事項は「フレームワークが設定する『バッチ処理を起動しました。』が表示される」とすでに記載されており、テスト仕様書S02・E02（BatchOrderUpload側）の期待文言だけが実装・設計書と食い違っている。Issue #91修正後の再実施では、再処理の起動確認とあわせてこの期待文言の是正も行う必要がある。

## 判定

NG。フレームワークバグ（Issue #91）。修正後に再実施する（依頼者判断・台帳記録は本作業の対象外）。
