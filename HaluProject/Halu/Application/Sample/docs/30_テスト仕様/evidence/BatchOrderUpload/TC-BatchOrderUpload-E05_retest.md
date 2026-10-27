# TC-BatchOrderUpload-E05（再） 実施エビデンス（NG候補の是正後再実施）

- 対象ケース: TC-BatchOrderUpload-E05（再）（バッチサーバー未起動時の起動操作・境界）
- 実施日: 2026-09-28 13:15〜13:17
- 実施者: AI（ブラウザ実走）
- 環境: 方式A（通常コンテナを停止し、同じイメージ・bind mount・環境変数でWeb/App/Printの3サーバーだけの一時コンテナ`halu_app_e05`を起動）で再ログイン（ADMIN001）
- 前提: 本ケースはA-036（テスト仕様書E05の期待結果を実測＝起動処理は成功を返すがバッチ管理レコードは作成されないサイレント失敗へ是正。フレームワーク側の改善はIssue #92で管理）を受けての再実施。実装側の変更はなし（初回`TC-BatchOrderUpload-E02_E05_NG.md`で観測した挙動を、是正後の期待結果と突き合わせて再判定した）

## 手順・観測

1. `docker compose stop app`（通常コンテナ4サーバーとも停止）
2. Web/App/Printのみの一時コンテナを起動し、`ss`で80・18800・18810がLISTEN、**18820なし**を確認
3. ブラウザで再ログイン→OrderUploadへ`order_upload_u10_e05.csv`（TS26092831 1明細）を投入→`#実行`→「は い」→checkエラー0→execute応答`status:"OK"`・msg「バッチ処理を起動しました。」、`#serverDialog`に成功表示（13:16:00）

### 約50秒後の観測

- バッチ管理: 9件・最大ID25のまま（新規レコードは作成されない）
- 受注ＣＳＶにTS26092831/1が残存（未処理）
- 受注ヘッダにTS26092831は未登録
- 起動プロセス残存なし（ハングなし）
- 起動結果ファイルは13:16:00に`"OK"`で記録
- `controller.log`のBatchExecuteは正常（パラメータ ユーザＩＤ:1・ユーザ名称:admin）
- `batchstartup.log`は正常起動のDEBUG 11行、`batchstartupcontroller.log`に「responsedict : OK」
- Haluの全ログにERROR増分なし
- コンテナ標準出力（docker logs）にのみ`Connect error … ECONNREFUSED`×5（msgpack-rpcの再接続5回試行）

## 復旧

```bash
docker rm -f halu_app_e05
docker compose start app
```
4ポートLISTENを確認。受注ＣＳＶ（TS26092831/1）を削除しベースライン（受注ヘッダ13／明細26／受注ＣＳＶ0）に復元。git差分なし。

## 判定

OK。A-036是正後の期待結果（応答はstatus OK・「バッチ処理を起動しました。」となり成功表示されるが、バッチ管理レコードは作成されず受注ＣＳＶは未処理のまま残る。Haluのサーバーログに ERROR は記録されず、コンテナの標準出力にtornadoの`Connect error … ECONNREFUSED`が出るのみ）と実測が一致することを確認した。初回`TC-BatchOrderUpload-E02_E05_NG.md`のE05節で観測した挙動そのものであり、実装は変更していない（判断(a): 実測を現行仕様として確定し仕様書側を是正。改善はフレームワーク Issue #92）。
