#!/bin/bash

# エラーになったらその場で止める
set -e

############################################################
# 引数解析
############################################################
# --clean : インストール済み環境を検出しても、全データを消去して
#           再インストールする（対話確認あり）。
CLEAN_MODE="no"
for ARG in "$@"; do
    case "$ARG" in
        --clean)
            CLEAN_MODE="yes"
            ;;
        *)
            echo "不明な引数です: $ARG"
            echo "使用方法: $0 [--clean]"
            exit 1
            ;;
    esac
done

############################################################
# 前提条件チェック(1) OS判定
############################################################
# このスクリプトは新規インストール直後のAlmaLinux専用
if [ ! -r /etc/os-release ]; then
    echo "/etc/os-release が見つからないため、OSを判定できません。"
    echo "このスクリプトは新規インストール直後の AlmaLinux 専用です。"
    exit 1
fi

OS_ID="$(. /etc/os-release && echo "$ID")"
if [ "$OS_ID" != "almalinux" ]; then
    echo "このスクリプトは新規インストール直後の AlmaLinux 専用です。"
    echo "（検出されたOS: ${OS_ID:-不明}）"
    exit 1
fi

############################################################
# .envファイル読み込み
############################################################
# .envファイル指定
ENV_FILE="./.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "必須の環境ファイルが見つかりません: $ENV_FILE"
    echo "先にsetup_env.shを実行してください。"
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

# 配布ソースの取得元。
# 通常は本番リポジトリのmasterから取得する。テスト時は.envで別の取得元を指定する。
#   SOURCE_ZIP_FILE : ローカルに用意したzipを使う（Privateリポジトリから手元に落とした場合など）
#   SOURCE_ZIP_URL  : 上記が未指定のときにダウンロードするURL
# 旧い.envにこれらのキーが無くても動くよう、未設定時は既定値を使う。
SOURCE_ZIP_URL="${SOURCE_ZIP_URL:-https://github.com/tills-jp/halu/archive/refs/heads/master.zip}"
SOURCE_ZIP_FILE="${SOURCE_ZIP_FILE:-}"

if [ -n "$SOURCE_ZIP_FILE" ] && [ ! -f "$SOURCE_ZIP_FILE" ]; then
    echo "SOURCE_ZIP_FILE に指定されたファイルが見つかりません: $SOURCE_ZIP_FILE"
    exit 1
fi

############################################################
# .env 必須変数の検証
############################################################
# 必須変数の非空チェック
REQUIRED_VARS=(
    DB_USERNAME DB_PASSWORD SRV_USERNAME SRV_PASSWORD
    DB_PORT DB_NAME DB_BACKUP_USERNAME DB_BACKUP_PASSWORD
    BASH_PROFILE BASHRC CONF_FILE
    POSTGRE_SERVICE_FILE POSTGRE_CONF POSTGRE_DATA POSTGRE_HOME
    VENV_DIR VENV_BASH_FILE VENV_BASHRC HALU_CONF
)
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo "必須の環境変数が未設定です: $VAR"
        echo ".envの内容を確認するか、setup_env.shを再実行してください。"
        exit 1
    fi
done

# ユーザ名の文字種チェック（root権限のrm -rf・sudo -u・SQL等に展開されるため厳格に）
for VAR in DB_USERNAME SRV_USERNAME DB_BACKUP_USERNAME; do
    if ! [[ "${!VAR}" =~ ^[a-z_][a-z0-9_-]*$ ]]; then
        echo "$VAR に使用できない文字が含まれています: ${!VAR}"
        echo "（先頭は英小文字または _ 、2文字目以降は英小文字・数字・_・- のみ使用できます）"
        exit 1
    fi
    if [ "${!VAR}" = "root" ]; then
        echo "$VAR に root は指定できません。"
        exit 1
    fi
done

# DBユーザと仮想サーバユーザは別名にする（ホームディレクトリの用途が競合するため）
if [ "$DB_USERNAME" = "$SRV_USERNAME" ]; then
    echo "DB_USERNAME と SRV_USERNAME には別のユーザ名を指定してください。"
    exit 1
fi

# パスワードの文字種チェック（chpasswd・sed・設定ファイルへの埋め込みを壊す文字を拒否）
for VAR in DB_PASSWORD SRV_PASSWORD DB_BACKUP_PASSWORD; do
    if ! [[ "${!VAR}" =~ ^[A-Za-z0-9_.@%^+=,~-]+$ ]]; then
        echo "$VAR に使用できない文字が含まれています。"
        echo "（英数字と _ . @ % ^ + = , ~ - のみ使用できます）"
        exit 1
    fi
done

# ポート番号チェック
if ! [[ "$DB_PORT" =~ ^[0-9]+$ ]] || [ "$DB_PORT" -lt 1 ] || [ "$DB_PORT" -gt 65535 ]; then
    echo "DB_PORT が不正です: $DB_PORT"
    exit 1
fi

# DB名の文字種チェック
if ! [[ "$DB_NAME" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
    echo "DB_NAME に使用できない文字が含まれています: $DB_NAME"
    exit 1
fi

############################################################
# 前提条件チェック(2) クリーン環境判定
############################################################
# インストール済み環境を検出した場合、既定では中止する。
# --clean 指定時のみ、対話確認のうえ全消去して再インストールする。
EXISTING_ITEMS=()
if pgrep -x postgres >/dev/null 2>&1; then
    EXISTING_ITEMS+=("PostgreSQLプロセスが稼働中")
fi
if [ -d /usr/local/postgresql-16.9 ]; then
    EXISTING_ITEMS+=("PostgreSQLインストール先: /usr/local/postgresql-16.9")
fi
if [ -f "$POSTGRE_SERVICE_FILE" ]; then
    EXISTING_ITEMS+=("PostgreSQLサービス定義: $POSTGRE_SERVICE_FILE")
fi
# 旧バージョンのキットは /usr/lib/systemd/system 配下にユニットを置いていた。
# 残っているとsystemdが旧ユニットを読み、起動に失敗する（実機で手動削除が必要になった事例あり）。
LEGACY_SERVICE_FILE="/usr/lib/systemd/system/postgresql.service"
if [ "$POSTGRE_SERVICE_FILE" != "$LEGACY_SERVICE_FILE" ] && [ -f "$LEGACY_SERVICE_FILE" ]; then
    EXISTING_ITEMS+=("PostgreSQLサービス定義(旧キットの残骸): $LEGACY_SERVICE_FILE")
fi
# OSユーザが既にいると adduser がスキップされ、既存ホームの内容がそのまま使われる
if id "$DB_USERNAME" >/dev/null 2>&1; then
    EXISTING_ITEMS+=("OSユーザ: $DB_USERNAME")
fi
if id "$SRV_USERNAME" >/dev/null 2>&1; then
    EXISTING_ITEMS+=("OSユーザ: $SRV_USERNAME")
fi
# /home/$SRV_USERNAME はAlmaLinux既定で 0700（/etc/login.defs の HOME_MODE）のため、
# 本スクリプトの実行者（sudoが使える一般ユーザー）からは中を見られない。
# sudo を通さないと、インストール済みでも常に「無い」と判定されてしまう。
if sudo test -d "/home/$SRV_USERNAME/HaluServer"; then
    EXISTING_ITEMS+=("Halu本体: /home/$SRV_USERNAME/HaluServer")
fi
if sudo test -d "/home/$SRV_USERNAME/HaluProject"; then
    EXISTING_ITEMS+=("Haluアプリケーション: /home/$SRV_USERNAME/HaluProject")
fi
if sudo test -d "$VENV_DIR"; then
    EXISTING_ITEMS+=("Python仮想環境: $VENV_DIR")
fi

if [ ${#EXISTING_ITEMS[@]} -gt 0 ]; then
    echo "インストール済みの環境を検出しました:"
    for ITEM in "${EXISTING_ITEMS[@]}"; do
        echo "  - $ITEM"
    done

    if [ "$CLEAN_MODE" != "yes" ]; then
        echo ""
        echo "このスクリプトは新規OS（AlmaLinux）へのインストール専用のため、中止します。"
        echo "全データを消去して再インストールする場合は --clean を付けて実行してください。"
        echo "【警告】--clean はPostgreSQLの全データベースと、"
        echo "        /home/$SRV_USERNAME 配下の HaluProject・HaluServer を消去します。"
        exit 1
    fi

    echo ""
    echo "【警告】--clean が指定されています。続行すると以下を消去して再インストールします。"
    echo "  - PostgreSQLの全データベース（$POSTGRE_DATA）"
    echo "  - /home/$SRV_USERNAME/HaluProject（自作アプリを含む）・HaluServer"
    echo "必要なデータは事前に pg_dump 等でバックアップしてください。"
    read -p "本当に続行しますか？ 続行する場合は yes と入力してください: " CONFIRM < /dev/tty
    if [ "$CONFIRM" != "yes" ]; then
        echo "中止しました。"
        exit 1
    fi

    # 稼働中のPostgreSQLを停止してからデータ消去・再インストールに進む
    sudo systemctl stop postgresql 2>/dev/null || true

    # 旧キットが置いたユニットが残っていると、本キットが作るユニットより優先されるため削除する
    if [ "$POSTGRE_SERVICE_FILE" != "$LEGACY_SERVICE_FILE" ] && [ -f "$LEGACY_SERVICE_FILE" ]; then
        echo "旧キットのサービス定義を削除します: $LEGACY_SERVICE_FILE"
        sudo rm -f "$LEGACY_SERVICE_FILE"
        sudo systemctl daemon-reload
    fi
fi

############################################################
# ファイアーウォールの有効化
############################################################
echo "firewalldのインストール状況の確認…"

if ! rpm -q firewalld >/dev/null 2>&1; then
    echo "firewalldは未インストールです。インストールを開始します。"
    sudo dnf install -y firewalld
else
    echo "firewalld は既にインストールされています。"
fi

echo "firewalld を有効化・起動します..."
sudo systemctl enable --now firewalld

echo "firewalld の状態:"
sudo firewall-cmd --state


############################################################
# ファイアーウォールで各種ポート・サービスを開放する
############################################################
# ポートを開放
for PORT in $FIREWALL_PORTS; do
    echo "ポート $PORT を開放中..."
    sudo firewall-cmd --permanent --zone=public --add-port="$PORT"
done

# サービスを開放
for SERVICE in $FIREWALL_SERVICES; do
    echo "サービス $SERVICE を開放中..."
    sudo firewall-cmd --permanent --zone=public --add-service="$SERVICE"
done

# ファイアーウォールの設定をリロード
sudo firewall-cmd --reload

# 確認
echo "ポート開放確認:"
for PORT in $FIREWALL_PORTS; do
    if sudo firewall-cmd --zone=public --list-ports | grep -q "$PORT"; then
        echo "$PORT 開放済み"
    else
        echo "$PORT 開放失敗"
    fi
done

echo "サービス開放確認:"
for SERVICE in $FIREWALL_SERVICES; do
    if sudo firewall-cmd --zone=public --list-services | grep -q "$SERVICE"; then
        echo "$SERVICE サービス許可済み"
    else
        echo "$SERVICE サービス許可失敗"
    fi
done

############################################################
# python3の確認と必要なパッケージインストール
############################################################
echo "python3のバージョン確認…"
python3 --version || { echo "python3がありません"; exit 1; }

echo "python用のコンパイラのインストール"
sudo dnf -y install wget
sudo dnf -y install tar
sudo dnf -y install make
sudo dnf -y install gcc
sudo dnf -y install readline-devel
sudo dnf -y install zlib-devel
sudo dnf -y install openssl-devel
sudo dnf -y install xz-devel
sudo dnf -y install ncurses-devel
sudo dnf -y install tk-devel
sudo dnf -y install kernel-devel kernel-headers bzip2-devel libdb-devel libffi-devel
sudo dnf -y install python3-devel

echo "Python 3.11 をインストールします"
PYTHON_VERSION=3.11.13
# ダウンロード物の改ざん・破損検知用SHA256（バージョン変更時はハッシュも更新すること）
PYTHON_TGZ_SHA256="0f1a22f4dfd34595a29cf69ee7ea73b9eff8b1cc89d7ab29b3ab0ec04179dad8"
cd /usr/src
sudo wget -O Python-${PYTHON_VERSION}.tgz https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz

echo "Pythonソースのチェックサムを検証します"
echo "${PYTHON_TGZ_SHA256}  Python-${PYTHON_VERSION}.tgz" | sha256sum -c -

sudo tar xzf Python-${PYTHON_VERSION}.tgz
cd Python-${PYTHON_VERSION}
sudo ./configure --enable-optimizations
sudo make altinstall

# pip3.11 をインストールする（altinstallではpipが同梱されないため）。
# OSのpython3/pip3(3.9)はdnf等が使うため置き換えない（altinstallはそのための指定）。
# Haluは後段で作る仮想環境(haluv)側の3.11を使う。
sudo /usr/local/bin/python3.11 -m ensurepip

if rpm -q libreoffice-core > /dev/null 2>&1; then
    echo "LibreOfficeは既にインストールされています。"
else
    echo "LibreOfficeのインストール開始"
    sudo dnf -y install libreoffice-core libreoffice-calc libreoffice-langpack-ja
fi

sudo dnf -y install unzip zip

############################################################
# PostgreSQLインストール
############################################################
# Postgresユーザ登録
# OSログインパスワードは設定しない（パスワードロック状態のままにする）。
# 管理作業は管理アカウントから sudo -u で行う。DB_PASSWORDはDB接続専用。
if ! id "$DB_USERNAME" &>/dev/null; then
    echo "ユーザ '$DB_USERNAME' を作成中..."
    sudo adduser "$DB_USERNAME"

    echo "ユーザ '$DB_USERNAME' が作成されました（OSログインはロックのまま）。"
else
    echo "ユーザ '$DB_USERNAME' はすでに存在します。"
fi

# PostgreSQLダウンロード
# ダウンロード物の改ざん・破損検知用SHA256（バージョン変更時はハッシュも更新すること）
POSTGRES_TAR_SHA256="df5aaddcf7841457cbf9d31b7d79124a2057cdc7cdae47e8e0271c973546618e"
sudo wget -O /usr/local/src/postgresql-16.9.tar.gz https://ftp.postgresql.org/pub/source/v16.9/postgresql-16.9.tar.gz

echo "PostgreSQLソースのチェックサムを検証します"
echo "${POSTGRES_TAR_SHA256}  /usr/local/src/postgresql-16.9.tar.gz" | sha256sum -c -

# インストール先のディレクトリの作成
sudo mkdir -p /usr/local/postgresql-16.9

# 管理ユーザをPostgresユーザに変更する
sudo chown "$DB_USERNAME":"$DB_USERNAME" /usr/local/postgresql-16.9

# ダウンロードしたソースファイルを展開
cd /usr/local/src
sudo tar xvzf /usr/local/src/postgresql-16.9.tar.gz

# 展開したソースツリーの所有者をビルド実行ユーザに変更する
# （sudo tarで展開するとroot所有になり、非rootユーザでのconfigure/makeが権限エラーになるため）
sudo chown -R "$DB_USERNAME":"$DB_USERNAME" /usr/local/src/postgresql-16.9

# ユーザを切り替え(DB_EOFまで)
sudo -u "$DB_USERNAME" bash <<DB_EOF
# 途中のコマンドが失敗したら、そこで止める（親のset -eは子シェルに引き継がれない）
set -e

# 解凍したディレクトリに移動し、configureスクリプトを使ってインストール作業を行う
echo "PostgreSQLをインストールします。"
cd /usr/local/src/postgresql-16.9
./configure --prefix=/usr/local/postgresql-16.9
make
make install
DB_EOF

############################################################
# リラン対応
############################################################
# 作業用の一時ファイルは毎回消してよい
sudo rm -rf /tmp/sample.backup
sudo rm -rf /tmp/postgresql.service

# PostgreSQLのデータ領域は --clean のときだけ消す。
# --clean 無しでここへ到達するのは前提条件チェックをすべて通過した場合＝クリーン環境のはずで、
# その場合これらは存在しない。検出漏れがあったときに既存DBを巻き込まないよう、無条件では消さない。
if [ "$CLEAN_MODE" = "yes" ]; then
    sudo rm -rf $POSTGRE_HOME/sample.backup
    sudo rm -rf $POSTGRE_DATA
fi

############################################################
# .bash_profile 設定
############################################################
# ここからroot権限
echo ".bash_profileの追加を開始します。。。"
sudo -s <<ROOT_EOF
    # 途中のコマンドが失敗したら、そこで止める
    set -e

    # シンボリックリンク作成
    ln -fns /usr/local/postgresql-16.9 /usr/local/pgsql
    
    if grep -q "export PATH=" "$BASH_PROFILE"; then
        echo ".bash_profileの設定は対応済みです。"
    else
        # バックアップファイルの作成
        cp "$BASH_PROFILE" "${BASH_PROFILE}.bak_$(date +%Y%m%d_%H%M%S)"

        # .bash_profileに追加
        cat <<'EOT' >> "$BASH_PROFILE"
export PATH=\$PATH:/usr/bin:/usr/local/pgsql/bin
export POSTGRES_HOME=/usr/local/pgsql
export PGLIB=\$POSTGRES_HOME/lib
export PGDATA=\$POSTGRES_HOME/data
export MANPATH="\$MANPATH":\$POSTGRES_HOME/man
export LD_LIBRARY_PATH="\$LD_LIBRARY_PATH":"\$PGLIB"
EOT
    fi
ROOT_EOF
# ここまでroot権限


############################################################
# ld.so.conf 設定
############################################################
# ここからroot権限
echo "ld.so.confの追加を開始します。。。"
sudo -s <<ROOT_EOF
    # 途中のコマンドが失敗したら、そこで止める
    set -e

    if grep -q "include /etc/ld.so.conf.d/\*.conf" "$CONF_FILE"; then
        echo "include /etc/ld.so.conf.d/*.confはld.so.confに設定済み"
    
    elif grep -q "include ld.so.conf.d/\*.conf" "$CONF_FILE"; then

        # バックアップファイルの作成
        cp "$CONF_FILE" "${CONF_FILE}.bak_$(date +%Y%m%d_%H%M%S)"
    
        sed -i -E 's|^#?\s*include\s+ld\.so\.conf\.d/\*\.conf|include /etc/ld.so.conf.d/*.conf|' "$CONF_FILE"
        echo "ld.so.confの設定は、include /etc/ld.so.conf.d/*.confへ書き換えました。"
    fi

    if grep -q "/usr/local/pgsql/lib" "$CONF_FILE"; then
        echo "ld.so.confの設定は対応済みです。"
    else
        # バックアップファイルの作成
        cp "$CONF_FILE" "${CONF_FILE}.bak_$(date +%Y%m%d_%H%M%S)"
      
        # ファイルの最後尾に追記
        echo "/usr/local/pgsql/lib" >> $CONF_FILE
    fi

    # ldconfigコマンドを実行して設定を有効にする
    ldconfig

ROOT_EOF
# ここまでroot権限

############################################################
# PostgreSQL データベースの初期化・シンボリックリンク作成
############################################################
# ここからpostgres権限
sudo -u "$DB_USERNAME" bash <<DB_EOF
# 途中のコマンドが失敗したら、そこで止める
set -e

# DBスーパーユーザのパスワードファイルを一時作成する（initdbに渡す）
umask 077
echo "$DB_PASSWORD" > /home/$DB_USERNAME/.halu_db_pwfile

# 初期化（ローカル接続も含めパスワード認証(scram-sha-256)を必須にし、
# DBスーパーユーザにパスワードを設定する）
/usr/local/postgresql-16.9/bin/initdb -D $POSTGRE_DATA -A scram-sha-256 --pwfile=/home/$DB_USERNAME/.halu_db_pwfile

# パスワードファイルを削除する
rm -f /home/$DB_USERNAME/.halu_db_pwfile

# baseフォルダの削除
rm -rf $POSTGRE_HOME/base

# シンボリックリンク作成
cd $POSTGRE_DATA
mv $POSTGRE_DATA/base $POSTGRE_HOME
ln -nfs $POSTGRE_HOME/base $POSTGRE_DATA/base

DB_EOF
# ここまでpostgres権限

############################################################
# PostgreSQLの自動起動スクリプトを新規登録
############################################################
sudo tee $POSTGRE_SERVICE_FILE > /dev/null <<ROOT_EOF
# Halu用に作成したPostgreSQL（ソースビルド版）のsystemdユニット。
# 管理者が作成するユニットのため /etc/systemd/system 配下に配置する。

[Unit]
Description=PostgreSQL database server
After=network.target

[Service]
Type=forking

User=$DB_USERNAME
Group=$DB_USERNAME

# Port number for server to listen on
Environment=PGPORT=$DB_PORT

# Location of database directory
Environment=PGDATA=/usr/local/pgsql/data

# Where to send early-startup messages from the server (before the logging
# options of postgresql.conf take effect)
# This is normally controlled by the global default set by systemd
# StandardOutput=syslog

# Disable OOM kill on the postmaster
OOMScoreAdjust=-1000

#ExecStartPre=/usr/local/pgsql/bin/postgresql-check-db-dir \${PGDATA} <=このモジュールは存在しないのでコメント
ExecStart=/usr/local/pgsql/bin/pg_ctl start -D \${PGDATA} -s -o "-p \${PGPORT}" -w -t 300
ExecStop=/usr/local/pgsql/bin/pg_ctl stop -D \${PGDATA} -s -m fast
ExecReload=/usr/local/pgsql/bin/pg_ctl reload -D \${PGDATA} -s

# Give a reasonable amount of time for the server to start up/shut down
TimeoutSec=300

[Install]
WantedBy=multi-user.target

ROOT_EOF

############################################################
# PostgreSQL サービス起動設定
############################################################
# ユニットファイルの新規作成・変更をsystemdに反映する
sudo systemctl daemon-reload

# サービスを起動する
sudo systemctl start postgresql

# サービスを自動起動する設定を行う
sudo systemctl enable postgresql


############################################################
# postgresql.conf 設定
############################################################
# ユーザを切り替え(DB_EOFまで)
sudo -u "$DB_USERNAME" bash <<DB_EOF
# 途中のコマンドが失敗したら、そこで止める
set -e

if [ -f "$POSTGRE_CONF" ]; then

    # バックアップファイルの作成
    cp "$POSTGRE_CONF" "${POSTGRE_CONF}.bak_$(date +%Y%m%d_%H%M%S)"

    # postgresql.confの設定値を変更する
    sed -i -E "s/^#?\s*log_destination\s*=\s*'stderr'/log_destination = 'syslog'/" "$POSTGRE_CONF"
    sed -i -E "s/^#?\s*log_statement\s*=\s*'none'/log_statement = 'all'/" "$POSTGRE_CONF"
    # listen_addressesは既定(localhost)のまま変更しない。Webアプリは同一サーバー内からDBへ接続するため影響なし。
    # 外部からDBへ直接接続する必要が生じた場合のみ、postgresql.conf・pg_hba.conf・firewalldをあわせて設定すること。
    sed -i -E "s/^#?\s*port\s*=\s*[0-9]+/port = $DB_PORT/" "$POSTGRE_CONF"
    sed -i -E "s/^#?\s*password_encryption\s*=\s*\S+/password_encryption = scram-sha-256/" "$POSTGRE_CONF"

else
    echo "postgresql.confが見つかりません: $POSTGRE_CONF"
    exit 1
fi
DB_EOF

############################################################
# PostgreSQL .bashrc 設定
############################################################
# ユーザを切り替え(EOFまで)
sudo -u "$DB_USERNAME" bash <<DB_EOF
    # 途中のコマンドが失敗したら、そこで止める
    set -e

    # ※このheredoc内はシングルクォート中でも親シェルが変数展開するため、
    #   .bashrcへ追記する \$PATH はエスケープして「\$PATH」の文字列のまま書き込む（B-2）
    if grep -qF 'export PATH=\$PATH:/usr/local/pgsql/bin' "$BASHRC"; then
        echo ".bashrcの設定は対応済みです。"
    else
        # バックアップファイルの作成
        cp "$BASHRC" "${BASHRC}.bak_$(date +%Y%m%d_%H%M%S)"

        echo 'export PATH=\$PATH:/usr/local/pgsql/bin' >> "$BASHRC"

    fi
DB_EOF


############################################################
# PostgreSQL・rsyslog 再起動
############################################################
# sudo systemctl restart rsyslog
sudo systemctl restart postgresql

############################################################
# 一般ユーザ作成(SRV_USERNAME)
############################################################
if ! id "$SRV_USERNAME" &>/dev/null; then
    echo "ユーザ '$SRV_USERNAME' を作成中..."
    sudo adduser "$SRV_USERNAME"
    
    echo "パスワード設定中..."
    echo "$SRV_USERNAME:$SRV_PASSWORD" | sudo chpasswd

    echo "ユーザ '$SRV_USERNAME' が作成され、パスワードが設定されました。"
else
    echo "ユーザ '$SRV_USERNAME' はすでに存在します。"
fi

############################################################
# 仮想環境(haluv)作成
############################################################
sudo -u "$SRV_USERNAME" mkdir -p "$VENV_DIR"
sudo -u "$SRV_USERNAME" /usr/local/bin/python3.11 -m venv "$VENV_DIR"

############################################################
# 配布ソースの取得
############################################################
# 取得元は.envで切り替えられる（既定は本番リポジトリのmaster）。
# 展開はSRV_USERNAME権限で行うため、ここでホーム直下へ置いて所有者を移しておく。
SOURCE_ZIP_PATH="/home/$SRV_USERNAME/halu_source.zip"

if [ -n "$SOURCE_ZIP_FILE" ]; then
    echo "ローカルのzipから配布ソースを取得します: $SOURCE_ZIP_FILE"
    sudo cp "$SOURCE_ZIP_FILE" "$SOURCE_ZIP_PATH"
else
    echo "配布ソースをダウンロードします: $SOURCE_ZIP_URL"
    # -f を付けてHTTPエラーを失敗として扱う（エラーページをzipとして保存させない）
    sudo curl -fL -o "$SOURCE_ZIP_PATH" "$SOURCE_ZIP_URL"
fi

sudo chown "$SRV_USERNAME":"$SRV_USERNAME" "$SOURCE_ZIP_PATH"

# zipとして読めることを確認する（取得元の指定を誤ったときはここで止める）。
# 置き場所の /home/$SRV_USERNAME は 0700 で実行者からは読めないため、sudo を通す。
if ! sudo test -f "$SOURCE_ZIP_PATH"; then
    echo "配布ソースの取得に失敗しました（ファイルがありません）: $SOURCE_ZIP_PATH"
    exit 1
fi
if ! sudo -u "$SRV_USERNAME" unzip -tq "$SOURCE_ZIP_PATH" >/dev/null 2>&1; then
    echo "取得したファイルがzipとして読めません: $SOURCE_ZIP_PATH"
    echo "取得元: ${SOURCE_ZIP_FILE:-$SOURCE_ZIP_URL}"
    echo "SOURCE_ZIP_URL / SOURCE_ZIP_FILE の指定を確認してください。"
    echo "--- ファイルの先頭200バイト ---"
    sudo head -c 200 "$SOURCE_ZIP_PATH"
    echo ""
    echo "------------------------------"
    exit 1
fi

############################################################
# 仮想環境(haluv)にてコマンドを実行
############################################################
# ユーザを切り替え(SRV_EOFまで)
sudo -u "$SRV_USERNAME" bash <<SRV_EOF
# 途中のコマンドが失敗したら、そこで止める
set -e

# 作成した仮想環境を起動する
source "$VENV_DIR/bin/activate"

# .bash_profileに追加
if grep -q "export PYTHONPATH" "$VENV_BASH_FILE"; then
    echo ".bash_profileの設定は対応済みです。"
else 

    # バックアップファイルの作成
    cp "$VENV_BASH_FILE" "${VENV_BASH_FILE}.bak_$(date +%Y%m%d_%H%M%S)"

    # PATHが未設定の場合のみ追加
    # （子シェルで展開されないよう引用付きheredoc('EOT')で追記する。\$PATHは文字列のまま書き込まれる）
    if ! grep -q "export PATH" "$VENV_BASH_FILE"; then
    cat <<'EOT' >> "$VENV_BASH_FILE"

PATH="\$PATH:/usr/bin:/usr/local/pgsql/bin"
export PATH

EOT
    fi

    # PYTHONPATHは常に追加
    cat <<'EOT' >> "$VENV_BASH_FILE"

PYTHONPATH="/home/$SRV_USERNAME/HaluServer/Halu:/home/$SRV_USERNAME/HaluServer/Halu/System/Server/Libraries"
export PYTHONPATH

EOT
fi

# .bashrcに追加
if grep -qF ". /home/$SRV_USERNAME/haluv/bin/activate" "$VENV_BASHRC"; then
    echo ".bashrcの設定は対応済みです。"
else
    # バックアップファイルの作成
    cp "$VENV_BASHRC" "${VENV_BASHRC}.bak_$(date +%Y%m%d_%H%M%S)"

    echo ". /home/$SRV_USERNAME/haluv/bin/activate" >> $VENV_BASHRC

fi

# pythonパッケージインストール
# ここから先は仮想環境(haluv)の中で実行する。venvは /usr/local/bin/python3.11 で
# 作成し、上でactivate済みのため python / pip は 3.11 を指す。
# バージョンはリポジトリ直下の requirements.txt を正とする。
# requirements.txt をそのまま使わないのは、開発用ツール(pytest/flake8)が
# 含まれており本番サーバーへ入れたくないため。個別指定でバージョンだけ揃える。
python -m pip install --upgrade pip
pip install uvicorn==0.52.4
pip install starlette[full]==1.6.0
pip install sqlalchemy==1.4.29
pip install psycopg2-binary==2.9.6
pip install openpyxl
pip install pandas
pip install msgpack-rpc-python
pip install bcrypt
# starlette 1.6.0 が typing_extensions>=4.10.0 を要求するため、あわせて更新する
pip install typing_extensions==4.16.0

# 作業ディレクトリへ移動
cd /home/$SRV_USERNAME


############################################################
# リラン対応
############################################################
# 展開先に同名のディレクトリが中身入りで残っていると、下のmvが
# 「mv: cannot move ... : Directory not empty」で失敗し、set -e によりインストールが中断する。
# そのため展開物と同名のものを先に消しておく。対象はzipの中身から機械的に求めるため、
# リポジトリ直下の構成が増減しても取りこぼさない。
FIRST_ENTRY=\$(unzip -Z1 "$SOURCE_ZIP_PATH" | head -1)
case "\$FIRST_ENTRY" in
    */*) SRC_DIR=\${FIRST_ENTRY%%/*} ;;
    *)   echo "zipの構造を判別できません（先頭がディレクトリではありません）: \$FIRST_ENTRY"; exit 1 ;;
esac

unzip -Z1 "$SOURCE_ZIP_PATH" | sed -e "s|^\${SRC_DIR}/||" -e 's|/.*\$||' | sort -u | while IFS= read -r ITEM; do
    case "\$ITEM" in
        # 想定外の名前でrm -rfを実行しないための保護
        ""|"."|".."|/*|*/*) continue ;;
        # ダウンロードして実行する場合、実行中のスクリプト自身が
        # /home/$SRV_USERNAME/install_scripts に置かれている可能性があるため消さない
        install_scripts)    continue ;;
    esac
    rm -rf "/home/$SRV_USERNAME/\$ITEM"
done

# 旧バージョンのキットが配置していたもの（現在のzipには含まれないため個別に消す）
rm -rf "/home/$SRV_USERNAME/.gitattributes"
rm -rf "/home/$SRV_USERNAME/.gitignore"

# 配布ソースを展開する
unzip -q "$SOURCE_ZIP_PATH"

# 解凍後にフォルダ位置を調整する
# 隠しファイルごと移動する為のコマンド
shopt -s dotglob nullglob
mv "\$SRC_DIR"/* .
rm -rf "\$SRC_DIR"
shopt -u dotglob nullglob

# 展開に使ったzipは残さない
rm -f "$SOURCE_ZIP_PATH"

############################################################
# haluconf.pyのパスを変更する
############################################################
# 現在値に依存しないパターンで書き換える（'/'始まりのLinuxパスのみ対象。Windows用パス(C:/等)の行は書き換えない）
sed -i -E "s|self\.__serverpath[[:space:]]*=[[:space:]]*'/[^']*'|self.__serverpath = '/home/$SRV_USERNAME/HaluServer'|" "$HALU_CONF"
sed -i -E "s|self\.__syspath[[:space:]]*=[[:space:]]*'/[^']*'|self.__syspath    = '/home/$SRV_USERNAME/HaluServer/Halu/System'|" "$HALU_CONF"
sed -i -E "s|self\.__apppath[[:space:]]*=[[:space:]]*'/[^']*'|self.__apppath    = '/home/$SRV_USERNAME/HaluProject/Halu/Application'|" "$HALU_CONF"

############################################################
# haluconf.pyのport・DB接続情報を変更する
############################################################
# haluconf.pyのDB設定は「環境変数があればそれを使い、無ければ第2引数の既定値を使う」形になっている。
#   database0['portno']   = os.environ.get('DATABASE_PORT', '55432')
# インストール後のサーバーではDATABASE_*環境変数を設定しないため、既定値の側を書き換える。
# （Docker開発環境と同じ構造を保つため、os.environ.get の形自体は崩さない）
sed -i -E "s|(database0\['portno'\][[:space:]]*=[[:space:]]*os\.environ\.get\('DATABASE_PORT',[[:space:]]*)'[^']*'|\1'$DB_PORT'|" "$HALU_CONF"
sed -i -E "s|(database0\['username'\][[:space:]]*=[[:space:]]*os\.environ\.get\('DATABASE_USER',[[:space:]]*)'[^']*'|\1'$DB_USERNAME'|" "$HALU_CONF"
sed -i -E "s|(database0\['password'\][[:space:]]*=[[:space:]]*os\.environ\.get\('DATABASE_PASSWORD',[[:space:]]*)'[^']*'|\1'$DB_PASSWORD'|" "$HALU_CONF"

# database1(haluassistant)・database3(haludocgen)は今回の配布物に含めないため書き換えない。
# 定義が残っていても、接続処理(database.py)がDB名で引くだけなので参照されなければ影響しない。

############################################################
# haluconf.pyの書き換え結果を検証する
############################################################
# sedはパターン不一致でも正常終了するため、期待値が実際に書き込まれたことを確認する
grep -qF "self.__serverpath = '/home/$SRV_USERNAME/HaluServer'" "$HALU_CONF" || { echo "haluconf.py書き換え失敗: serverpath"; exit 1; }
grep -qF "self.__syspath    = '/home/$SRV_USERNAME/HaluServer/Halu/System'" "$HALU_CONF" || { echo "haluconf.py書き換え失敗: syspath"; exit 1; }
grep -qF "self.__apppath    = '/home/$SRV_USERNAME/HaluProject/Halu/Application'" "$HALU_CONF" || { echo "haluconf.py書き換え失敗: apppath"; exit 1; }
grep -qF "database0['portno']   = os.environ.get('DATABASE_PORT', '$DB_PORT')" "$HALU_CONF" || { echo "haluconf.py書き換え失敗: database0 portno"; exit 1; }
grep -qF "database0['username'] = os.environ.get('DATABASE_USER', '$DB_USERNAME')" "$HALU_CONF" || { echo "haluconf.py書き換え失敗: database0 username"; exit 1; }
grep -qF "database0['password'] = os.environ.get('DATABASE_PASSWORD', '$DB_PASSWORD')" "$HALU_CONF" || { echo "haluconf.py書き換え失敗: database0 password"; exit 1; }
echo "haluconf.pyの書き換えを確認しました。"
SRV_EOF

############################################################
# DBリストア作業を行う
############################################################
# ユーザをSRV_USERNAMEへ切り替え(SRV_EOFまで)
sudo -u "$SRV_USERNAME" bash <<SRV_EOF
# 途中のコマンドが失敗したら、そこで止める
set -e

# DBバックアップファイルを別の場所へコピーする
cp /home/$SRV_USERNAME/HaluProject/Halu/Application/Sample/バックアップ/sample.backup /tmp

SRV_EOF

# root権限で所有者をDB_USERNAMEに変更する
sudo chown $DB_USERNAME:$DB_USERNAME /tmp/sample.backup

# ユーザをpostgresへ切り替え(DB_EOFまで)
sudo -u "$DB_USERNAME" bash <<DB_EOF
# 途中のコマンドが失敗したら、そこで止める
set -e

# DBバックアップファイルを別の場所へコピーする
mv /tmp/sample.backup /home/$DB_USERNAME

# 作業ディレクトリへ移動
cd /home/$DB_USERNAME

# ---------------------------------------
# psqlモードでコマンドを実施する
# ---------------------------------------
PGPASSWORD="$DB_PASSWORD" /usr/local/pgsql/bin/psql -v ON_ERROR_STOP=1 -U "$DB_USERNAME" -h localhost -p "$DB_PORT" -d postgres <<EOF

-- データベース作成
create database "$DB_NAME";

-- ユーザ作成（リストア用の一時ユーザ。リストア完了後に削除する）
create user "$DB_BACKUP_USERNAME" superuser createrole createdb password '$DB_BACKUP_PASSWORD';

EOF

# ---------------------------------------
# リストア実施
# ---------------------------------------

# DBバックアップファイルの権限を変更
chmod 755 ./sample.backup

# リストア作業を行う
PGPASSWORD="$DB_BACKUP_PASSWORD" /usr/local/pgsql/bin/pg_restore -U "$DB_BACKUP_USERNAME" -h localhost -p "$DB_PORT" -d "$DB_NAME" sample.backup

# オーナー変更を行う
PGPASSWORD="$DB_PASSWORD" /usr/local/pgsql/bin/psql -v ON_ERROR_STOP=1 -U "$DB_USERNAME" -h localhost -p "$DB_PORT" -d "$DB_NAME" -c "REASSIGN OWNED BY $DB_BACKUP_USERNAME TO $DB_USERNAME;"

# ---------------------------------------
# psqlモードでコマンドを実施する
# ---------------------------------------
PGPASSWORD="$DB_PASSWORD" /usr/local/pgsql/bin/psql -v ON_ERROR_STOP=1 -U "$DB_USERNAME" -h localhost -p "$DB_PORT" -d postgres <<EOF

-- ユーザ削除
drop user "$DB_BACKUP_USERNAME";

EOF

DB_EOF

echo "インストール 完了"
