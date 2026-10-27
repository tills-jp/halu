# Halu

Halu は、日本の業務システム向けの Web アプリケーションフレームワークです。画面は JSON 定義と 5 種類の標準画面タイプ（一覧・単票保守・一覧行編集・アップロード・選択ダイアログ）の組み合わせで作ります。
AI コーディングエージェントに実装を任せる開発体制を前提に設計しており、要件定義からテスト仕様書までの標準プロセスで作った成果物の見本として、サンプルアプリ「Sample」とその設計書一式を同梱しています。

## 動作環境・インストール・起動

| 項目 | 内容 |
|---|---|
| OS | Windows 10 以降 ／ AlmaLinux 9（自動インストールの場合） |
| 言語・サーバー | Python 3.11 ＋ Starlette（ASGI） |
| データベース | PostgreSQL 16 |
| フロントエンド | jQuery ＋ Bootstrap 5 |
| 帳票 | openpyxl で Excel を生成し、LibreOffice で PDF へ変換（帳票を使う場合のみ必要） |

### Linux 自動インストール

**前提条件**
- AlmaLinux 9 の環境で実行してください
- sudo が利用できることを確認してください
- 環境に応じてセキュリティ設定を実施してください

**1. 設定ファイル（.env）作成**
```bash
curl -fL https://raw.githubusercontent.com/tills-jp/halu/master/install_scripts/setup_env.sh | bash
```

対話形式で以下の入力を求められます。
- DBユーザ名 / パスワード
- 仮想サーバ ユーザ名 / パスワード
- 外部公開の有無（yes / no）

実行したディレクトリに `.env` が作成されます。パスワードを平文で含むため、権限は自動で `600` に設定されます。

**2. インストール実行**（所要時間：約30分）

`.env` があるディレクトリで実行してください。

```bash
curl -fL https://raw.githubusercontent.com/tills-jp/halu/master/install_scripts/halu_install.sh | bash
```

インストール済みの環境へ再インストールする場合は `--clean` を付けます。**PostgreSQLの全データベースと `HaluProject`・`HaluServer` が消去される**ため、実行時に確認を求められます。

```bash
curl -fL https://raw.githubusercontent.com/tills-jp/halu/master/install_scripts/halu_install.sh | bash -s -- --clean
```

### 手動インストール（Windows / Linux 共通）

詳しい手順は [Halu Wiki 環境構築](https://tills.co.jp/halu_wiki/環境構築) を参照してください。最低限必要なのは次の 4 つです。

1. **Python 3.11 と依存ライブラリ** — `pip install -r requirements.txt`
2. **データベース** — PostgreSQL に `sample` データベースを作り、同梱のバックアップをリストアする

   ```bash
   createdb -U postgres sample
   pg_restore -U postgres -d sample HaluProject/Halu/Application/Sample/バックアップ/sample.backup
   ```

3. **設定ファイル** — `HaluServer/Halu/System/Server/Libraries/halumain/haluconf.py` の DB 接続（ホスト・ポート・ユーザー・パスワード）と LibreOffice の実行パスを環境に合わせて書き換える。同ファイルにはサーバー間の内部通信用ポートも定義されていますが、これは外部へ開けないでください
4. **環境変数 `PYTHONPATH`** — 次の 2 つのディレクトリを絶対パスで設定する

   ```bash
   # Linux
   export PYTHONPATH=/path/to/HaluServer/Halu:/path/to/HaluServer/Halu/System/Server/Libraries
   # Windows: set PYTHONPATH=C:\path\to\HaluServer\Halu;C:\path\to\HaluServer\Halu\System\Server\Libraries
   ```

### 起動

4 つのサーバーを、それぞれ別のターミナルで次の順に起動します。自動インストールした環境では、各ターミナルで先に仮想環境を有効化してください（`source ~/haluv/bin/activate`）。

Linux:

```bash
# 1) Web サーバー
cd HaluServer/Halu
uvicorn halu:app
# 他ホストからアクセスさせる場合: uvicorn halu:app --host 0.0.0.0 --port 8000

# 2) アプリサーバー
cd HaluServer/Halu/System/Server/Libraries/halumain
python appserver.py

# 3) プリントサーバー（同じディレクトリで）
python printserver.py

# 4) バッチサーバー（同じディレクトリで）
python batchserver.py
```

Windows:

```cmd
rem 1) Web サーバー
cd HaluServer\Halu
uvicorn halu:app

rem 2) アプリサーバー
cd HaluServer\Halu\System\Server\Libraries\halumain
python appserver.py

rem 3) プリントサーバー（同じディレクトリで）
python printserver.py

rem 4) バッチサーバー（同じディレクトリで）
python batchserver.py
```

3 と 4 は、帳票とバッチを使わないなら省略できます。

### Sample へのアクセス

起動後、次の URL にアクセスしてください。`<ホスト>` は実行環境のホスト名または IP アドレスです。

```
http://<ホスト>:8000/Application/Sample/Html/Apps/Login/index.html

ログインID：ADMIN001
パスワード：admin
```

上記はローカル開発用の既定値です。この既定パスワードは公知のため、ブラウザが「漏洩したパスワード」の警告を表示することがあります。パスワードを変更すれば表示されなくなります。

## Sample の概要

インストール後、同梱の Sample（受注管理システム（サンプル））にログインすると、次のものが動く状態で確認できます。

- メニュー → 受注一覧（検索・ページング）→ 受注明細の編集
- 受注一覧からの帳票出力（Excel を生成し PDF へ変換）
- 顧客・商品・ユーザーのマスタ保守（一覧の行編集／単票の登録・訂正・削除）
- 受注 CSV のアップロードとバッチ取込、取込エラーの照会、バッチ実行状況の確認

同じ Sample について、標準プロセスで作った文書一式を [`HaluProject/Halu/Application/Sample/docs/`](HaluProject/Halu/Application/Sample/docs/README.md) に収めています。

| フォルダ | 内容 |
|---|---|
| [`10_要件定義/`](HaluProject/Halu/Application/Sample/docs/10_要件定義/要件定義書.md) | 要件定義書（業務要件・非機能要件） |
| [`11_データモデル/`](HaluProject/Halu/Application/Sample/docs/11_データモデル/データモデル設計書.md) | データモデル設計書（ER 図・テーブル定義・業務ルール） |
| [`20_基本設計/`](HaluProject/Halu/Application/Sample/docs/20_基本設計/common.md) | 共通仕様（`common.md`）と画面・帳票・バッチごとの基本設計書 |
| [`30_テスト仕様/`](HaluProject/Halu/Application/Sample/docs/30_テスト仕様/OrderList_テスト仕様書.md) | 画面・帳票・バッチごとのテスト仕様書（実施記録つき）、実施証跡、テストデータ |
| [`60_リバース仕様書/`](HaluProject/Halu/Application/Sample/docs/60_リバース仕様書/Sample_機能一覧.md) | 実装の JSON 定義から機械生成した機能一覧・ＣＲＵＤ表・テーブル定義書 |

## ライセンス

Halu は [MIT License](LICENSE) で公開しています（Copyright (c) 2025-2026 TILLS & Co.）。
同梱しているサードパーティのライブラリ・フォントとそのライセンスは [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を参照してください。

## 問い合わせ先

株式会社TILLS（https://tills.co.jp/） ／ Halu Wiki（https://tills.co.jp/halu_wiki/）
