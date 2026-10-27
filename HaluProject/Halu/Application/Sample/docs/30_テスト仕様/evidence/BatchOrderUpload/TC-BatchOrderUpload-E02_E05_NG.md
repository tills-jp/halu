# TC-BatchOrderUpload-E02・E05 実施エビデンス（NG 2件の再現条件・観測・切り分け）

- 対象ケース: TC-BatchOrderUpload-E02（一部分割のみ失敗時の再処理・BatchDivisionList F2）, E05（バッチサーバー未起動時の起動操作）
- 実施日: 2026-09-28
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001（E05は方式Aの一時コンテナで再ログイン）

## E02 NG（フレームワークバグ・Issue #91: 再処理がHTTP 500）

### 前提

TC-BatchOrderUpload-E01（本書エビデンス`TC-BatchOrderUpload-E01_E03_E04_E06.md`）で作成した失敗バッチ（バッチ管理ID25・分割終了数1・分割2/3空）。

### 原因の是正（再処理前）

```sql
UPDATE 受注ＣＳＶ SET 顧客ＩＤ = 5 WHERE 受注番号 = 'TS26092823' AND 明細番号 = 1;
```
（`UPDATE 1`。本来の運用「データ・マスタを直して再処理」を想定）

### 操作・観測

1. AdminMenu→BatchList→`#再表示`→ID25の行を選択→`#分割画面`（F2）
2. BatchDivisionList: 3行表示、分割No1のみ開始/終了日時あり・分割No2/3は空（失敗分割の特定。設計書7章「失敗した分割は終了日時が空のまま残る」を確認）
3. 分割No2の行を選択（table-successハイライト、sessionStorage 明細バッチ分割管理ＩＤ=2）→`#再処理`→`#executeDialog`「再処理　実行確認」「再処理を実行します。よろしいですか。」→「は い」
4. **応答**: Halumainが**HTTP 500**、`#alertDialog`「通信エラー」「サーバとの接続に失敗しました。入力データが更新されていません。閉じるボタンを押し、そのままの画面でしばらくお待ちください。そして実行ボタンを押して下さい。」
5. 再処理は起動されず。分割2の日時・受注データは不変

### ログ・原因切り分け

- `controller.log`に`BatchExecute call exception message : can only concatenate str (not "int") to str`
- `BatchRerun.py`の起動ログなし（起動前に例外）
- 原因: `HaluServer/Halu/System/Server/Libraries/batchstartup/batchexecute.py`の`BatchExecute.call()`が

```python
for key, value in param_info["input"]["record"].items():
    arg_str = arg_str + key + ":" + value["value"][0] + " "
```

のようにbatchParamの各値を文字列として連結している。BatchDivisionListのrestartでは`再処理バッチ管理ＩＤ`・`再処理バッチ分割管理ＩＤ`が画面のデータセット（数値列）から`[25]`・`[2]`の**int**で渡るため、`TypeError: can only concatenate str (not "int") to str`が発生する。例外がmsgpack-RPC経由でhalu.pyのhalumainへ伝播し、`RPCError: 'TypeError' object has no attribute 'to_msgpack'`として500になる。OrderUploadのbatchStartup（受注取込）は`ユーザＩＤ`・`ユーザ名称`とも文字列のため影響がなく、これまで顕在化していなかった。

### 対応

GitHub Issue #91（バグ・halu・v2.1.0）を起票済み（起票のみ・修正は別途）。対処案: ①`batchexecute.py`で`str(value["value"][0])`に統一 ②`BatchExecute.call()`の例外時に`status:"ERROR"`を応答へ設定し500にしない ③回帰はSample BatchDivisionList S02／BatchOrderUpload E02の再実施、OrderUploadの起動（P01）、pytest。

### 判定

NG。フレームワークバグ（Issue #91）。修正後にE02／S02（BatchDivisionList側）を再実施する。なお設計書`BatchDivisionList.md`特記事項はフレームワークが設定する「バッチ処理を起動しました。」が表示されると記載しており、Issue #91修正後の再実施ではテスト仕様書E02／S02の期待文言（現状「再処理を起動しました。」）もこれに合わせる是正が必要（申し送り）。

---

## E05 NG候補（要判断: サイレント失敗）

### 前提・停止方法の調査結論

コンテナ内の4サーバー（Web:80・App:18800・Print:18810・Batch:18820）は`docker/startup_container.sh`（ENTRYPOINT）が最後にバッチサーバーをフォアグラウンドで起動しコンテナの生存プロセスにしているため、`kill`でバッチサーバーだけを止めるとコンテナごと停止する。`kill -STOP`はポートがLISTENのまま接続が受理されるため「未起動」と同じ状況にならない。よって**方式A**（通常コンテナを停止し、同じイメージ・bind mount・環境変数でWeb/App/Printの3サーバーだけの一時コンテナを起動）を用いた。ファイル編集は不要。

### 操作

1. `docker compose stop app`（通常コンテナ4サーバーとも停止）
2. `docker compose run -d --service-ports --no-deps --name halu_app_e05 --entrypoint bash app -c '...'`でWeb/App/Printのみ起動
3. `docker exec halu_app_e05 ss -ltnp` → 80・18800・18810がLISTEN、**18820なし**を確認
4. ブラウザで再ログイン→OrderUploadへ`order_upload_u10_e05.csv`（TS26092831 1明細）を投入→`#実行`→「は い」→checkエラー0→execute応答`status:"OK"`・msg「バッチ処理を起動しました。」、`#serverDialog`に成功表示

### 観測（約30秒後）

- バッチ管理: 9件・最大ID25のまま（**新規レコードは作成されない**）
- `SELECT last_value FROM "バッチ管理_バッチ管理ＩＤ_seq"` → 25のまま（採番もされない）
- 受注ＣＳＶにTS26092831/1が残存（未処理）
- 受注ヘッダにTS26092831は未登録
- 起動プロセス残存なし（ハングなし）
- 起動結果ファイル`BatchLoadOut/BatchOrderUploadStart_start_result.txt`は11:46:37に`"OK"`で上書き
- `batchstartup.log`は正常起動のDEBUGのみ、`batchstartupcontroller.log`「ビューが処理したresponsedict : OK」
- `controller.log`のBatchExecuteは正常
- Haluの全ログにERRORなし
- コンテナ標準出力（`docker logs halu_app_e05`）にのみ`WARNING:tornado.general:Connect error on fd 12: ECONNREFUSED`×5（msgpack-rpcの再接続5回試行）

### 原因（実装読み・0.3節ソース調査結果）

`BatchClient.call`は`client.notify()`の後に常に`"OK"`を返す実装。msgpack-rpc 0.4.1のnotifyは接続失敗時に再接続を5回試み（`reconnect_limit=5`）、上限で`on_connect_failed`→例外を出さずにループ停止して戻る。したがって画面は「バッチ処理を起動しました。」、バッチ管理は作られず、Haluのログに痕跡が残らない**サイレント失敗**となる。

### 復旧

```bash
docker rm -f halu_app_e05
docker compose start app
```
20秒後、`docker compose ps`と`ss -ltnp`で4ポートLISTENを確認。再ログイン可。ログクリアは行っていない（U10の証跡保存のため）。

### 判定（依頼者判断待ち）

仕様書E05の想定「接続エラーとなる」とは異なり、**起動失敗がどこにも記録されない**（画面は成功表示・バッチ未起動・Haluログにエラーなし）。判断肢:

- (a) 事実を仕様として記録: 仕様書E05の期待結果を「起動処理はOKを返しバッチ管理は作成されない（サーバー停止はBatchListに行が増えないことで検知）」へ是正し、設計書5章にサーバー停止時の挙動を追記。あわせてフレームワーク改善Issue（`BatchClient.call`が notifyの接続失敗を検知できず常に"OK"を返す）を起票する
- (b) フレームワーク改善Issueを起票し、修正後に再テストする（それまでNGのまま）

依頼者判断待ちのためNG候補として記録し、Issue化・仕様書是正のいずれも本セッションでは実施しない（マージ・台帳編集も対象外）。

### 対応

A-036で仕様書の期待結果を現行仕様へ是正（改善はIssue #92）。再実施は`TC-BatchOrderUpload-E05_retest.md`にOKとして記録済み（2026-09-28 13:16）。
