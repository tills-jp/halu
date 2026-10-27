# TC-BatchOrderUpload-L01〜L05 実施エビデンス（バッチ管理・分割管理の記録／進捗推移／ログ出力）

- 対象ケース: TC-BatchOrderUpload-L01, L02, L03, L04, L05
- 実施日: 2026-09-28
- 実施者: AI（ブラウザ実走）
- 環境: Docker（app／db）、ブラウザ（Chromium）、ログイン ADMIN001

## 環境・方法

Run1（バッチ管理ＩＤ21）のexecute成功メッセージ確認直後にBatchList画面へ遷移し、`#再表示`（F1相当）を2〜3秒間隔で複数回クリックして、分割終了数の推移をブラウザ実走でリアルタイムに観測した。

## L01 バッチ管理テーブルへの開始/終了日時記録

```sql
SELECT バッチ管理ＩＤ, 処理名, ロードパス名, 分割数, 分割終了数, 開始日時, 終了日時
FROM バッチ管理 WHERE バッチ管理ＩＤ IN (21, 22);
```

| バッチ管理ＩＤ | 処理名 | 分割数 | 分割終了数 | 開始日時 | 終了日時 |
|---:|---|---:|---:|---|---|
| 21（Run1） | 受注ヘッダ・受注明細 更新 バッチ処理 | 3 | 3 | 09:42:46.515 | 09:42:53.087 |
| 22（Run2） | 受注ヘッダ・受注明細 更新 バッチ処理 | 3 | 3 | 09:44:15 | 09:44:22 |

- 処理名・ロードパス名で登録され、開始日時は起動時、終了日時は分割終了数=3到達時に更新されていることを確認

## L02 バッチ分割管理テーブルへの分割ごとの記録

```sql
SELECT バッチ分割管理ＩＤ, 開始日時, 終了日時 FROM バッチ分割管理 WHERE バッチ管理ＩＤ = 21 ORDER BY バッチ分割管理ＩＤ;
```

- 3行取得、いずれも開始日時・終了日時が記録されている（各分割の所要は1〜3秒程度）

## L03 BatchListでの進捗確認（要再表示F1・リアルタイム観測）

execute成功メッセージ確認直後にBatchListへ遷移し、`#再表示`を反復クリックして観測した分割終了数の推移:

| 観測時刻 | 分割終了数 | 終了日時 |
|---|---:|---|
| 09:42:46 | 0 | (空) |
| 09:42:49 | 1 | (空) |
| 09:42:55 | 2 | (空) |
| 09:43:22（再表示） | 3 | 09:42:53 |

- 自動更新はされず、`#再表示`クリックのたびに最新値が反映されることを確認（要再表示＝L03の観点どおり）
- 0→1→2→3への推移を実際にリアルタイムで捕捉できた（完了後の状態のみの確認ではない）

## L04 BatchDivisionListでの分割進捗確認

- BatchListでバッチ管理ＩＤ21の行を選択→`#分割画面`（F2相当）クリック→BatchDivisionListへ遷移
- 分割一覧に分割No 1・2・3 それぞれの開始日時・終了日時が表示されていることを確認（L02のSQL結果と一致）

## L05 Logs/batch配下のログ出力

```bash
grep "<ERROR>" HaluServer/Halu/System/Server/Logs/batch/batchclientmodel.log
grep "<ERROR>" HaluServer/Halu/System/Server/Logs/batch/batchclientserver.log
grep "<ERROR>" HaluServer/Halu/System/Server/Logs/batch/batchservermodel.log
grep "<ERROR>" HaluServer/Halu/System/Server/Logs/batch/batchserver.log
```

- 上記いずれも `<ERROR>` の出力は0件（正常系のためエラーなし）
- `batchstartup.log`: `init`／`start`／`filepath`／`args`／`requestdict` の各エントリが記録され、`BatchOrderUploadStart.py`の起動が確認できる
- `batchserver.log`: `call start 09:42:43` → `call end 09:42:56` の記録があり、バッチサーバーが正常に処理を受理・完了していることを確認
- `batchclientserver.log` にも同様の処理ログが記録されている
